
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.lutFilter = factory());
}(this, (function () { 'use strict';

  var VERTEX_SHADER_TEXT = "\nattribute vec2 a_position;\nattribute vec2 a_texCoord;\n\nuniform vec2 u_resolution;\nvarying vec2 v_texCoord;\n\nvoid main() {\n  vec2 zeroToOne = a_position / u_resolution;\n  vec2 zeroToTwo = zeroToOne * 2.0;\n  vec2 clipSpace = zeroToTwo - 1.0;\n  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);\n  v_texCoord = a_texCoord;\n}\n";
  var FRAGMENT_SHADER_TEXT = "\nprecision mediump float;\n\nvarying lowp vec2 v_texCoord;\nuniform sampler2D u_image0;\nuniform sampler2D u_image1;\n\nvoid main() {\n  vec4 textureColor = texture2D(u_image0, v_texCoord);\n  float blueColor = textureColor.b * 63.0;\n  vec2 quad1;\n  quad1.y = floor(floor(blueColor) / 8.0);\n  quad1.x = floor(blueColor) - (quad1.y * 8.0);\n  vec2 quad2;\n  quad2.y = floor(ceil(blueColor) / 8.0);\n  quad2.x = ceil(blueColor) - (quad2.y * 8.0);\n  vec2 texPos1;\n  texPos1.x = (quad1.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);\n  texPos1.y = (quad1.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g);\n  vec2 texPos2;\n  texPos2.x = (quad2.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);\n  texPos2.y = (quad2.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g);\n  lowp vec4 newColor1 = texture2D(u_image1, texPos1);\n  lowp vec4 newColor2 = texture2D(u_image1, texPos2);\n  lowp vec4 newColor = mix(newColor1, newColor2, fract(blueColor));\n  gl_FragColor = mix(textureColor, vec4(newColor.rgb, textureColor.w), 1.0);\n}\n";
  var main = (function (_ref) {
    var canvas = _ref.canvas,
        filterImage = _ref.filterImage,
        image = _ref.image;
    var gl = canvas.getContext('webgl', {
      preserveDrawingBuffer: true
    });
    var VERTEX_SHADER = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(VERTEX_SHADER, VERTEX_SHADER_TEXT);
    gl.compileShader(VERTEX_SHADER);
    gl.getShaderParameter(VERTEX_SHADER, gl.COMPILE_STATUS);
    var FRAGMENT_SHADER = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(FRAGMENT_SHADER, FRAGMENT_SHADER_TEXT);
    gl.compileShader(FRAGMENT_SHADER);
    gl.getShaderParameter(FRAGMENT_SHADER, gl.COMPILE_STATUS);
    var program = gl.createProgram();
    gl.attachShader(program, VERTEX_SHADER);
    gl.attachShader(program, FRAGMENT_SHADER);
    gl.linkProgram(program);
    var positionLocation = gl.getAttribLocation(program, 'a_position');
    var texcoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]), gl.STATIC_DRAW);
    var resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    var u_image0Location = gl.getUniformLocation(program, 'u_image0');
    var u_image1Location = gl.getUniformLocation(program, 'u_image1');
    canvas.width = image.width;
    canvas.height = image.height;
    var image_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, image_texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    var filterImage_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, filterImage_texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, filterImage);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, canvas.width, 0, 0, canvas.height, 0, canvas.height, canvas.width, 0, canvas.width, canvas.height]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texcoordLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform1i(u_image0Location, 0);
    gl.uniform1i(u_image1Location, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, image_texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, filterImage_texture);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  });

  return main;

})));
//# sourceMappingURL=webgl-lut-filter.js.map
