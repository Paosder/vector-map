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

  // failed to compile.
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

export interface Attribute {
  loc: number;
  buffer: WebGLBuffer;
  arr: Float32Array;
  isDirty: boolean;
  isResized: boolean;
  usage: number;
}

export interface AttrOptions {
  name: string;
  size: number;
  length: number;
  defaultData?: Float32Array;
  usage?: number;
}

export function createAttribute(gl: WebGLRenderingContext, program: WebGLProgram, opt: AttrOptions): Attribute {
  const buffer = gl.createBuffer();
  if (!buffer) {
    throw new Error('Cannot create buffer!');
  }
  const usage = opt.usage ?? gl.STATIC_DRAW;
  const arr = opt.defaultData ?? new Float32Array(opt.length * opt.size);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, arr, usage);

  const loc = gl.getAttribLocation(program, opt.name);
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, opt.size, gl.FLOAT, false, 0, 0);

  return {
    loc,
    buffer,
    arr,
    isDirty: false,
    isResized: false,
    usage,
  };
}

export function updateAttribute(gl: WebGLRenderingContext, program: WebGLProgram, attr: Attribute) {
  if (attr.isDirty) {
    gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
    if (attr.isResized) {
      gl.bufferData(gl.ARRAY_BUFFER, attr.arr, attr.usage);
      attr.isResized = false;
    } else {
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, attr.arr);
    }
    attr.isDirty = false;
  }
}

export interface BufferIndex {
  index: number;
  length: number;
}

export type Color = [r: number, g: number, b: number, a: number];
export type Coordinate = [x: number, y: number, z: number];
export type Quaternion = [q1: number, q2: number, q3: number, q4: number];
