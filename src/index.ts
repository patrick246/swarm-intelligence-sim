import {Bodies, Body, Engine, Render, World} from 'matter-js';
import {Robot} from './robot';

import decomp from 'poly-decomp';
import {ClusterCalculator} from "./ClusterCalculator";
import {Environment} from './environment';
import {RobotController} from "./robotController";


(window as any).decomp = decomp;

const robots: Robot[] = [];
const balls: Body[] = [];

const simulationEnvironment = initSimEnvironment();

spawnRobots(10, 10, 500, 500, 1);
createBalls(10, 10, 500, 500, 30);

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

const calculator = new ClusterCalculator();

let clusters = calculator.calculate(balls);
let frameCounter = 0;

(function run() {
    window.requestAnimationFrame(run);

	Engine.update(simulationEnvironment.engine, 1000 / 60);

    if ((frameCounter % 32) === 0) {
        clusters = calculator.calculate(balls);
    }

	Render.world(simulationEnvironment.renderer);
    calculator.drawBBs(simulationEnvironment.engine.world, balls, clusters);
    frameCounter++;
})();
