import type { Renderer } from '@common/type';
import { VectorMap } from '@paosder/vector-map';
import { mat4, glMatrix, vec3 } from 'gl-matrix';
import CubeRenderer from './cube';

glMatrix.setMatrixArrayType(Array);
class World {
  canvas: HTMLCanvasElement;

  attached: boolean;

  gl: WebGLRenderingContext;

  objects: VectorMap<string, Renderer>;

  lastRendered: string;

  cameraMatrix: mat4;

  eye: vec3;

  lookAt: vec3;

  projectionMatrix: mat4;

  transformMatrix: mat4;

  isTransformDirty: boolean;

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
    this.objects = new VectorMap();
    this.objects.set('cube', new CubeRenderer(gl, vaoExt, instanced, 'cube'));
    this.lastRendered = '';
    this.cameraMatrix = mat4.identity(mat4.create());
    this.projectionMatrix = mat4.perspective(mat4.create(),
      Math.PI * 0.5, this.gl.canvas.width / this.gl.canvas.height, 1, 100);
    this.eye = vec3.fromValues(3, 3, 5);
    this.lookAt = vec3.fromValues(1, 1, 0);
    mat4.lookAt(this.cameraMatrix, this.eye, this.lookAt, vec3.fromValues(0, 1, 0));
    this.transformMatrix = mat4.multiply(mat4.create(), this.projectionMatrix, this.cameraMatrix);
    this.isTransformDirty = true;
  }

  attach(which: HTMLElement) {
    which.appendChild(this.canvas);
    this.attached = true;
  }

  detach() {
    if (this.attached) {
      this.canvas.parentElement?.removeChild(this.canvas);
      this.attached = false;
    }
  }

  setCamera(position: vec3, target: vec3, up: vec3) {
    this.eye = position;
    this.lookAt = target;
    mat4.lookAt(this.cameraMatrix, this.eye, this.lookAt, up);
    this.isTransformDirty = true;
  }

  computeTransformMatrix() {
    return mat4.multiply(this.transformMatrix, this.projectionMatrix, this.cameraMatrix);
  }

  render() {
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(0, 0, 0, 0);
    // eslint-disable-next-line no-bitwise
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    const transformMat = this.isTransformDirty ? this.computeTransformMatrix() : undefined;
    this.isTransformDirty = false;
    this.objects.forEach((renderer) => {
      this.lastRendered = renderer.value.render(this.lastRendered, transformMat);
    });
  }
}

export default World;
