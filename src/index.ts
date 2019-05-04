
import { Engine, Render, World, Bodies, Body, Vertices, Events, Vector, Mouse, MouseConstraint } from 'matter-js';
import { Robot } from './robot';

import decomp from 'poly-decomp';
import { RobotController } from './robotController';
import { Environment, Ball } from './environment';
import { ClusterCalculator } from './ClusterCalculator';
import './debugOptions';
import { ClusterResult } from './ClusterResult';
import { PathFinderStrategy } from './PathFinderStrategy';
import { SmallestClusterSelector } from './SmallestClusterSelector';
(window as any).decomp = decomp;

export let simulationEnvironment: Environment;
initSimEnvironment();
spawnRobots(10, 10, 500, 500, 1);
console.log(simulationEnvironment.robots[0]);
createBalls(100, 100,400, 500, 20);
World.add(simulationEnvironment.engine.world, simulationEnvironment.balls);

console.log(simulationEnvironment);
function initSimEnvironment() {
	const engine = setupEngine();
	const render = setupRenderer(engine);
	const mouse = Mouse.create(render.canvas);
	const calculator = new ClusterCalculator();
	const mouseConstraint = MouseConstraint.create(engine, {
		mouse,
		constraint: {
			stiffness: 1,
			render: {
				visible: true
			}
		}
	} as any);
	simulationEnvironment = {
		mouse,
		mouseConstraint,
		calculator,
		clusters: { clusters: [], from: 0, linkage: 0, to: 0 } as ClusterResult,
		renderer: render,
		engine,
		robots: <Robot[]>[],
		balls: <Ball[]>[],
		debugOptions: {
			showWaypoints: false,
			showMouse: false,
			showTarget: true,
			showWireframe: false
		}
	};
	const collisionHandling = function (event: any) {
		for (let z = 0; z < event.pairs.length; z++) {
			let bodies = [];
			if (event.pairs[z].bodyA.label === RobotController.Label) { bodies.push(event.pairs[z].bodyA.parent); }
			if (event.pairs[z].bodyB.label === RobotController.Label) { bodies.push(event.pairs[z].bodyB.parent); }
			bodies.map(x => Body.setAngularVelocity(x, 0));
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
			wireframes: true,
		}
	} as any);
}

function setupEngine() {
	const engine = Engine.create();
	engine.world.gravity.y = 0;
	return engine;
}

function spawnRobots(startX: number, startY: number, h: number, w: number, count: number) {
	const getClusters = () => simulationEnvironment.clusters;
	for (let i = 0; i < count; i++) {
		const [x, y, rot] = [Math.random() * w + startX, Math.random() * h + startY, Math.random() * 360];
		const robotController = new RobotController(x, y, rot, simulationEnvironment);
		simulationEnvironment.robots.push(
			new Robot(robotController,
				new PathFinderStrategy(simulationEnvironment, getClusters, robotController),
				new SmallestClusterSelector(),
				() => simulationEnvironment.clusters));
	}
	simulationEnvironment.robots.forEach(x => x.update());
}

function createBalls(startX: number, startY: number, h: number, w: number, count: number) {
	for (let i = 0; i < count; i++) {
		const [x, y] = [Math.random() * w + startX, Math.random() * h + startY];
		simulationEnvironment.balls.push(Bodies.circle(x, y, 5, {
			frictionAir: 0.9,
			frictionStatic: 1
		}));
	}
}


simulationEnvironment.clusters = simulationEnvironment.calculator.calculate(simulationEnvironment.balls);
let frameCounter = 0;
simulationEnvironment.robots.forEach(robot => robot.update());

(function run() {
	window.requestAnimationFrame(run);
	simulationEnvironment.robots.forEach(robot => robot.controller.Update());
	Engine.update(simulationEnvironment.engine, 1000 / 60);
	if ((frameCounter % 32) === 0) {
		simulationEnvironment.clusters = simulationEnvironment.calculator.calculate(simulationEnvironment.balls);
	}
	Render.world(simulationEnvironment.renderer);
	simulationEnvironment.calculator.drawBBs(simulationEnvironment.engine.world, simulationEnvironment.balls, simulationEnvironment.clusters);
	frameCounter++;
})();
