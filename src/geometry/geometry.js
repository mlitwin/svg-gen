/**
 * @file geometry.js
 * @description This module provides a `Geom` object that serves as a container 
 * for various geometry-related functions.
 * 
 * @module geometry
 */

import { Matrix } from '../matrix/matrix.js';

function quadratic(a, b, c) {
    const discriminant = b ** 2 - 4 * a * c;

    if (discriminant < 0) {
        return []; // No real roots
    }

    const sqrtDiscriminant = Math.sqrt(discriminant);

    if (b >= 0) {
        const x1 = (-b - sqrtDiscriminant) / (2 * a);
        const x2 = (2 * c) / (-b - sqrtDiscriminant);
        return [x1, x2];
    } else {
        const x1 = (2 * c) / (-b + sqrtDiscriminant);
        const x2 = (-b + sqrtDiscriminant) / (2 * a);
        return [x1, x2];
    }
}

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
        // https://en.wikipedia.org/wiki/Conic_section#Conversion_to_canonical_form
        const { A, B, C, D, E } = coefficients;
        const F = -1; // The general conic equation is assumed to be normalized such that F = -1.

        const AQ = new Matrix([
            [A, B / 2, D / 2],
            [B / 2, C, E / 2],
            [D / 2, E / 2, F]
        ]);

        const A33 = new Matrix([
            [A, B / 2],
            [B / 2, C]
        ]);

        const d0 = B ** 2 - 4 * A * C;

        const b = (A+C);
        const c = A*C - (B/2)**2;
    

        const [l1, l2] = quadratic(1, -b, c);
        
        const x0 = (2 * C * D - B * E) / d0;
        const y0 = (2 * A * E - B * D) / d0;

        const theta = 0.5 * Math.atan2(-B, C - A);

        
        const K = - (AQ.det() / A33.det());


        const rx = Math.sqrt(K / l1); 
        const ry = Math.sqrt(K / l2);
        
        return { cx: x0, cy: y0, rx, ry, theta };
    },
    PointsWithPerspective(points, eye, transform) {

        if (transform.m !== 4 || transform.n !== 4) {
            throw new Error("Transform matrix must be 4x4.");
        }
    
        const transformed = transform.Mult(points);
        const perspectivePoints = Geom.ProjectiveXYProjection(eye, transformed);
        return perspectivePoints;
    },
    /**
     * Generates an ellipse in the xy plane via perspective projection from the given
     *  ellipse defined by an affine transform of an ellipse defined in the xy plane.
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

        if (transform.m !== 4 || transform.n !== 4) {
            throw new Error("Transform matrix must be 4x4.");
        }
        
        const points = new Matrix(Array.from({ length: 8 }, (_, i) => {
            const angle = (i * 2 * Math.PI) / 8;
            return [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle), 0, 1];
    
        })).Transpose();

    
        const transformed = transform.Mult(points);
        
        const perspectivePoints = Geom.ProjectiveXYProjection(eye, transformed);
        const standard = Geom.EllipseFromPoints(perspectivePoints);

        //console.log("transformed", transformed.Transpose());
        //console.log("perspectivePoints", perspectivePoints);
        //console.log("standard", standard);

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
        if (affinePoints.m !== 4) {
            throw new Error("Affine points matrix must have 4 rows.");
        }
        //console.log("ProjectiveXYProjection affinePoints", affinePoints)
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
