import { VectorMap } from '@paosder/vector-map';
import {
  BufferIndex, Color, createAttribute, createProgram, createShader,
  Coordinate, Quaternion, updateAttribute, ObjectBufferIndex, ObjectInfo,
} from '@common/gl';
import type { Renderer } from '@common/type';
import type { mat4 } from 'gl-matrix';
import vs from './vert.glsl';
import fs from './frag.glsl';

const DEFAULT_CUBE_LENGTH = 1000;

interface CubeBufferIndex extends ObjectBufferIndex {
  color: BufferIndex;
}

type CubeInfo = ObjectInfo<CubeBufferIndex>;

const CubeAttributes: Array<keyof CubeBufferIndex> = ['color', 'position', 'rotation'];

class CubeRenderer implements Renderer {
  cubes: CubeInfo;

  vaoExt: OES_vertex_array_object;

  vao: WebGLVertexArrayObjectOES;

  instanced: ANGLE_instanced_arrays;

  gl: WebGLRenderingContext;

  program: WebGLProgram;

  uuid: string;

  constructor(gl: WebGLRenderingContext, vaoExt: OES_vertex_array_object,
    instanced: ANGLE_instanced_arrays, uuid: string) {
    this.gl = gl;
    this.vaoExt = vaoExt;
    this.instanced = instanced;
    this.uuid = uuid;

    // compile shaders & link program.
    const vertex = createShader(gl, gl.VERTEX_SHADER, vs);
    const fragment = createShader(gl, gl.FRAGMENT_SHADER, fs);
    const program = createProgram(gl, vertex, fragment);

    gl.useProgram(program);
    this.program = program;

    // create & bind VAO.
    const vao = this.vaoExt.createVertexArrayOES();
    if (!vao) {
      throw new Error('cannot create VAO!');
    }
    this.vao = vao;
    this.vaoExt.bindVertexArrayOES(this.vao);

    // ///////////////////////////////
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
      name: 'a_surface',
      size: 3,
      length: 24,
      defaultData: points,
    });

    // set index buffer.
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

    // ///////////////////////////////

    this.cubes = {
      indices: new VectorMap(),
      attributes: {
        color: createAttribute(gl, program, {
          name: 'a_color',
          size: 4,
          usage: gl.DYNAMIC_DRAW,
          length: DEFAULT_CUBE_LENGTH,
        }),
        position: createAttribute(gl, program, {
          name: 'a_position',
          size: 3,
          usage: gl.DYNAMIC_DRAW,
          length: DEFAULT_CUBE_LENGTH,
        }),
        rotation: createAttribute(gl, program, {
          name: 'a_rotation',
          size: 4,
          usage: gl.DYNAMIC_DRAW,
          length: DEFAULT_CUBE_LENGTH,
        }),
      },
    };
    // prepare for instancing.
    instanced.vertexAttribDivisorANGLE(this.cubes.attributes.color.loc, 1);
    instanced.vertexAttribDivisorANGLE(this.cubes.attributes.position.loc, 1);
    instanced.vertexAttribDivisorANGLE(this.cubes.attributes.rotation.loc, 1);

    // initialize step finished.
    this.vaoExt.bindVertexArrayOES(null);
  }

  updateBuffer() {
    CubeAttributes.forEach((name) => {
      if (this.cubes.attributes[name].isDirty) {
        updateAttribute(this.gl, this.program, this.cubes.attributes[name]);
      }
    });
  }

  // eslint-disable-next-line
  add(id: string, options: {
    color: Color;
    position: Coordinate;
    rotation: Quaternion;
  }) {
    // TODO
  }

  render(lastRendered: string, cameraMat: mat4, projectionMat: mat4) {
    if (lastRendered !== this.uuid) {
      this.gl.useProgram(this.program);
    }
    this.vaoExt.bindVertexArrayOES(this.vao);

    this.updateBuffer();
    if (this.cubes.indices.size > 0) {
      this.instanced.drawElementsInstancedANGLE(this.gl.TRIANGLES, 36,
        this.gl.UNSIGNED_SHORT, 0, this.cubes.indices.size);
    }

    this.vaoExt.bindVertexArrayOES(null);
    return this.uuid;
  }
}

export default CubeRenderer;
