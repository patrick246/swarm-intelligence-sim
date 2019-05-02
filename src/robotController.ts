import { Body, Bodies, Vertices, World, Vector } from "matter-js";
import { Environment } from "./environment";

export class RobotController {
    public static Label = 'robot';
    public readonly body: Body;
    // To be adjusted.
    private readonly angleOffset = Math.PI * 1.5;
    private updateFunction: (() => void)[] = [];
    private rejectFunction: ((reason: any) => void)[] = [];
    constructor(x: number, y: number, rot: number, private readonly environment: Environment) {
        const bot = Vertices.fromPath('0 0 0 10 -7 10 -7 25 -5 25 -5 12 15 12 15 25 17 25 17 10 10 10 10 0 0 0', null);
        this.body = Bodies.fromVertices(x, y,
            [bot], {
                label: RobotController.Label,
                inertia: Infinity,
                frictionStatic: 1,
                render: {
                    fillStyle: 'blue',
                    lineWidth: 1,// = bump width
                    strokeStyle: 'blue'
                }
            }, true);
        Body.scale(this.body, 2, 2);
        Body.rotate(this.body, rot);
        World.add(this.environment.engine.world, [this.body]);
    }
    public handleCollision() {
        console.log("bot collision!");
        this.rejectFunction.pop()('collision');
    }
    public Update() {
        if (this.updateFunction.length > 0) {
            this.updateFunction[this.updateFunction.length - 1]();
        }
    }

    public rotate(angle: number): Promise<void> {
        const wrapMax = (x, max) => (max + x % max) % max;
        const wrapAround = (x, min, max) => min + wrapMax(x - min, max - min);
        return new Promise((resolve, reject) => {
            const rotationSpeed = Math.PI * 0.005;
            const targetRotation = wrapAround((this.body.angle + angle), -Math.PI, Math.PI);
            //this.rejectFunction = reject;
            this.updateFunction.push(() => {
                const remainingRotation = wrapAround(targetRotation - this.body.angle, -Math.PI, Math.PI);
                if (Math.abs(remainingRotation) < 0.05 * Math.PI) {
                    Body.setAngle(this.body, targetRotation);
                    Body.setAngularVelocity(this.body, 0);
                    Body.setVelocity(this.body, { x: 0, y: 0 });
                    this.rejectFunction.pop();
                    this.updateFunction.pop();
                    resolve();
                    return;
                }
                Body.setAngularVelocity(this.body, (remainingRotation > 0) ? rotationSpeed : - rotationSpeed);
                Body.setVelocity(this.body, { x: 0, y: 0 });
                //Body.setAngle(this.body, this.body.angle + remainingRotation);
            });
        });
    }
    public moveAroundBoxToPosition(targetX: number, targetY: number, height: number, width: number): Promise<any> {

        let lastPoint = {
            x: targetX,
            y: targetY
        } as Vector;

        const targetAngle = this.getAngle(this.body.position, targetX, targetY);
        const sqSize = Math.sqrt(height * height + width * width);

        const directionalOffset = {
            x: 2 * sqSize * Math.cos(targetAngle),
            y: 2 * sqSize * Math.sin(targetAngle),
        } as Vector;
        const leftOffset = Vector.rotate(directionalOffset, Math.PI / 2);

        const firstPoint = Vector.sub(lastPoint, directionalOffset);
        const secondPoint = Vector.add(firstPoint, leftOffset);
        const thirdPoint = Vector.add(secondPoint, directionalOffset);
        const fourthPoint = Vector.add(lastPoint, Vector.mult(directionalOffset, 0.25))
        const returnValue = this.moveToPosition(firstPoint.x, firstPoint.y)
            .then(() => this.moveToPosition(secondPoint.x, secondPoint.y))
            .then(() => this.moveToPosition(thirdPoint.x, thirdPoint.y))
            .then(() => this.moveToPosition(fourthPoint.x, fourthPoint.y))
            .then(() => this.moveToPosition(lastPoint.x, lastPoint.y));

        if (this.environment.debugOptions.showWaypoints) {
            const waypoints = [this.body.position, firstPoint, secondPoint, thirdPoint, lastPoint]
                .map(dot => Bodies.circle(dot.x, dot.y, 3, {
                    isSensor: true,
                    render: {
                        fillStyle: 'red'
                    }
                }));
            waypoints.forEach(body => World.add(this.environment.engine.world, body));
            return returnValue.then(() => waypoints.forEach(body => World.remove(this.environment.engine.world, body)));
        }
        return returnValue;
    }

