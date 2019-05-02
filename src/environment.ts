import { Engine, Render, Body, Mouse, MouseConstraint } from "matter-js";
import { Robot } from "./robot";

export interface Environment {
    mouse: Mouse,
    engine: Engine,
    renderer: Render,
    robots: Robot[],
    balls: Ball[],
    mouseConstraint: MouseConstraint,
    debugOptions: DebugOptions,
}
export interface DebugOptions {
    showWaypoints: Boolean,
    showMouse: Boolean,
    showTarget: Boolean,
    showWireframe:Boolean
}
export type Ball = Body;

