/**
 * @file geometry.js
 * @description This module provides a `Geom` object that serves as a container 
 * for various geometry-related functions.
 * 
 * @module geometry
 */

import {Matrix} from '../matrix/matrix.js';

const Geom = {
    /**
     * Computes the coefficients of a general ellipse in the x-y plane
     * from an array of points.
     * 
     * @param {Array<{x: number, y: number}>} points - An array of points with x and y coordinates.
     * @returns {Array<number>} The coefficients of the general ellipse equation [A(x^2), B(y^2), C(xy), D(x), E(y)].
     */
    EllipseFromPoints(points) {
        const matrixRows = points.map(({ x, y }) => [x ** 2, y ** 2, x * y, x, y]);
        const matrix = new Matrix(matrixRows);
        return matrix;
        // Function implementation will go here
    },
    /**
     * Projects a set of 3D affine points onto a 2D plane using a projective transformation.
     *
     * @param {{x: number, y: number, z: number}} eye - The eye or camera position in 3D space.
     * @param {Array<Array<number>>} affinePoints - A matrix representing the affine points in 3D space.
     * @returns {Array<{x: number, y: number}>} An array of 2D points resulting from the projection.
     */
    ProjectiveXYProjection(eye, affinePoints) {
        const projectedPoints = [];

        for (let j = 0; j < affinePoints.n; j++) {
            const [x, y, z] = [affinePoints[0][j], affinePoints[1][j], affinePoints[2][j]];
            const scale = eye.z / (eye.z - z);
            const projectedX = eye.x + scale * (x - eye.x);
            const projectedY = eye.y + scale * (y - eye.y);

            projectedPoints.push({ x: projectedX, y: projectedY });
        }

        return projectedPoints;
    }
};

export default Geom;
