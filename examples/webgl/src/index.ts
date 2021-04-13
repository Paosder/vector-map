import CubeWorld from './world';

const world = new CubeWorld('hello-world');

world.attach(document.body);

function renderLoop() {
  world.render();
  requestAnimationFrame(renderLoop);
}

renderLoop();
world.setCamera([1, 0, -1], [0, 0, 0], [0, 1, 0]);
