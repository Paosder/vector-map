type ShaderType = WebGLRenderingContext['VERTEX_SHADER'] | WebGLRenderingContext['FRAGMENT_SHADER'];

/**
  * Create and compile shader.
  * @param gl webGL context.
  * @param type Shader type. `vertex_shader | fragment_shader`
  * @param source GLSL code.
  */
export function createShader(gl : WebGLRenderingContext, type: ShaderType, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('cannot create shader.');
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (success) {
    // shader compile success.
    return shader;
  }

  // 실패. 로그 추출 후 에러.
  const infoLog = gl.getShaderInfoLog(shader);
  gl.deleteShader(shader);
  throw new Error(`shader compile failed,
  info: ${infoLog}`);
}

/**
 * Create and link program.
 * @param gl webGL context.
 * @param vertexShader vertex shader.
 * @param fragmentShader fragment shader.
 */
export function createProgram(gl: WebGLRenderingContext,
  vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
  const program = gl.createProgram();
  if (!program) {
    throw new Error('cannot create program.');
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  const infoLog = gl.getProgramInfoLog(program);
  gl.deleteProgram(program);
  throw new Error(`program link failed,
  info: ${infoLog}`);
}
