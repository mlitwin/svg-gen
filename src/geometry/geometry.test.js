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
    /*
    describe('EllipseFromPoints', () => {
        it('should return a Matrix object from an array of points', () => {
            const points = [
                { x: 1, y: 2 },
                { x: 3, y: 4 },
                { x: 5, y: 6 },
            ];
            const result = Geom.EllipseFromPoints(points);

            expect(result).toBeInstanceOf(Matrix);
            expect(result.rows).toEqual([
                [1, 4, 2, 1, 2],
                [9, 16, 12, 3, 4],
                [25, 36, 30, 5, 6],
            ]);
        });
    });
    */

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
    describe('EllipseFromPoints', () => {
        it('should compute ellipse coefficients from an array of points', () => {
            const points = [
                { x: 1, y: 0 },
                { x: 0, y: 1 },
                { x: -1, y: 0 },
                { x: 0, y: -1 },
                { x: Math.SQRT1_2, y: Math.SQRT1_2 },
            ];

            const result = Geom.EllipseFromPoints(points);

            expect(result).toBeCloseToObject({
                A: 1,
                B: 0,
                C: 1,
                D: 0,
                E: 0,
            });
        });

        it('should return coefficients that satisfy the ellipse equation for the given points', () => {
            const points = [
                { x: 1, y: 2 },
                { x: 2, y: 3 },
                { x: 3, y: 7 },
                { x: 4, y: 10 },
                { x: 5, y: 11 },
            ];

            const { A, B, C, D, E } = Geom.EllipseFromPoints(points);

            points.forEach(({ x, y }) => {
                const equationResult = A * x ** 2 + B * x * y + C * y ** 2 + D * x + E * y;
                expect(equationResult).toBeCloseTo(1, 5);
            });
        });
    });
    describe('EllipseStandardForm', () => {
        it('should compute the standard form of an ellipse from given coefficients', () => {
            const coefficients = {
                A: 1,
                B: 0,
                C: 1,
                D: 0,
                E: 0,
            };

            const result = Geom.EllipseStandardForm(coefficients);

            expect(result).toBeCloseToObject({
                cx: 0,
                cy: 0,
                rx: 1,
                ry: 1,
                theta: 0,
            })
        });

        it('should compute the standard form of a translated ellipse', () => {
            // (x-1)^2 + (y-2)^2 - 1 = 0
            // x^2 + y^2 - 2x - 4y + 4 = 0
            const coefficients = {
                A: 1 / -4,
                B: 0,
                C: 1 / -4,
                D: -2 / -4,
                E: -4 / -4,
            };
            // 

            const result = Geom.EllipseStandardForm(coefficients);

            expect(result).toBeCloseToObject({
                cx: 1,
                cy: 2,
                rx: 1,
                ry: 1,
                theta: 0,
            });
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
    describe('EllipseWithPerspective', () => {
        it('should compute the ellipse coefficients with perspective transformation applied', () => {

            const eye = { x: 0, y: 0, z: 2 };
            const transform = new Matrix([
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1],
            ]);

            const result = Geom.EllipseWithPerspective(0, 0, 2, 1, eye, transform);
            const expected = {
                cx: 0,
                cy: 0,
                rx: 2,
                ry: 1,
                theta: 0,
            };

            expect(result.ellipse).toBeCloseToObject(expected);
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
            const line1 = {
                x0: 0, y0: 0, x1: 4, y1: 4
            };
            const line2 = {
                x0: 0, y0: 4, x1: 4, y1: 0
            };

            const result = Geom.PointFromIntersectionOfLinesInPlane(line1, line2);

            expect(result).toBeCloseToObject({
                x: 2,
                y: 2,
                l: 0.5,
            });
        });
    });
});