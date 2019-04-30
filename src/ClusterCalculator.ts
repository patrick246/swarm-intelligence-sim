import {Body, World} from 'matter-js';
import Cluster from 'hierarchical-clustering';

export class ClusterCalculator {

    public calculate(balls: Body[]) {
        const levels = Cluster({
            input: balls,
            distance: distance,
            linkage: linkage
        }) as any[];

        const filtered = levels.filter(level => level.linkage === null || level.linkage <= 45);
        return filtered[filtered.length - 1];
    }

    public drawBBs(world: World, balls: Body[], clusters: any) {
        //console.log(balls);
        //console.log(clusters);
        const canvas: HTMLCanvasElement = document.getElementsByTagName('canvas')[0];
        const context = canvas.getContext("2d");

        context.strokeStyle = 'green';

        for(let elem of clusters.clusters) {
            const currentBalls = elem.map(i => balls[i]);
            const minX = Math.min.apply(null, currentBalls.map(b => b.position.x));
            const minY = Math.min.apply(null, currentBalls.map(b => b.position.y));
            const maxX = Math.max.apply(null, currentBalls.map(b => b.position.x));
            const maxY = Math.max.apply(null, currentBalls.map(b => b.position.y));
            context.strokeRect(minX - 10, minY - 10, maxX - minX + 20, maxY - minY + 20);
        }
    }
}

function distance(a: Body, b: Body): number {
    const dx = a.position.x - b.position.x;
    const dy = a.position.y - b.position.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function linkage(distances: number[]) {
    return Math.min.apply(null, distances);
}
