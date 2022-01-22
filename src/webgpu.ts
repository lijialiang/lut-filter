export default async ({
  canvas,
  image,
  filterImage
}: {
  canvas: HTMLCanvasElement
  image: HTMLImageElement
  filterImage: HTMLImageElement
}) => {
  canvas.width = image.width
  canvas.height = image.height

  const adapter = await window.navigator.gpu.requestAdapter()

  if (adapter === null) {
    throw new Error('Browser does not support WebGPU.')
  }

  const device = await adapter.requestDevice()
  const context = canvas.getContext('webgpu')

  if (context === null) {
    throw new Error('Browser does not support WebGPU.')
  }

  context.configure({
    device: device,
    format: 'bgra8unorm'
  })

  const vertices =  new Float32Array([
    -1.0, 1.0, 0.0, 1.0, 0.0, 1.0,
    -1.0, -1.0, 0.0, 1.0, 0.0, 0.0,
    1.0, -1.0, 0.0, 1.0, 1.0, 0.0,
    1.0, -1.0, 0.0, 1.0, 1.0, 0.0,
    1.0, 1.0, 0.0, 1.0, 1.0, 1.0,
    -1.0, 1.0, 0.0, 1.0, 0.0, 1.0,
  ])

  const verticesBuffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true
  })
  new Float32Array(verticesBuffer.getMappedRange()).set(vertices)
  verticesBuffer.unmap()

  // image texture
  await image.decode()
  const textureSize = {
    width: image.width,
    height: image.height,
  }
  const imageTexture = device.createTexture({
    size: textureSize,
    dimension: '2d',
    format: 'rgba8unorm',
    usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
  })
  device.queue.copyExternalImageToTexture({
    source: await createImageBitmap(image)
  }, {
    texture: imageTexture,
    mipLevel: 0
  }, textureSize)

  // filter texture
  await filterImage.decode()
  const filterImageSize = {
    width: filterImage.width,
    height: filterImage.height,
  }
  const filterImageTexture = device.createTexture({
    size: filterImageSize,
    dimension: '2d',
    format: 'rgba8unorm',
    usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
  })
  device.queue.copyExternalImageToTexture({
    source: await createImageBitmap(filterImage)
  }, {
    texture: filterImageTexture,
    mipLevel: 0
  }, filterImageSize)

  // shader
  const shaderModule = device.createShaderModule({
    code: `
struct VertexOut {
  [[builtin(position)]] position : vec4<f32>;
  [[location(0)]] texCoords : vec2<f32>;
};

[[group(0), binding(0)]] var linearSampler: sampler;
[[group(0), binding(1)]] var imageTexture: texture_2d<f32>;
[[group(0), binding(2)]] var filterImageTexture: texture_2d<f32>;

[[stage(vertex)]]
fn vertex_main(
  [[location(0)]] position: vec4<f32>,
  [[location(1)]] texCoords: vec2<f32>
) -> VertexOut
{
  var output: VertexOut;
  output.position = position;
  output.texCoords = texCoords;
  output.texCoords.y = 1. - output.texCoords.y;
  return output;
}

[[stage(fragment)]]
fn fragment_main(fragData: VertexOut) -> [[location(0)]] vec4<f32>
{
  var textureColor = textureSample(imageTexture, linearSampler, fragData.texCoords).rgba;
  var blueColor = textureColor.b * 63.0;

  var quad1: vec2<f32>;
  quad1.y = floor(floor(blueColor) * 0.125);
  quad1.x = floor(blueColor) - (quad1.y * 8.0);

  var quad2: vec2<f32>;
  quad2.y = floor(ceil(blueColor) * 0.125);
  quad2.x = ceil(blueColor) - (quad2.y * 8.0);

  var texPos1: vec2<f32>;
  texPos1.x = ((quad1.x * 64.0) +  textureColor.r * 63.0 + 0.5)/512.0;
  texPos1.y = ((quad1.y * 64.0) +  textureColor.g * 63.0 + 0.5)/512.0;

  var texPos2: vec2<f32>;
  texPos2.x = ((quad2.x * 64.0) +  textureColor.r * 63.0 + 0.5)/512.0;
  texPos2.y = ((quad2.y * 64.0) +  textureColor.g * 63.0 + 0.5)/512.0;

  var newColor1 = textureSample(filterImageTexture, linearSampler, texPos1);
  var newColor2 = textureSample(filterImageTexture, linearSampler, texPos2);

  return mix(newColor1, newColor2, fract(blueColor));
}
    `
  })

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [{
      binding: 0,
      visibility: GPUShaderStage.FRAGMENT,
      sampler: {}
    }, {
      binding: 1,
      visibility: GPUShaderStage.FRAGMENT,
      texture: {}
    }, {
      binding: 2,
      visibility: GPUShaderStage.FRAGMENT,
      texture: {}
    }]
  })

  const textureSampler = device.createSampler({
    magFilter: 'nearest',
    minFilter: 'nearest',
    addressModeU: 'clamp-to-edge',
    addressModeV: 'clamp-to-edge',
  })

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: textureSampler
      },
      {
        binding: 1,
        resource: imageTexture.createView()
      },
      {
        binding: 2,
        resource: filterImageTexture.createView()
      }
    ]
  })

  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [
      bindGroupLayout
    ]
  })

  const vertexVertexAttribute: GPUVertexAttribute = {
    format: 'float32x4',
    offset: 0,
    shaderLocation: 0,
  }

  const fragmentVertexAttribute: GPUVertexAttribute = {
    format: 'float32x2',
    offset: 16,
    shaderLocation: 1
  }

  const vertexAttributes: Iterable<GPUVertexAttribute> = [
    vertexVertexAttribute,
    fragmentVertexAttribute
  ]

  const vertexBufferLayout: GPUVertexBufferLayout = {
    attributes: vertexAttributes,
    arrayStride: 24,
    stepMode: 'vertex'
  }

  const vertexBuffers: Iterable<GPUVertexBufferLayout> = [
    vertexBufferLayout
  ]

  const colorTargetState: GPUColorTargetState = {
    format: 'bgra8unorm'
  }

  const renderPipeline = device.createRenderPipeline({
    layout: pipelineLayout,
    vertex: {
      module: shaderModule,
      entryPoint: 'vertex_main',
      buffers: vertexBuffers
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fragment_main',
      targets: [
        colorTargetState
      ]
    },
    primitive: {
      topology: 'triangle-list',
      frontFace: 'ccw',
      cullMode: 'back'
    },
  })

  const commandEncoder = device.createCommandEncoder()

  const renderPassColorAttachment: GPURenderPassColorAttachment = {
    storeOp: 'store',
    view: context.getCurrentTexture().createView(),
    loadValue: { r: 0, g: 0, b: 0, a: 1.0 },
  }

  const renderPassDescriptor: GPURenderPassDescriptor = {
    colorAttachments: [
      renderPassColorAttachment
    ]
  }

  const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
  passEncoder.setPipeline(renderPipeline)
  passEncoder.setVertexBuffer(0, verticesBuffer)
  passEncoder.setBindGroup(0, bindGroup)
  passEncoder.draw(6, 2, 0, 0)
  passEncoder.endPass()

  device.queue.submit([commandEncoder.finish()])
}
