import { Environment } from "./environment";
import { RobotController } from "./robotController";
import { ClusterResult } from "./ClusterResult";
import { PathStrategy } from "./PathStrategy";
import { ClusterSelector } from "./ClusterSelector";

export class MoveAroundCluster implements PathStrategy {

    constructor(
        private readonly simulationEnvironment: Environment,
        private readonly getClusters: () => ClusterResult,
        private readonly controller: RobotController) {

    }
    private calculateClusterBox(ballIds: number[]): { x: number, y: number, height: number, width: number } {
        const currentBalls = ballIds.map(i => this.simulationEnvironment.balls[i]);
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

    public updatePath(clusterSelector: ClusterSelector) {
        const clusters = clusterSelector.selectCluster(
            this.getClusters,
            this.simulationEnvironment,
            this.controller.body.position);
        const firstPosition = this.calculateClusterBox(clusters.firstCluster);
        const targetPosition = this.calculateClusterBox(clusters.targetCluster);
        this.controller.moveAroundBoxToPosition(firstPosition.x, firstPosition.y, firstPosition.height, firstPosition.width)
            .then(() => this.controller.moveToPosition(targetPosition.x, targetPosition.y))
            .then(() => this.controller.moveBackward(50))
            .then(() => this.updatePath(clusterSelector));

    }
}