import { ClusterSelector } from "./ClusterSelector";

export interface PathStrategy {
    updatePath(clusterSelector: ClusterSelector);
}
