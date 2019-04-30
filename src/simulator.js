const Engine = Matter.Engine,
	Render = Matter.Render,
	World = Matter.World,
	Vertices = Matter.Vertices,
	Bodies = Matter.Bodies;


// create an engine
const engine = setupEngine();
const render = setupRenderer();
const robots = [];
const balls = [];

spawnRobots(10, 10, 500, 500, 5);
createBalls(10, 10, 500, 500, 20);


function setupRenderer() {
	return Render.create({
		element: document.body,
		engine: engine,
		options: {
			background: '#000',
			showAngleIndicator: true,
			wireframes: false,
		}
	});
}
function setupEngine() {
	const engine = Engine.create();
	engine.world.gravity.y = 0;
	return engine;
}

function createRobot(x, y, rot) {
	const bot = Vertices.fromPath('0 0 0 10 -10 20 -9 21 5 10 19 21 20 20 10 10 10 0');
	const robot = new Robot(Bodies.fromVertices(x, y,
		bot, {
			render: {
				fillStyle: 'blue',
				lineWidth: 1,// = bump width
				strokeStyle: 'blue'
			}
		}, true));
	Matter.Body.scale(robot.body, 3, 3);
	Matter.Body.rotate(robot.body, rot);
	robots.push(robot);
	return robot;
}

function spawnRobots(startX, startY, h, w, count) {
	for (let i = 0; i < count; i++) {
		const [x, y, rot] = [Math.random() * w + startX, Math.random() * h + startY, Math.random() * 360];
		createRobot(x, y, rot);
	}
	robots.forEach(x=>x.moveForward());
}

function createBalls(startX, startY, h, w, count) {
	for (let i = 0; i < count; i++) {
		const [x, y] = [Math.random() * w + startX, Math.random() * h + startY];
		balls.push(Bodies.circle(x, y, 10));
	}

}



World.add(engine.world, robots.map(r => r.body));
World.add(engine.world, balls);

(function run() {
	window.requestAnimationFrame(run);

	Engine.update(engine, 1000 / 60);
	Render.world(render);
})();
