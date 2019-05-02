import { Engine, Render, Body, Mouse, MouseConstraint } from "matter-js";
import { Robot } from "./robot";
import { ClusterCalculator } from "./ClusterCalculator";
import { ClusterResult } from "./ClusterResult";

export interface Environment {
    mouse: Mouse,
    engine: Engine,
    renderer: Render,
    robots: Robot[],
    balls: Ball[],
    mouseConstraint: MouseConstraint,
    calculator: ClusterCalculator,
    debugOptions: DebugOptions,
    clusters: ClusterResult
}
export interface DebugOptions {
    showWaypoints: Boolean,
    showMouse: Boolean,
    showTarget: Boolean,
    showWireframe: Boolean
}
export type Ball = Body;

