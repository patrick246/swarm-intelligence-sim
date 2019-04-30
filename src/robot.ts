import { RobotController } from "./robotController";

export class Robot {
	constructor(public readonly controller: RobotController) {
		{

		}
	}

	update() {
		this.controller.move(30).then(()=>console.log('arrived'));
	}


}
