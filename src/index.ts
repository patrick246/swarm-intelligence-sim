
import { Engine, Render, World, Bodies, Body, Vertices, Events, Vector } from 'matter-js';
import { Robot } from './robot';

import decomp from 'poly-decomp';
import { RobotController } from './robotController';
import { Environment, Ball } from './environment';
import { ClusterCalculator } from './ClusterCalculator';
(window as any).decomp = decomp;

let simulationEnvironment: Environment;
initSimEnvironment();
spawnRobots(10, 10, 500, 500, 5);
createBalls(10, 10, 500, 500, 20);
console.log(simulationEnvironment);
function initSimEnvironment() {
	const engine = setupEngine();
	const render = setupRenderer(engine);
	simulationEnvironment = { renderer: render, engine, robots: <Robot[]>[], balls: <Ball[]>[] };
	const collisionHandling = function (event: any) {
		const pushDistance = 5;
		const minPushDistance = 3;
		for (let z = 0; z < event.pairs.length; z++) {
			let bodies = [];
			if (event.pairs[z].bodyA.label === RobotController.Label) { bodies.push(event.pairs[z].bodyA.parent); }
			if (event.pairs[z].bodyB.label === RobotController.Label) { bodies.push(event.pairs[z].bodyB.parent); }
			if (bodies.length === 0) { return; }
			// two robots colliding
			if (bodies.length > 1) {
				for (let idx = 1; bodies.length > 1 && idx < bodies.length; idx++) {
					let pos1 = bodies[idx - 1].position;
					let pos2 = bodies[idx].position;
					let direction = { x: pos1.x - pos2.x, y: pos1.y - pos2.y };
					let absVal = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
					let relDirection = { x: direction.x / absVal, y: direction.y / absVal };
					Body.setPosition(bodies[idx - 1], { x: pos1.x + relDirection.x, y: pos1.y + relDirection.y });
					Body.setPosition(bodies[idx], { x: pos2.x - relDirection.x, y: pos2.y - relDirection.y });
				}
			}

			//treating dot collisions
			else if (bodies.length == 1) {
				//console.log('object collision');
				return;
			}

			const robots = bodies.map(robotBody => simulationEnvironment.robots.find(robot => robot.controller.body === robotBody));
			robots.forEach(robot => robot.controller.handleCollision());

		}
	};
	Events.on(engine, 'collisionStart', collisionHandling);
	Events.on(engine, 'collisionActive', collisionHandling);
}
function setupRenderer(engine: Engine): Render {
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
		simulationEnvironment.robots.push(new Robot(new RobotController(x, y, rot, simulationEnvironment)));
	}
	simulationEnvironment.robots.forEach(x => x.update());
}


function createBalls(startX: number, startY: number, h: number, w: number, count: number) {
	for (let i = 0; i < count; i++) {
		const [x, y] = [Math.random() * w + startX, Math.random() * h + startY];
		simulationEnvironment.balls.push(Bodies.circle(x, y, 10));
	}

}

World.add(simulationEnvironment.engine.world, simulationEnvironment.balls);

const calculator = new ClusterCalculator();

let clusters = calculator.calculate(simulationEnvironment.balls);
let frameCounter = 0;

(function run() {
    window.requestAnimationFrame(run);

	Engine.update(simulationEnvironment.engine, 1000 / 60);

    if ((frameCounter % 32) === 0) {
        clusters = calculator.calculate(simulationEnvironment.balls);
    }

	Render.world(simulationEnvironment.renderer);
    calculator.drawBBs(simulationEnvironment.engine.world,simulationEnvironment.balls, clusters);
    frameCounter++;
})();
