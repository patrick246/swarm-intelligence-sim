import {Body} from "matter-js";

export class Robot {
	constructor(private body: Body) {

	}

	update() {

	}

	public getBody() {
		return this.body;
	}

	public moveForward(){
		Body.setVelocity(this.body, { x: 0, y: 1 });
	}
}
