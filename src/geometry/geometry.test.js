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

    describe('ProjectiveXYProjection', () => {
        it('should project 3D points onto a 2D plane', () => {
            const eye = { x: 0, y: 0, z: 10 };
            const affinePoints = new Matrix([
                [0, 0, 0],
                [0, 5, 0],
                [0, 0, 5],
                [1, 1, 1],
            ]);

            const result = Geom.ProjectiveXYProjection(eye, affinePoints);

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

            const result = Geom.ProjectiveXYProjection(eye, affinePoints);

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

    describe('PlanesIntersection', () => {
        it('should find intersection of two perpendicular planes', () => {
            const plane1 = {
                point: [0, 0, 0],
                normal: [0, 0, 1]  // xy-plane
            };
            const plane2 = {
                point: [0, 0, 0],
                normal: [0, 1, 0]  // xz-plane
            };

            const result = Geom.PlanesIntersection(plane1, plane2);
            
            // Should intersect along x-axis (direction can be either [1,0,0] or [-1,0,0])
            expect(result.point).toBeCloseToObject([0, 0, 0]);
            expect(Math.abs(result.direction[0])).toBeCloseTo(1);
            expect(result.direction[1]).toBeCloseTo(0);
            expect(result.direction[2]).toBeCloseTo(0);
        });

        it('should find intersection of two non-perpendicular planes', () => {
            const plane1 = {
                point: [0, 0, 0],
                normal: [1, 1, 0]  // plane at 45 degrees to x and y axes
            };
            const plane2 = {
                point: [0, 0, 0],
                normal: [0, 1, 1]  // plane at 45 degrees to y and z axes
            };

            const result = Geom.PlanesIntersection(plane1, plane2);
            
            // Verify point lies on both planes
            const dot1 = result.point[0] + result.point[1];  // dot product with plane1 normal
            const dot2 = result.point[1] + result.point[2];  // dot product with plane2 normal
            expect(dot1).toBeCloseTo(0);
            expect(dot2).toBeCloseTo(0);
            
            // Verify direction is perpendicular to both normals
            const dotDir1 = result.direction[0] + result.direction[1];
            const dotDir2 = result.direction[1] + result.direction[2];
            expect(dotDir1).toBeCloseTo(0);
            expect(dotDir2).toBeCloseTo(0);
        });

        it('should handle parallel planes', () => {
            const plane1 = {
                point: [0, 0, 0],
                normal: [0, 0, 1]
            };
            const plane2 = {
                point: [0, 0, 1],  // parallel plane shifted up by 1
                normal: [0, 0, 1]
            };

            const result = Geom.PlanesIntersection(plane1, plane2);
            expect(result).toBeNull();
        });

        it('should handle nearly parallel planes', () => {
            const plane1 = {
                point: [0, 0, 0],
                normal: [0, 0, 1]
            };
            const plane2 = {
                point: [0, 0, 0],
                normal: [0, 0.0001, 1]  // nearly parallel to plane1
            };

            const result = Geom.PlanesIntersection(plane1, plane2);
            expect(result).not.toBeNull();
            
            // Direction should be close to [1, 0, 0] or [-1, 0, 0]
            expect(Math.abs(result.direction[0])).toBeCloseTo(1);
            expect(result.direction[1]).toBeCloseTo(0);
            expect(result.direction[2]).toBeCloseTo(0);
        });

        it('should handle planes with different points', () => {
            const plane1 = {
                point: [1, 2, 3],
                normal: [1, 0, 0]
            };
            const plane2 = {
                point: [4, 5, 6],
                normal: [0, 1, 0]
            };

            const result = Geom.PlanesIntersection(plane1, plane2);
            
            // Point should lie on both planes
            expect(result.point[0]).toBeCloseTo(1);  // x=1 for plane1
            expect(result.point[1]).toBeCloseTo(5);  // y=5 for plane2
            expect(result.direction).toBeCloseToObject([0, 0, 1]);  // z-axis direction
        });
    });
});