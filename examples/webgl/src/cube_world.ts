import { VectorMap } from '@paosder/vector-map';
import vs from './vert.glsl';
import fs from './frag.glsl';
import { createProgram, createShader } from './common';

interface Attribute {
  loc: number;
  buffer: WebGLBuffer;
  arr: Float32Array;
  isDirty: boolean;
  isResized: boolean;
  usage: number;
}

interface BufferIndex {
  index: number;
  len: number;
}

type Color = [r: number, g: number, b: number, a: number];

interface CubeData {
  color: Color;
}

interface CubeBufferIndex {
  color: BufferIndex;
}

interface CubeInfo {
  indices: VectorMap<string, CubeBufferIndex>;
  color: Attribute;
}

interface AttrOptions {
  name: string;
  size: number;
  defaultValue?: Float32Array;
  usage?: number;
}

function addCube(cubes: CubeInfo, id: string, data: CubeData) {
  // TODO
  // const newCube: CubeBufferIndex;
  // cubes.indices.set(id, newCube);
}

function createAttribute(gl: WebGLRenderingContext, program: WebGLProgram, opt: AttrOptions): Attribute {
  const defaultValue = opt.defaultValue ?? new Float32Array(4);
  const buffer = gl.createBuffer();
  if (!buffer) {
    throw new Error('Cannot create buffer!');
  }
  const usage = opt.usage ?? gl.STATIC_DRAW;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, defaultValue, usage);

  const loc = gl.getAttribLocation(program, opt.name);
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, opt.size, gl.FLOAT, false, 0, 0);

  return {
    loc,
    buffer,
    arr: defaultValue,
    isDirty: false,
    isResized: false,
    usage,
  };
}

function updateAttribute(gl: WebGLRenderingContext, program: WebGLProgram, attr: Attribute) {
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

class CubeWorld {
  canvas: HTMLCanvasElement;

  attached: boolean;

  gl: WebGLRenderingContext;

  program: WebGLProgram;

  glExtensions: Map<string, any>;

  vao: WebGLVertexArrayObjectOES;

  instanced: ANGLE_instanced_arrays;

  cubes: CubeInfo;

  constructor(canvasId: string) {
    // create canvas and get gl context.
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl')!;

    if (!gl) {
      throw new Error('Cannot create webgl context!');
    }

    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.width = 500;
    canvas.height = 500;
    canvas.style.border = '1px solid black';
    canvas.style.touchAction = 'none';
    canvas.id = canvasId;

    this.canvas = canvas;
    this.gl = gl;
    this.glExtensions = new Map();
    this.attached = false;

    // enable gl extension & depth test.
    gl.enable(gl.DEPTH_TEST);
    ['OES_vertex_array_object', 'ANGLE_instanced_arrays'].forEach((ext) => {
      this.glExtensions.set(ext, gl.getExtension(ext));
    });

    const vaoExt = this.glExtensions.get('OES_vertex_array_object') as OES_vertex_array_object;

    // create VAO.
    const vao = vaoExt.createVertexArrayOES();
    if (!vao) {
      throw new Error('Cannot use Vertex Array Object extension!');
    }
    this.vao = vao;

    // compile shaders & link program.
    const vertex = createShader(gl, gl.VERTEX_SHADER, vs);
    const fragment = createShader(gl, gl.FRAGMENT_SHADER, fs);
    const program = createProgram(gl, vertex, fragment);

    gl.useProgram(program);
    this.program = program;

    // bind VAO & start link attr & uniform definitions.
    vaoExt.bindVertexArrayOES(vao);

    // create instanced array extension for instancing.
    this.instanced = this.glExtensions.get('ANGLE_instanced_arrays');

    // define cube with index buffer.

    const points = new Float32Array([
      //   4----5
      //  /|   /|
      // 0----3 |
      // | 6  | 7
      // 1----2
      // define points.
      -1, 1, 1, // 0
      -1, -1, 1, // 1
      1, -1, 1, // 2
      1, 1, 1, // 3
      -1, 1, -1, // 4
      1, 1, -1, // 5
      -1, -1, -1, // 6
      1, -1, -1, // 7
    ]);

    createAttribute(gl, program, {
      name: 'a_position',
      size: 3,
      defaultValue: points,
    });

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const indexArray = new Uint16Array([
      // front
      0, 1, 2,
      0, 2, 3,
      // top
      4, 0, 3,
      4, 3, 5,
      // left
      4, 6, 1,
      4, 1, 0,
      // right
      3, 2, 7,
      3, 7, 5,
      // back
      5, 7, 6,
      5, 6, 4,
      // bottom
      1, 6, 7,
      1, 7, 2,
    ]);

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);

    // each cube has position, rotation, color values.

    const cubes: CubeInfo = {
      indices: new VectorMap(),
      color: createAttribute(gl, program, { name: 'a_color', size: 4 }),
    };
    this.instanced.vertexAttribDivisorANGLE(cubes.color.loc, 1);

    this.cubes = cubes;

    // initialize finished, release vao.
    vaoExt.bindVertexArrayOES(null);
  }

  attach(which: HTMLElement) {
    which.appendChild(this.canvas);
    this.attached = true;
    console.log('attached.');
  }

  detach() {
    if (this.attached) {
      this.canvas.parentElement?.removeChild(this.canvas);
      this.attached = false;
    }
  }

  add(id: string, color: [r: number, g: number, b: number, a: number]) {
    this.cubes.color.arr.set(color, this.cubes.indices.size * 4);
    this.cubes.color.isDirty = true;
    this.cubes.indices.set(id, {
      color: {
        len: 4,
        index: this.cubes.indices.size * 4,
      },
    });
    // TODO
    // addCube(this.cubes, id, { color });
  }

  render() {
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(0, 0, 0, 0);
    // eslint-disable-next-line no-bitwise
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    const vaoExt = this.glExtensions.get('OES_vertex_array_object') as OES_vertex_array_object;
    vaoExt.bindVertexArrayOES(this.vao);

    if (this.cubes.indices.size > 0) {
      // update attribute if necessary.
      updateAttribute(this.gl, this.program, this.cubes.color);

      this.instanced.drawElementsInstancedANGLE(this.gl.TRIANGLES, 36,
        this.gl.UNSIGNED_SHORT, 0, this.cubes.indices.size);
    }

    vaoExt.bindVertexArrayOES(null);
  }
}

export default CubeWorld;
