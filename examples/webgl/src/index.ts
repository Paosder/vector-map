import CubeWorld from './cube_world';

const world = new CubeWorld('hello-world');

world.attach(document.body);
world.add('1', [1, 0, 0, 1]);
world.render();
