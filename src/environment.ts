import { Engine, Render, Body } from "matter-js";
import { Robot } from "./robot";

export interface Environment {
    engine: Engine,
    renderer: Render,
    robots: Robot[],
    balls: Ball[]
}
export type Ball = Body;

