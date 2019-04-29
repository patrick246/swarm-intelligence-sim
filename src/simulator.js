const Engine = Matter.Engine,
	Render = Matter.Render,
	World = Matter.World,
	Bodies = Matter.Bodies;

// create an engine
const engine = Engine.create();

// create a renderer
const render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		background: '#ffffff'
	}
});

engine.world.gravity.y = 0;

const robots = [];

robots.push(new Robot(Bodies.fromVertices(150, 150, [
	{x: 0, y: 0},
	{x: 0, y: 10},
	{x: -10, y: 20},
	{x: -9, y: 21},
	{x: 5, y: 10},
	{x: 19, y: 21},
	{x: 20, y: 20},
	{x: 10, y: 10},
	{x: 10, y: 0},
	{x: 0, y: 0}
])));

robots.forEach(bot => Matter.Body.scale(bot.body, 3, 3));

const balls = [];
for(let i = 0; i < 20; i++) {
	const [x, y] = [Math.random() * 780 + 10, Math.random() * 580 + 10];
	balls.push(Bodies.circle(x, y, 10));
}

World.add(engine.world, robots.map(r => r.body));
World.add(engine.world, balls);

(function run() {
	window.requestAnimationFrame(run);

	Engine.update(engine, 1000 / 60);
	Render.world(render);
})();
