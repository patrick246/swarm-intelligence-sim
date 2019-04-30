import { Body, Bodies, Vertices, World } from "matter-js";
import { Environment } from "./environment";

export class RobotController {
    public static Label = 'robot';
    public readonly body: Body;
    private readonly angleOffset = 240;
    private updateFunction: () => void;
    private rejectFunction: (reason: any) => void;
    constructor(x: number, y: number, rot: number, private readonly environment: Environment) {
        const bot = Vertices.fromPath('0 0 0 10 -10 20 -9 21 5 10 19 21 20 20 10 10 10 0', null);
        this.body = Bodies.fromVertices(x, y,
            [bot], {
                label: RobotController.Label,
                inertia: Infinity,
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
    public handleCollision() {
        console.log("bot collision!");
        this.rejectFunction('collision');
    }
    public Update() {
        if (this.updateFunction !== undefined) {
            this.updateFunction();
        }
    }

    public rotate(angle: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.rejectFunction = reject;
            Body.setAngle(this.body, angle + this.angleOffset);
            resolve();
        });
    }

    public move(distance: number) {
        return new Promise((resolve, reject) => {
            this.rejectFunction = reject;
            const Movespeed = 2;
            let targetPosition = {
                x: this.body.position.x + Math.cos(this.body.angle + this.angleOffset) * distance,
                y: this.body.position.y + Math.sin(this.body.angle + this.angleOffset) * distance
            };
            this.updateFunction = () => {

                const remainingDistance = Math.sqrt(
                    (this.body.position.x - targetPosition.x) * (this.body.position.x - targetPosition.x) +
                    (this.body.position.y - targetPosition.y) * (this.body.position.y - targetPosition.y));
                console.log(remainingDistance);
                if (Movespeed > remainingDistance) {
                    console.log('arrived');
                    Body.setVelocity(this.body, { x: 0, y: 0 });
                    Body.setPosition(this.body, targetPosition);
                    this.rejectFunction = undefined;
                    this.updateFunction = undefined;
                    resolve();
                    return;
                }
                Body.setVelocity(this.body,
                    {
                        x: Movespeed * Math.cos((this.body.angle + this.angleOffset)),
                        y: Movespeed * Math.sin((this.body.angle + this.angleOffset))
                    });
            };
            Body.setVelocity(this.body,
                {
                    x: Movespeed * Math.cos((this.body.angle + this.angleOffset)),
                    y: Movespeed * Math.sin((this.body.angle + this.angleOffset))
                });
        });
    }
}