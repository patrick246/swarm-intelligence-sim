import { RobotController } from "./robotController";

export class Robot {
	constructor(public readonly controller: RobotController) {
		{

		}
	}

	update() {
		let pos = { x: Math.random() * 500, y: Math.random() * 500 };
		console.log(pos);
		this.controller.moveToPosition(pos.x, pos.y).then(() => this.update());
	}


}
