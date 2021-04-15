import type { RotationMat } from '@common/gl';
import { mat4, quat } from 'gl-matrix';
import type CubeRenderer from './cube';
import CubeWorld from './world';

const world = new CubeWorld('hello-world');

world.attach(document.body);

let time = 0;
let objectCnt = 0;
const cubeRenderer = (world.objects.get('cube') as CubeRenderer);

function renderLoop() {
  world.setCamera([
    (10 + 100 * Math.sin((Math.PI * time * 0.1) / 180) ** 2) * Math.sin((Math.PI * time * 1) / 180),
    100 * Math.sin((Math.PI * time * 0.2) / 180),
    (10 + 100 * Math.sin((Math.PI * time * 0.1) / 180) ** 2) * Math.cos((Math.PI * time * 1) / 180)],
  [0, 0, 0], [0, 1, 0]);
  for (let m = time % 3, i = m * 20000, len = 20000 * (m + 1); i < len && i < objectCnt; i += 1) {
    cubeRenderer.modify(`${i}`, {
      position: [
        i * Math.sin((Math.PI * i) / 180) * 0.05,
        10 * Math.sin((Math.PI * (time + i) * 0.5) / 180),
        i * Math.cos((Math.PI * i) / 180) * 0.05],
      color: [Math.sin((Math.PI * time * 0.1) / 180) ** 2,
        Math.sin((Math.PI * i) / 180), Math.cos((Math.PI * i) / 180) ** 2, 0.75],
    });
  }

  if (objectCnt < 60000) {
    cubeRenderer.add(`${objectCnt}`, {
      color: [1, 1, 1, 0.75],
      position: [
        objectCnt * Math.sin((Math.PI * objectCnt) / 180) * 0.05,
        10 * Math.sin((Math.PI * (time + objectCnt) * 0.5) / 180),
        objectCnt * Math.cos((Math.PI * objectCnt) / 180) * 0.05],
      rotation: mat4.fromQuat(mat4.create(), quat.identity(quat.create())) as RotationMat,
      size: [0.5 * Math.random() + 0.5],
    });
    objectCnt += 1;
  }

  world.render();
  time += 1;
  requestAnimationFrame(renderLoop);
}

renderLoop();
