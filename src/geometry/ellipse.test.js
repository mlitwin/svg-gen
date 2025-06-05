import { describe, it, expect, beforeAll } from 'vitest';
import Geom from './geometry.js';
import Ellipse from './ellipse.js';
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
                if (isNaN(received[key])) {
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

describe('Ellipse', () => {


    describe('EllipseFromPoints', () => {
        it('should compute ellipse coefficients from an array of points', () => {
            const points = [
                { x: 1, y: 0 },
                { x: 0, y: 1 },
                { x: -1, y: 0 },
                { x: 0, y: -1 },
                { x: Math.SQRT1_2, y: Math.SQRT1_2 },
            ];

            const result = Ellipse.EllipseFromPoints(points);

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

            const { A, B, C, D, E } = Ellipse.EllipseFromPoints(points);

            points.forEach(({ x, y }) => {
                const equationResult = A * x ** 2 + B * x * y + C * y ** 2 + D * x + E * y;
                expect(equationResult).toBeCloseTo(1, 5);
            });
        });

        it('should return coefficients that satisfy the ellipse equation for the given points 2', () => {
            const points = [
                { x: 10.572566465066387, y: -192.04443917785403 },
                { x: -30.10812199144638, y: -93.83256937946628 },
                { x: -128.31999178983415, y: -53.151880922953495 },
                { x: -226.5318615882219, y: -93.83256937946626 },
                { x: -267.2125500447347, y: -192.044439177854 },
                { x: -226.53186158822194, y: -290.25630897624177 },
                { x: -128.31999178983418, y: -330.93699743275454 },
                { x: -30.10812199144641, y: -290.2563089762418 }
            ];

            const { A, B, C, D, E } = Ellipse.EllipseFromPoints(points);

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

            const result = Ellipse.EllipseStandardForm(coefficients);

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

            const result = Ellipse.EllipseStandardForm(coefficients);

            expect(result).toBeCloseToObject({
                cx: 1,
                cy: 2,
                rx: 1,
                ry: 1,
                theta: 0,
            });
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

            const result = Ellipse.EllipseWithPerspective(0, 0, 2, 1, eye, transform);
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
});