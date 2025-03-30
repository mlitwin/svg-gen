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

    });
});