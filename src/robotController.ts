import { Body, Bodies, Vertices, World, Vector } from "matter-js";
import { Environment } from "./environment";

export class RobotController {
    public static Label = 'robot';
    public readonly body: Body;
    // To be adjusted.
    private readonly angleOffset = Math.PI * 1.5;
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
            Body.setAngle(this.body, this.body.angle + angle);
            resolve();
        });
    }

    public moveToPosition(targetX: number, targetY: number) {
        return new Promise((resolve, reject) => {
            const targetPosition = { x: targetX, y: targetY };
            const Movespeed = 5;
            const target = Bodies.circle(targetX, targetY, 5, {
                isSensor: true,
                render: {
                    fillStyle: 'red'
                }
            });
            World.add(this.environment.engine.world, target);
            this.updateFunction = () => {
                const targetAngle = this.angleOffset + this.getAngle(this.body.position, targetX, targetY);
                const remainingDistance = Math.sqrt(
                    (this.body.position.x - targetPosition.x) * (this.body.position.x - targetPosition.x) +
                    (this.body.position.y - targetPosition.y) * (this.body.position.y - targetPosition.y));
                if (Movespeed > remainingDistance) {
                    Body.setVelocity(this.body, { x: 0, y: 0 });
                    Body.setPosition(this.body, targetPosition);
                    this.rejectFunction = undefined;
                    this.updateFunction = undefined;
                    World.remove(this.environment.engine.world, target);
                    resolve();
                    return;
                }
                Body.setAngle(this.body, targetAngle);
                Body.setVelocity(this.body,
                    {
                        x: Movespeed * Math.cos((targetAngle - this.angleOffset)),
                        y: Movespeed * Math.sin((targetAngle - this.angleOffset))
                    });
                this.rejectFunction = reject;
            };
        });
    }
    public getAngle(target: Vector, x: number, y: number) {
        let angle = (Math.atan2(y - target.y, x - target.x));
        return angle;
    }
    public move(distance: number) {
        const x = this.body.position.x + distance * Math.cos(this.body.angle - this.angleOffset);
        const y = this.body.position.y + distance * Math.sin(this.body.angle - this.angleOffset);
        return this.moveToPosition(x, y);
    }
}