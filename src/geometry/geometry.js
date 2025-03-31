/**
 * @file geometry.js
 * @description This module provides a `Geom` object that serves as a container 
 * for various geometry-related functions.
 * 
 * @module geometry
 */

import { Matrix } from '../matrix/matrix.js';

const Geom = {
    /**
     * Computes the coefficients of a general ellipse in the x-y plane
     * from an array of points.
     * 
     * @param {Array<{x: number, y: number}>} points - An array of points with x and y coordinates.
     * @returns {Object<A: number, B: number, C: number, D: number, E: number>} The coefficients of the general ellipse equation Ax^2  + By^2 + Cxy + Dx + Ey = 1.
     */
    EllipseFromPoints(points) {
        const matrixRows = points.map(({ x, y }) => [x ** 2, x * y, y ** 2, x, y]);
        const matrix = new Matrix(matrixRows);
        const svd = matrix.SVD();
        const solution = Matrix.SVDSolve(svd, Array(matrixRows.length).fill(1));

        return { A: solution[0], B: solution[1], C: solution[2], D: solution[3], E: solution[4] };
    },
    /**
     * Converts the coefficients of a general conic equation into the standard form of an ellipse.
     * 
     * The general conic equation is represented as:
     * Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0
     * 
     * This function calculates the center (h, k), semi-major axis, semi-minor axis, and other parameters
     * of the ellipse in standard form.
     * 
     * @param {Object} coefficients - The coefficients of the general conic equation.
     * @param {number} coefficients.A - The coefficient of x^2.
     * @param {number} coefficients.B - The coefficient of xy.
     * @param {number} coefficients.C - The coefficient of y^2.
     * @param {number} coefficients.D - The coefficient of x.
     * @param {number} coefficients.E - The coefficient of y.
     * @returns {Object} An object containing the parameters of the ellipse in standard form.
     * @returns {number} return.cx - The x-coordinate of the center of the ellipse.
     * @returns {number} return.cy - The y-coordinate of the center of the ellipse.
     * @returns {number} return.rx - The semi-major axis of the ellipse.
     * @returns {number} return.ry - The semi-minor axis of the ellipse.
     * @returns {number} return.theta - The rotation angle of the ellipse.
     */
    EllipseStandardForm(coefficients) {
        const { A, B, C, D, E } = coefficients;
        const F = -1; // The general conic equation is assumed to be normalized such that F = -1.

        // Calculate the center (x₀, y₀) of the ellipse
        const denominator = B ** 2 - 4 * A * C;
        const x0 = (2 * C * D - B * E) / denominator;
        const y0 = (2 * A * E - B * D) / denominator;

        // Calculate the semi-major and semi-minor axes
        const term0 = -2 * (A * E ** 2 + C * D ** 2 - B * D * E + denominator* F);
        const term1 = (A + C) + Math.sqrt((A - C) ** 2 + B ** 2);
        const term2 = (A + C) - Math.sqrt((A - C) ** 2 + B ** 2);
        const a = -Math.sqrt((term0 * term1)) / (denominator);
        const rx = 1/(a**2)
       // const rx = (denominator**2)/(term0 * term1);
        const b = -Math.sqrt(term0 * term2) / (denominator);
        const ry = 1/(b**2);

        // Calculate the rotation angle (θ)
        const theta = 0.5 * Math.atan2(-B, C - A);

        return { cx: x0, cy: y0, rx, ry, theta };
    },
    /**
     * Generates an ellipse with perspective transformation applied.
     *
     * @param {number} cx - The x-coordinate of the center of the ellipse.
     * @param {number} cy - The y-coordinate of the center of the ellipse.
     * @param {number} rx - The radius of the ellipse along the x-axis.
     * @param {number} ry - The radius of the ellipse along the y-axis.
     * @param {Array<number>} eye - The coordinates of the eye point for perspective projection [x, y, z].
     * @param {Matrix} transform - A transformation matrix to apply to the ellipse points.
     * @returns {Object} An object representing the ellipse in standard form after perspective transformation.
     */
    EllipseWithPerspective(cx, cy, rx, ry, eye, transform) {
            const points = new Matrix(Array.from({ length: 8 }, (_, i) => {
                const angle = (i * 2 * Math.PI) / 8;
                return [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle), 0, 1];
        
            })).Transpose();
        
            const transformed = transform.Mult(points);
            const perspectivePoints = Geom.ProjectiveXYProjection(eye, transformed);
            //console.log(perspectivePoints)
            const standard = Geom.EllipseFromPoints(perspectivePoints);
            return Geom.EllipseStandardForm(standard);
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
