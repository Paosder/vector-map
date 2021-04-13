import type { mat4 } from 'gl-matrix';

export interface Renderer {
  render(lastRendered: string, transformMat?: mat4): string;
}
