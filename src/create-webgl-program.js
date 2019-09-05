function createWebglProgram (gl, shaderObjects) {
  const shaders = []

  for (var i = 0; i < shaderObjects.length; ++i) {
    let { type, text } = shaderObjects[i]

    if (type === 'x-shader/x-vertex') {
      type = gl.VERTEX_SHADER
    } else if (type === 'x-shader/x-fragment') {
      type = gl.FRAGMENT_SHADER
    }

    const shader = gl.createShader(type)

    gl.shaderSource(shader, text)
    gl.compileShader(shader)
    gl.getShaderParameter(shader, gl.COMPILE_STATUS)

    shaders.push(shader)
  }

  const program = gl.createProgram()

  shaders.forEach(shader => gl.attachShader(program, shader))

  gl.linkProgram(program)

  return program
}

export default createWebglProgram
