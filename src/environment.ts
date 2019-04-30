import { Engine, Render } from "matter-js";

export interface Environment {
    engine: Engine,
    renderer: Render
}