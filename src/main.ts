const VERTEX_SHADER_TEXT = `
attribute vec4 a_position;
attribute vec2 a_texCoord;

varying vec2 v_texCoord;

void main() {
  gl_Position = a_position;
  v_texCoord = 1.0 - a_texCoord;
}
`

const FRAGMENT_SHADER_TEXT = `
precision mediump float;

varying vec2 v_texCoord;
uniform sampler2D u_image0;
uniform sampler2D u_image1;

void main() {
  vec4 textureColor = texture2D(u_image0, v_texCoord);
  float blueColor = textureColor.b * 63.0;
  vec2 quad1;
  quad1.y = floor(floor(blueColor) / 8.0);
  quad1.x = floor(blueColor) - (quad1.y * 8.0);
  vec2 quad2;
  quad2.y = floor(ceil(blueColor) / 8.0);
  quad2.x = ceil(blueColor) - (quad2.y * 8.0);
  vec2 texPos1;
  texPos1.x = (quad1.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);
  texPos1.y = (quad1.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g);
  vec2 texPos2;
  texPos2.x = (quad2.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);
  texPos2.y = (quad2.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g);
  lowp vec4 newColor1 = texture2D(u_image1, texPos1);
  lowp vec4 newColor2 = texture2D(u_image1, texPos2);
  lowp vec4 newColor = mix(newColor1, newColor2, fract(blueColor));
  gl_FragColor = mix(textureColor, vec4(newColor.rgb, textureColor.w), 1.0);
}
`

/**
 * Render image based on LUT filter image.
 * @param {Object} options
 * @param {HTMLCanvasElement} options.canvas
 * @param {HTMLImageElement} options.filterImage
 * @param {HTMLImageElement} options.image
 */
export default ({ canvas, filterImage, image }: {
  canvas: HTMLCanvasElement,
  filterImage: HTMLImageElement,
  image: HTMLImageElement
}): void => {
  canvas.width = image.width
  canvas.height = image.height

  const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })
  if (gl === null) throw new Error('gl null')

  const VERTEX_SHADER = gl.createShader(gl.VERTEX_SHADER)
  if (VERTEX_SHADER === null) throw new Error('VERTEX_SHADER null')
  gl.shaderSource(VERTEX_SHADER, VERTEX_SHADER_TEXT)
  gl.compileShader(VERTEX_SHADER)
  gl.getShaderParameter(VERTEX_SHADER, gl.COMPILE_STATUS)

  const FRAGMENT_SHADER = gl.createShader(gl.FRAGMENT_SHADER)
  if (FRAGMENT_SHADER === null) throw new Error('FRAGMENT_SHADER null')
  gl.shaderSource(FRAGMENT_SHADER, FRAGMENT_SHADER_TEXT)
  gl.compileShader(FRAGMENT_SHADER)
  gl.getShaderParameter(FRAGMENT_SHADER, gl.COMPILE_STATUS)

  const program = gl.createProgram()
  if (program === null) throw new Error('program null')
  gl.attachShader(program, VERTEX_SHADER)
  gl.attachShader(program, FRAGMENT_SHADER)
  gl.linkProgram(program)

  // VERTEX
  const positionLocation = gl.getAttribLocation(program, 'a_position')
  const texcoordLocation = gl.getAttribLocation(program, 'a_texCoord')

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1.0, 1.0,
    -1.0, -1.0,
    1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0,
    -1.0, 1.0,
  ]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

  const texcoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
  ]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(texcoordLocation)
  gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0)

  // FRAGMENT
  const u_image0Location = gl.getUniformLocation(program, 'u_image0')
  const u_image1Location = gl.getUniformLocation(program, 'u_image1')

  const image_texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, image_texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

  const filterImage_texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, filterImage_texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, filterImage)

  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.useProgram(program)

  gl.uniform1i(u_image0Location, 0)
  gl.uniform1i(u_image1Location, 1)

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, image_texture)
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, filterImage_texture)

  // draw
  gl.drawArrays(gl.TRIANGLES, 0, 6)
}
