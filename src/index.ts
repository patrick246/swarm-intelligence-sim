
import { Engine, Render, World, Bodies, Body, Vertices } from 'matter-js';
import { Robot } from './robot';

import decomp from 'poly-decomp';
import { RobotController } from './robotController';
import { Environment } from './environment';
(window as any).decomp = decomp;

const robots: Robot[] = [];
const balls: Body[] = [];

const simulationEnvironment = initSimEnvironment();

spawnRobots(10, 10, 500, 500, 5);
createBalls(10, 10, 500, 500, 20);

function initSimEnvironment(): Environment {
	const engine = setupEngine();
	const render = setupRenderer(engine);
	return { renderer: render, engine };
}
function setupRenderer(engine: Engine) :Render{
	return Render.create({
		element: document.body,
		engine: engine,
		options: {
			showAngleIndicator: true,
			wireframes: false,
		}
	} as any);
}
function setupEngine() {
	const engine = Engine.create();
	engine.world.gravity.y = 0;
	return engine;
}

function spawnRobots(startX: number, startY: number, h: number, w: number, count: number) {
	for (let i = 0; i < count; i++) {
		const [x, y, rot] = [Math.random() * w + startX, Math.random() * h + startY, Math.random() * 360];
		robots.push(new Robot(new RobotController(x, y, rot, simulationEnvironment)));
	}
	robots.forEach(x => x.update());
}

function createBalls(startX: number, startY: number, h: number, w: number, count: number) {
	for (let i = 0; i < count; i++) {
		const [x, y] = [Math.random() * w + startX, Math.random() * h + startY];
		balls.push(Bodies.circle(x, y, 10));
	}

}




World.add(simulationEnvironment.engine.world, balls);

(function run() {
	window.requestAnimationFrame(run);

	Engine.update(simulationEnvironment.engine, 1000 / 60);
	Render.world(simulationEnvironment.renderer);
})();
