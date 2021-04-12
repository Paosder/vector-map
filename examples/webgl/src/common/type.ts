import type { mat4 } from 'gl-matrix';

export interface Renderer {
  render(lastRendered: string, cameraMat: mat4, projectionMat: mat4): string;
}
