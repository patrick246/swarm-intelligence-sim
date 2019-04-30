import { Body, Bodies, Vertices, World } from "matter-js";
import { Environment } from "./environment";

export class RobotController {
    private readonly body: Body;
    private readonly angleOffset = 240;
    constructor(x: number, y: number, rot: number, private readonly environment: Environment) {
        const bot = Vertices.fromPath('0 0 0 10 -10 20 -9 21 5 10 19 21 20 20 10 10 10 0', null);
        this.body = Bodies.fromVertices(x, y,
            [bot], {
                render: {
                    fillStyle: 'blue',
                    lineWidth: 1,// = bump width
                    strokeStyle: 'blue'
                }
            }, true);
        Body.scale(this.body, 3, 3);
        Body.rotate(this.body, rot);
        World.add(this.environment.engine.world, [this.body]);
    }

    public rotate(angle: number) {
        Body.setAngle(this.body, angle + this.angleOffset);
    }

    public moveForward() {
        const Movespeed = 3;
        Body.setVelocity(this.body,
            {
                x: Movespeed * Math.cos((this.body.angle + this.angleOffset)),
                y: Movespeed * Math.sin((this.body.angle + this.angleOffset))
            });
    }
}