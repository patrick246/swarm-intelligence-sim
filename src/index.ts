
import {Engine, Render, World, Bodies, Body, Vertices} from 'matter-js';
import {Robot} from './robot';

import decomp from 'poly-decomp';
(window as any).decomp = decomp;

const engine = setupEngine();
const render = setupRenderer();
const robots: Robot[] = [];
const balls: Body[] = [];


spawnRobots(10, 10, 500, 500, 5);
createBalls(10, 10, 500, 500, 20);

function setupRenderer() {
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

function createRobot(x: number, y: number, rot: number) {
	const bot = Vertices.fromPath('0 0 0 10 -10 20 -9 21 5 10 19 21 20 20 10 10 10 0', null);
	const robot = new Robot(Bodies.fromVertices(x, y,
		[bot], {
			render: {
				fillStyle: 'blue',
				lineWidth: 1,// = bump width
				strokeStyle: 'blue'
			}
		}, true));
	Body.scale(robot.getBody(), 3, 3);
	Body.rotate(robot.getBody(), rot);
	robots.push(robot);
	return robot;
}

function spawnRobots(startX: number, startY: number, h: number, w: number, count: number) {
	for (let i = 0; i < count; i++) {
		const [x, y, rot] = [Math.random() * w + startX, Math.random() * h + startY, Math.random() * 360];
		createRobot(x, y, rot);
	}
	robots.forEach(x=>x.moveForward());
}

function createBalls(startX: number, startY: number, h: number, w: number, count: number) {
	for (let i = 0; i < count; i++) {
		const [x, y] = [Math.random() * w + startX, Math.random() * h + startY];
		balls.push(Bodies.circle(x, y, 10));
	}

}


World.add(engine.world, robots.map(r => r.getBody()));

World.add(engine.world, balls);

(function run() {
	window.requestAnimationFrame(run);

	Engine.update(engine, 1000 / 60);
	Render.world(render);
})();
