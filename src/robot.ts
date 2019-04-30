import { RobotController } from "./robotController";

export class Robot {
	constructor(public readonly controller: RobotController) {
		{

		}
	}

	update() {
		this.controller.moveToPosition(Math.random() * 500 + 10, Math.random() * 500 + 10).then(() => console.log('arrived'));
	}


}
