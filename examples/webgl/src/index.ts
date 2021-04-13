import type { RotationMat } from '@common/gl';
import { mat4, quat, vec4 } from 'gl-matrix';
import type CubeRenderer from './cube';
import CubeWorld from './world';

const world = new CubeWorld('hello-world');

world.attach(document.body);

let time = 0;
let objectCnt = 0;

function renderLoop() {
  world.setCamera([
    2 + (5 + 10 * Math.sin((Math.PI * time * 0.1) / 180) ** 2) * Math.sin((Math.PI * time) / 180),
    2,
    (5 + 10 * Math.sin((Math.PI * time * 0.1) / 180) ** 2) * Math.cos((Math.PI * time) / 180)],
  [2, 2, 0], [0, 1, 0]);

  for (let i = 0; i < 10; i += 1) {
    (world.objects.get('cube') as CubeRenderer).add(`${objectCnt}`, {
      color: [Math.random(), Math.random(), Math.random(), 0.75],
      position: [10 - 20 * Math.random(), 10 - 20 * Math.random(), 10 - 20 * Math.random()],
      rotation: mat4.fromQuat(mat4.create(), quat.identity(quat.create())) as RotationMat,
      size: [0.5 * Math.random() + 0.1],
    });
    objectCnt += 1;
  }
  if (objectCnt % 100 === 0) {
    console.log(`object count: ${objectCnt}`);
  }

  world.render();
  time += 1;
  requestAnimationFrame(renderLoop);
}

renderLoop();
