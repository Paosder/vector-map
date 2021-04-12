import type { Renderer } from '@common/type';
import { mat4, glMatrix, vec3 } from 'gl-matrix';
import CubeRenderer from './cube';

glMatrix.setMatrixArrayType(Array);
class World {
  canvas: HTMLCanvasElement;

  attached: boolean;

  gl: WebGLRenderingContext;

  objects: Array<Renderer>;

  lastRendered: string;

  cameraMatrix: mat4;

  eye: vec3;

  lookAt: vec3;

  projectionMatrix: mat4;

  constructor(canvasId: string) {
    // create canvas and get gl context.
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: false, antialias: true })!;

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
    this.attached = false;

    // enable gl extension & depth test.
    gl.enable(gl.DEPTH_TEST);
    const vaoExt = gl.getExtension('OES_vertex_array_object');
    const instanced = gl.getExtension('ANGLE_instanced_arrays');
    if (!(vaoExt && instanced)) {
      throw new Error('cannot use extensions!: VAO or instanced_arrays.');
    }
    this.objects = [new CubeRenderer(gl, vaoExt, instanced, 'cube')];
    this.lastRendered = '';
    this.cameraMatrix = mat4.identity(mat4.create());
    this.projectionMatrix = mat4.frustum(mat4.create(), -10, 10, -10, 10, 1, 100);
    this.eye = vec3.fromValues(0, 0, -1);
    this.lookAt = vec3.fromValues(0, 0, 0);
    mat4.lookAt(this.cameraMatrix, this.eye, this.lookAt, vec3.fromValues(0, 1, 0));
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

  render() {
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(0, 0, 0, 0);
    // eslint-disable-next-line no-bitwise
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.objects.forEach((renderer) => {
      this.lastRendered = renderer.render(this.lastRendered, this.cameraMatrix, this.projectionMatrix);
    });
  }
}

export default World;
