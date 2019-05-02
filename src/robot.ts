import { RobotController } from "./robotController";

export class Robot {
	constructor(public readonly controller: RobotController) {
		{

		}
	}

	private positions = [
		{ x: 100, y: 100 },
		{ x: 400, y: 100 },
		{ x: 400, y: 400 },
		{ x: 100, y: 400 },
		{ x: 300, y: 300 },
	];
	private idx = 0;
	update() {
		let pos = this.positions[(this.idx+=1) % 5];  //{ x: Math.random() * 500, y: Math.random() * 500 };
		this.controller.moveAroundBoxToPosition(pos.x, pos.y, 20, 20).then(() => this.update());
	}
}
