import type { VectorMap } from '@paosder/vector-map';
import type { mat4 } from 'gl-matrix';

type ShaderType = WebGLRenderingContext['VERTEX_SHADER'] | WebGLRenderingContext['FRAGMENT_SHADER'];

export interface Attribute {
  loc: number;
  buffer: WebGLBuffer;
  arr: Float32Array;
  size: number;
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
  matrix?: boolean;
}

export interface BufferIndex {
  index: number;
  length: number;
}

export type Color = [r: number, g: number, b: number, a: number];
export type Coordinate = [x: number, y: number, z: number];
export type Quaternion = [q1: number, q2: number, q3: number, q4: number];
export type RotationMat = [number, number, number, number, number, number, number,
  number, number, number, number, number, number, number, number, number];

export interface ObjectBufferIndex {
  position: BufferIndex;
  rotation: BufferIndex;
}

export interface ObjectInfo<T extends ObjectBufferIndex> {
  indices: VectorMap<string, T>;
  attributes: Record<keyof T, Attribute>;
}

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

export function createAttribute(gl: WebGLRenderingContext, program: WebGLProgram, opt: AttrOptions): Attribute {
  const buffer = gl.createBuffer();
  if (!buffer) {
    throw new Error('Cannot create buffer!');
  }
  const usage = opt.usage ?? gl.STATIC_DRAW;
  const arr = opt.defaultData ?? new Float32Array(opt.length * opt.size * (opt.matrix ? opt.size : 1));
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, arr, usage);

  const loc = gl.getAttribLocation(program, opt.name);
  let { size } = opt;
  if (opt.matrix) {
    // ex. mat4 = 1 float x 4 columns x 4 rows x 4 bytes = 64.
    size *= size;
    const stride = opt.size ** 2 * 4;
    const offset = opt.size * 4;
    for (let i = 0; i < opt.size; i += 1) {
      gl.enableVertexAttribArray(loc + i);
      gl.vertexAttribPointer(loc + i, opt.size, gl.FLOAT, false, stride, offset * i);
    }
  } else {
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, opt.size, gl.FLOAT, false, 0, 0);
  }

  return {
    loc,
    buffer,
    arr,
    size,
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

export function createUniform(gl: WebGLRenderingContext, program: WebGLProgram, name: string) {
  const uniformLoc = gl.getUniformLocation(program, name);
  if (!uniformLoc) {
    throw new Error(`cannot find uniform location: '${name}'.`);
  }
  return uniformLoc;
}

export function addObject<T extends ObjectBufferIndex>(objectInfo: ObjectInfo<T>,
  id: string, data: Record<keyof T, Array<number>>) {
  const objectIndex: any = {};
  Object.entries(data).forEach(([key, _data]) => {
    const targetAttribute = objectInfo.attributes[key as keyof Record<keyof T, Attribute>];
    const length = targetAttribute.size;
    const index = objectInfo.indices.size * length;
    objectIndex[key] = {
      index,
      length,
    };
    if (targetAttribute.arr.length < index) {
      // length exceeded. We need to re-aollocate array.
      // new array has double length.
      const newArr = new Float32Array(targetAttribute.arr.length * 2);
      // copy data to new array.
      newArr.set(targetAttribute.arr);
      // then replace it.
      targetAttribute.arr = newArr;
      targetAttribute.isResized = true;
    }
    // set new data.
    targetAttribute.arr.set(_data, index);
    console.log(targetAttribute.arr);
    targetAttribute.isDirty = true;
  });

  objectInfo.indices.set(id, objectIndex as T);
}

export function modifyObject<T extends ObjectBufferIndex>(objectInfo: ObjectInfo<T>,
  id: string, data: Record<Partial<keyof T>, Array<number>>) {

}

export function deleteObject<T extends ObjectBufferIndex>(objectInfo: ObjectInfo<T>, id: string) {

}
