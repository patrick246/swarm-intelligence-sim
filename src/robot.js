class Robot {
	constructor(body) {
		this.body = body;
	}

	update(balls) {

	}
	moveForward(){
		Matter.Body.setVelocity(this.body, { x: 0, y: 1 });
	}
}
