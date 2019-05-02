import { simulationEnvironment } from ".";
import { World } from "matter-js";

document.onkeypress = (e: KeyboardEvent) => {
    const input = e.key.toLowerCase();
    if (input === 'a') {
        simulationEnvironment.debugOptions.showWaypoints = !simulationEnvironment.debugOptions.showWaypoints;
    }
    if (input === 's') {
        simulationEnvironment.debugOptions.showMouse = !simulationEnvironment.debugOptions.showMouse;
        if (simulationEnvironment.debugOptions.showMouse) {
            World.add(simulationEnvironment.engine.world, simulationEnvironment.mouseConstraint);
        }
        else {
            World.remove(simulationEnvironment.engine.world, simulationEnvironment.mouseConstraint as any);
        }
    }
    if (input === 'd') {
        simulationEnvironment.debugOptions.showTarget = !simulationEnvironment.debugOptions.showTarget;
    }
    if (input === 'f') {
        simulationEnvironment.renderer.options.wireframes =
            simulationEnvironment.debugOptions.showWaypoints = !simulationEnvironment.debugOptions.showWaypoints;

    }

};