import { RobotController } from "./robotController";

export class Robot {
	constructor(public readonly controller: RobotController) {
		{

		}
	}

	update() {
		this.controller.moveForward();
	}


}