    public moveToPosition(targetX: number, targetY: number) {
        return new Promise((resolveFunction, rejectFunction) => {
            const targetPosition = { x: targetX, y: targetY };
            const Movespeed = 5;

            let reject = rejectFunction;
            let resolve = resolveFunction;

            if (this.environment.debugOptions.showTarget) {
                const target = Bodies.circle(targetX, targetY, 5, {
                    isSensor: true,
                    render: {
                        fillStyle: 'green'
                    }
                });

                World.add(this.environment.engine.world, target);
                reject = () => {
                    World.remove(this.environment.engine.world, target);
                    rejectFunction();
                }
                resolve = () => {
                    World.remove(this.environment.engine.world, target);
                    resolveFunction();
                }
            }
            this.rejectFunction.push(reject);
            this.updateFunction.push(async () => {
                console.log('moveUpdate');
                const targetAngle = this.angleOffset + this.getAngle(this.body.position, targetX, targetY);
                const remainingDistance = Math.sqrt(
                    (this.body.position.x - targetPosition.x) * (this.body.position.x - targetPosition.x) +
                    (this.body.position.y - targetPosition.y) * (this.body.position.y - targetPosition.y));
                if (Movespeed > remainingDistance) {
                    Body.setVelocity(this.body, { x: 0, y: 0 });
                    Body.setPosition(this.body, targetPosition);
                    this.rejectFunction.pop();
                    this.updateFunction.pop();
                    resolve();
                    return;
                }
                this.rotate(targetAngle - this.body.angle).then(() => { });
                Body.setVelocity(this.body,
                    {
                        x: Movespeed * Math.cos((targetAngle - this.angleOffset)),
                        y: Movespeed * Math.sin((targetAngle - this.angleOffset))
                    });
            });
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
    public moveBackward(distance: number) {
        console.log('backward');
        const x = this.body.position.x - distance * Math.cos(this.body.angle - this.angleOffset);
        const y = this.body.position.y - distance * Math.sin(this.body.angle - this.angleOffset);
        return new Promise((resolveFunction, rejectFunction) => {
            const targetPosition = { x, y };
            const Movespeed = 5;

            let reject = rejectFunction;
            let resolve = resolveFunction;

            if (this.environment.debugOptions.showTarget) {
                const target = Bodies.circle(x, y, 5, {
                    isSensor: true,
                    render: {
                        fillStyle: 'green'
                    }
                });

                World.add(this.environment.engine.world, target);
                reject = () => {
                    World.remove(this.environment.engine.world, target);
                    rejectFunction();
                }
                resolve = () => {
                    World.remove(this.environment.engine.world, target);
                    resolveFunction();
                }
            }
            this.rejectFunction.push(reject);
            this.updateFunction.push(async () => {
                console.log('moveUpdate');
                const targetAngle = this.angleOffset + this.getAngle(this.body.position, x, y);
                const remainingDistance = Math.sqrt(
                    (this.body.position.x - targetPosition.x) * (this.body.position.x - targetPosition.x) +
                    (this.body.position.y - targetPosition.y) * (this.body.position.y - targetPosition.y));
                if (Movespeed > remainingDistance) {
                    Body.setVelocity(this.body, { x: 0, y: 0 });
                    Body.setPosition(this.body, targetPosition);
                    this.rejectFunction.pop();
                    this.updateFunction.pop();
                    resolve();
                    return;
                }
                Body.setVelocity(this.body,
                    {
                        x: Movespeed * Math.cos((targetAngle - this.angleOffset)),
                        y: Movespeed * Math.sin((targetAngle - this.angleOffset))
                    });
            });
        });
    }
}