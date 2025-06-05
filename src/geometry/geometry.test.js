import { describe, it, expect, beforeAll } from 'vitest';
import Geom from './geometry.js';
import { Matrix } from '../matrix/matrix.js';

beforeAll(() => {
    expect.extend({
        toBeCloseToObject(received, expected, precision = 2) {
            const errors = Object.keys(expected).filter((key) => {
                if (undefined === expected[key]) {
                    return undefined == received[key];
                }
                if (isNaN(expected[key])) {
                    return !isNaN(received[key]);
                }
                if(isNaN(received[key])) {
                    return true;
                }
                return Math.abs(received[key] - expected[key]) >= Math.pow(10, -precision) / 2
            }
            ).map(key => `${key}: received ${received[key]} expected ${expected[key]}`);

            if (errors.length === 0) {
                return {
                    message: () => `expected ${JSON.stringify(received)} to be close to ${JSON.stringify(expected)} within precision ${precision}`,
                    pass: true,
                };
            } else {
                return {
                    message: () => `expected  ${JSON.stringify(received)} to be close to ${JSON.stringify(expected)} within precision ${precision}. Differences found in keys: ${errors.join(', ')}`,
                    pass: false,
                };
            }
        },
    });
});

describe('Geom', () => {

    describe('PerspectiveXYProjection', () => {
        it('should project 3D points onto a 2D plane', () => {
            const eye = { x: 0, y: 0, z: 10 };
            const affinePoints = new Matrix([
                [0, 0, 0],
                [0, 5, 0],
                [0, 0, 5],
                [1, 1, 1],
            ]);

            const result = Geom.PerspectiveXYProjection(eye, affinePoints);

            expect(result).toEqual([
                { x: 0, y: 0 },
                { x: 0, y: 5 },
                { x: 0, y: 0 },
            ]);
        });
        it('should project 3D points onto a 2D plane in a more complicated situation', () => {
            const eye = { x: 0, y: 0, z: 10 };
            const affinePoints = new Matrix([
                [0, 0, 0],
                [0, 5, 0],
                [0, 5, 5],
                [1, 1, 1],
            ]);

            const result = Geom.PerspectiveXYProjection(eye, affinePoints);

            expect(result).toEqual([
                { x: 0, y: 0 },
                { x: 0, y: 10 },
                { x: 0, y: 0 },
            ]);
        });
    });

    describe('PointsWithPerspective', () => {
        it('should compute points with perspective transformation applied', () => {
            const points = new Matrix([
                [0, 0, 0, 1],
                [0, 5, 0, 1],
                [0, 0, 5, 1],
                [1, 1, 1, 1],
            ]).Transpose();
            const eye = { x: 0, y: 0, z: 2 };
            const transform = new Matrix([
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1],
            ]);
            const result = Geom.PointsWithPerspective(points, eye, transform);
            expect(result).toBeCloseToObject([
                { x: 0, y: 0 },
                { x: 0, y: 5 },
                { x: 0, y: 0 },
            ]);
        });

    });
 
    describe('LineFromIntersectionOfPlanes', () => {
        it('should compute the intersection line of two planes', () => {
            const plane1 = {
                point: [0, 0, 0],
                normal: [1, 0, 0],
            };
            const plane2 = {
                point: [0, 0, 0],
                normal: [0, 1, 0],
            };

            const result = Geom.LineFromIntersectionOfPlanes(plane1, plane2);

            expect(result).toEqual({
                direction: [0, 0, 1],
                point: [0, 0, 0],
            });
        });
    });
    describe('PointFromIntersectionOfLinesInPlane', () => {
        it('should compute the intersection point of two lines in a plane', () => {
            const line1 = { p0: {x:0, y:0}, p1: {x:4, y:4}};

            const line2 = { p0: {x:0, y:4}, p1: {x:4, y:0}};


            const result = Geom.PointFromIntersectionOfLinesInPlane(line1, line2);

            expect(result).toBeCloseToObject({
                point: {x: 2, y: 2},
                l: 0.5,
            });
        });
    });
    describe('PolygonFromLineIntersectionPolygon', () => {
        it('should compute the intersection of a line with a polygon and return the resulting polygon', () => {
            const line = { p0: {x:2, y:0}, p1: {x:2, y:4}};
            const sidePoint = 1;
            const polygon = [
                { x: 0, y: 0 },
                { x: 4, y: 0 },
                { x: 4, y: 4 },
                { x: 0, y: 4 },
            ];

            const result = Geom.PolygonFromLineIntersectionPolygon(line.p0, line.p1, sidePoint, polygon);

            expect(result).toBeCloseToObject([
                { x: 0, y: 0 },
                { x: 2, y: 0 },
                { x: 2, y: 4 },
                { x: 0, y: 4 },
            ]);
        });
        it('should compute the intersection of a line with a polygon and where the line hits vertices of the polygon ', () => {
            const line = { p0: {x:0, y:0}, p1: {x:4, y:4}};

            const sidePoint = 0;
            const polygon = [
                { x: 0, y: 0 },
                { x: 4, y: 0 },
                { x: 4, y: 4 },
                { x: 0, y: 4 },
            ];

            const result = Geom.PolygonFromLineIntersectionPolygon(line.p0, line.p1, sidePoint, polygon);

            expect(result).toBeCloseToObject([
                { x: 0, y: 0 },
                { x: 4, y: 4 },
                { x: 0, y: 4 },
            ]);
        });
    });
});