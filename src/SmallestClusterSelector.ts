import { ClusterSelector } from "./ClusterSelector";
import { ClusterResult } from "./ClusterResult";
import { Vector } from "matter-js";
import { Environment } from "./environment";

export class SmallestClusterSelector implements ClusterSelector {

   public selectCluster(getClusters: () => ClusterResult,
        environment: Environment,
        position: Vector): { firstCluster: number[]; targetCluster: number[]; } {
        const clusterResult = getClusters();
        const clusters = clusterResult.clusters.sort((a, b) => a.length - b.length);
        if (clusters.length >= 2) {
            return {
                firstCluster: clusters[0],
                targetCluster: clusters[clusters.length - 1]
            }
        }
        console.log('too less clusters');
        return { firstCluster: [], targetCluster: [] };

    }

}