import { RobotController } from "./robotController";
import { simulationEnvironment } from ".";
import { ClusterResult } from "./ClusterResult";

export class Robot {
	constructor(public readonly controller: RobotController,
		public readonly getClusters: () => ClusterResult) {
		{
		}
	}
	private calculateClusterBox(ballIds: number[]): { x: number, y: number, height: number, width: number } {
		const currentBalls = ballIds.map(i => simulationEnvironment.balls[i]);
		const minX = Math.min.apply(null, currentBalls.map(b => b.position.x));
		const minY = Math.min.apply(null, currentBalls.map(b => b.position.y));
		const maxX = Math.max.apply(null, currentBalls.map(b => b.position.x));
		const maxY = Math.max.apply(null, currentBalls.map(b => b.position.y));
		const diffX = maxX - minX;
		const diffY = maxY - minY;
		return {
			x: minX + 0.5 * diffX,
			y: minY + 0.5 * diffY,
			height: 50 + maxY - minY,
			width: 50 + maxX - minX
		};

	}
	public update() {
		const clusterResult = this.getClusters();
		const clusters = clusterResult.clusters.sort((a, b) => a.length - b.length);
		if (clusters.length > 2) {
			const firstPosition = this.calculateClusterBox(clusters[0]);
			const targetPosition = this.calculateClusterBox(clusters[clusters.length - 1]);
			console.log({ e: clusterResult.linkage, firstPosition, targetPosition });
			this.controller.moveAroundBoxToPosition(firstPosition.x, firstPosition.y, firstPosition.height, firstPosition.width)
				.then(() => this.controller.moveToPosition(targetPosition.x, targetPosition.y))
				.then(() => this.controller.moveBackward(50))
				.then(() => this.update());
		}
		else {
			console.log("too less clusters");
		}
		//const targetCluster = clusters.
		//	this.controller.moveToPosition();
	}
}
