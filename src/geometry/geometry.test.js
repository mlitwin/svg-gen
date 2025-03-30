import { describe, it, expect } from 'vitest';
import Geom from './geometry.js';
import { Matrix } from '../matrix/matrix.js';

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
                [0, 0, 5],
                [0, 5, 5],
                [7, 0, 5],
            ]);

            const result = Geom.ProjectiveXYProjection(eye, affinePoints);

            expect(result).toEqual([
                { x: 0, y: 0 },
                { x: 0, y: 5 },
                { x: 10, y: 10 },
            ]);
        });

        it('should handle edge cases where z is equal to eye.z', () => {
            const eye = { x: 0, y: 0, z: 10 };
            const affinePoints = new Matrix([
                [1],
                [2],
                [10],
            ]);



            const result = Geom.ProjectiveXYProjection(eye, affinePoints);

            expect(result).toEqual([{ x: Infinity, y: Infinity }]);
        });
        describe('EllipseFromPoints', () => {
            it('should compute ellipse coefficients from an array of points', () => {
                const points = [
                    { x: 1, y: 2 },
                    { x: 3, y: 4 },
                    { x: 5, y: 6 },
                    { x: 7, y: 8 },
                    { x: 9, y: 10 },
                ];

                const result = Geom.EllipseFromPoints(points);

                expect(result).toHaveProperty('A');
                expect(result).toHaveProperty('B');
                expect(result).toHaveProperty('C');
                expect(result).toHaveProperty('D');
                expect(result).toHaveProperty('E');
            });

           /* it('should return coefficients that satisfy the ellipse equation for the given points', () => {
                const points = [
                    { x: 1, y: 2 },
                    { x: 2, y: 3 },
                    { x: 3, y: 7 },
                    { x: 4, y: 10 },
                    { x: 5, y: 11 },
                ];

                const { A, B, C, D, E } = Geom.EllipseFromPoints(points);

                points.forEach(({ x, y }) => {
                    const equationResult = A * x ** 2 + B * y ** 2 + C * x * y + D * x + E * y;
                    expect(equationResult).toBeCloseTo(1, 5);
                });
            }); */
        });
    });
});