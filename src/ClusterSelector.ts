import { Environment } from "./environment";
import { ClusterResult } from "./ClusterResult";
import { Vector } from "matter-js";

export interface ClusterSelector {
    selectCluster(
        getClusters: () => ClusterResult,
        environment: Environment,
        currentPosition: Vector
    ): {
        firstCluster: number[],
        targetCluster: number[]
    };
}