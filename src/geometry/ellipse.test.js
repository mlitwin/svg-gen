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
    describe('ArcWithPerspective', () => {
        const perspectives = [
            {
                eye: { x: 0, y: 0, z: 2 },
                transform: Matrix.Identity(4),
            },
            {
                eye: { x: 0, y: 0, z: 2500 },
                transform: Matrix.Identity(4).Transform([
                    {
                        op: "Translate",
                        args: { vec: [0, -100, 0] }
                    },
                    {
                        op: "Rotate",
                        args: { axes: "X", angle: Math.PI / 2 }
                    },
                ])
            },
            {
                eye: { x: 0, y: 0, z: 2500 },
                transform: Matrix.Identity(4).Transform([
                    {
                        op: "Rotate",
                        args: { axes: "Y", angle: Math.PI / 4 }
                    },
                ])
            },
            {
                eye: { x: 1000, y: 0, z: 2500 },
                transform: Matrix.Identity(4).Transform([
                    {
                        op: "Translate",
                        args: { vec: [0, -100, 0] }
                    },
                    {
                        op: "Rotate",
                        args: { axes: "X", angle: Math.PI / 2 }
                    },
                ])
            },
        ]
        const ellipses = [
            { cx: 0, cy: 0, rx: 2, ry: 1 },
            { cx: 10, cy: 20, rx: 2, ry: 6 },
            { cx: 10, cy: 20, rx: 2, ry: 6 },
        ];
        const arcs = [
            { startAngle: 0, endAngle: Math.PI / 2 },
            { startAngle: Math.PI / 2 , endAngle: 0 },
        ];
        perspectives.forEach(({ eye, transform }) => {
            ellipses.forEach(ellipse => {
                arcs.forEach(arc => {
                    it(`should compute arc with perspective for eye=${JSON.stringify(eye)}, ellipse=${JSON.stringify(ellipse)}, arc=${JSON.stringify(arc)}`, () => {
                        const ellipseWithPerspective = Ellipse.EllipseWithPerspective(
                            ellipse.cx, ellipse.cy, ellipse.rx, ellipse.ry, eye, transform
                        );
                        // Find points p0 and p1 on the ellipse at startAngle and endAngle
                        const { cx, cy, rx, ry } = ellipse;
                        function pointOnEllipse(angle) {
                            return {
                                x: cx + rx * Math.cos(angle),
                                y: cy + ry * Math.sin(angle),
                            };
                        }
                        const p0 = pointOnEllipse(arc.startAngle);
                        const p1 = pointOnEllipse(arc.endAngle);
                        const largeArcFlag = Math.abs(arc.endAngle - arc.startAngle) > Math.PI ? 1 : 0;
                        const sweepFlag = arc.endAngle > arc.startAngle ? 1 : 0;
                        const av = [ellipse.rx, ellipse.ry, 0, largeArcFlag, sweepFlag, p1.x, p1.y];
                        const arcWithPerspective = Ellipse.ArcWithPerspective(
                            p0, av, { eye, transform }
                        );
                        if (arcWithPerspective.line) {
                            // If the arc is a line, we should not have an arc
                            expect(arcWithPerspective.arc).toBeUndefined();
                        } else {
                            const av1 = arcWithPerspective.arc;
                            const [rx1, ry1, xAxisRotation1, largeArcFlag1, sweepFlag1, x1, y1] = av1;
                            console.log(av1)
                            expect(rx1).toBeCloseTo(ellipseWithPerspective.ellipse.rx);
                            expect(ry1).toBeCloseTo(ellipseWithPerspective.ellipse.ry);
                        }

                    });
                });
            });
        });
    });
});