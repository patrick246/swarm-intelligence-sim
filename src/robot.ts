import { RobotController } from "./robotController";

export class Robot {
	constructor(private readonly controller: RobotController) {
		{

		}
	}

	update() {
		this.controller.moveForward();
	}


}
