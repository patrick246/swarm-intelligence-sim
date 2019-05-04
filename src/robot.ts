import { RobotController } from "./robotController";
import { simulationEnvironment } from ".";
import { ClusterResult } from "./ClusterResult";
import { PathStrategy } from "./PathStrategy";
import { ClusterSelector } from "./ClusterSelector";

export class Robot {
	constructor(public readonly controller: RobotController,
		public readonly pathStrategy: PathStrategy,
		public readonly clusterSelector:ClusterSelector,
		public readonly getClusters: () => ClusterResult) {
		{
		}
	}
	update() {
		this.pathStrategy.updatePath(this.clusterSelector);
	}

}
