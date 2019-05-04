import { PathStrategy } from "./PathStrategy";
import { Environment, Ball } from "./environment";
import { Vector } from "matter-js";
import { RobotController } from "./robotController";
import { ClusterResult } from "./ClusterResult";
import { ClusterSelector } from "./ClusterSelector";
import { simulationEnvironment } from ".";
const PF = require('pathfinding');
export class PathFinderStrategy implements PathStrategy {
    constructor(private readonly environment: Environment,
        private readonly getClusters: () => ClusterResult,
        private robotController: RobotController) {

    }
    private readonly offset = { x: -400, y: -400 };
    private readonly size = { x: 1200, y: 800 };
    private readonly dotSize = 20;
    private createGrid(balls: Ball[]) {

        const grid = new PF.Grid(this.size.x / this.dotSize, this.size.y / this.dotSize);
        const ballPositions = balls.map(x => x.position);
        ballPositions.forEach(pos => grid.setWalkableAt(Math.floor(pos.x / this.dotSize), Math.floor(pos.y / this.dotSize), false));
        return grid;
    }

    private calculateClusterBox(ballIds: number[]): { x: number, y: number, height: number, width: number } {
        const currentBalls = ballIds.map(i => this.environment.balls[i]);
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
    private findPath(startPosition: Vector, endPosition: Vector, ballIdxsFilter: number[]): number[][] {
        const grid = this.createGrid(simulationEnvironment.balls.filter((_, idx) => !ballIdxsFilter.some(ballIdx => ballIdx === idx)));
        return this.searchPath(startPosition, endPosition, grid);
    }

    private searchPath(startPosition: Vector, endPosition: Vector, grid: any): number[][] {
        const finder = new PF.AStarFinder({
            allowDiagonal: true,
            dontCrossCorners: true,
        });
        const gridStartPosition = { x: Math.floor(startPosition.x / this.dotSize), y: Math.floor(startPosition.y / this.dotSize) };
        const gridEndPosition = { x: Math.floor(endPosition.x / this.dotSize), y: Math.floor(endPosition.y / this.dotSize) };
        const gridP = grid.clone();
        const path = finder.findPath(gridStartPosition.x, gridStartPosition.y, gridEndPosition.x, gridEndPosition.y, grid);
        const compressedPath = PF.Util.compressPath(path);
        if (path.length === 0) {
            console.error('empty path', startPosition, gridP, endPosition, gridStartPosition, gridEndPosition
            );
        }
        return compressedPath;
    }
    public updatePath(clusterSelector: ClusterSelector) {
        console.log('updatePath');
        const clusters = this.getClusters();
        const selectedCluster = clusterSelector.selectCluster(
            this.getClusters,
            this.environment,
            this.robotController.body.position);
        if (selectedCluster.firstCluster.length === 0 || selectedCluster.targetCluster.length === 0) {
            return;
        }
        const firstPosition = this.calculateClusterBox(selectedCluster.firstCluster);
        const targetPosition = this.calculateClusterBox(selectedCluster.targetCluster);
        const waypoints =
            [... this.findPath(this.robotController.body.position, firstPosition, selectedCluster.firstCluster),
            [targetPosition.x / this.dotSize, targetPosition.y / this.dotSize]
          /*  ...this.findPath(firstPosition, targetPosition, [...selectedCluster.firstCluster, ...selectedCluster.targetCluster])*/];
        console.log(waypoints.length);
        if (waypoints.length === 0) {
            console.log({
                waypoints, firstPosition, targetPosition, body: this.robotController.body.position,
            });
            return;
        }
        let startPromise = new Promise<void>((res, rej) => res());
        for (let pos of waypoints) {
            startPromise = startPromise.then(() => this.robotController.moveToPosition(pos[0] * this.dotSize, pos[1] * this.dotSize)) as Promise<void>;
        }
        startPromise = startPromise.then(() => this.robotController.moveBackward(100)) as Promise<void>;
        startPromise = startPromise.then(() => console.log('arrived')) as Promise<void>;
        setTimeout(() => startPromise.then(() => this.updatePath(clusterSelector)), 1000);
    }
}