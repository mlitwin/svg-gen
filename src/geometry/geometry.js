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
        const regression = Geom.LinearRegression(perspectivePoints);


        const standard = Geom.EllipseFromPoints(perspectivePoints);
        const ellipse = Geom.EllipseStandardForm(standard);

        return {ellipse, regression};
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
    },
    /**
     * Performs a linear regression on a set of points to determine the best-fit line.
     * The resulting line equation is in the form Ax + By + C = 0, and the function
     * also calculates the coefficient of determination (r²) to indicate the goodness of fit.
     *
     * @param {Array<{x: number, y: number}>} points - An array of points, where each point is an object with `x` and `y` properties.
     * @returns {{A: number, B: number, C: number, r2: number}} An object containing:
     *   - `A` (number): The coefficient for x in the line equation.
     *   - `B` (number): The coefficient for y in the line equation.
     *   - `C` (number): The constant term in the line equation.
     *   - `r2` (number): The coefficient of determination, indicating the goodness of fit.
     *   - `worstR2` (number): Worst r^2 residual for the points, to check if the points are linear.
     */
    LinearRegression(points) {
    const n = points.length;
    if (n < 2) {
        throw new Error("At least two points are required for linear regression.");
    }

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

    for (const { x, y } of points) {
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
        sumY2 += y * y;
    }

    const meanX = sumX / n;
    const meanY = sumY / n;

    const denominatorX = sumX2 - n * meanX ** 2;
    const denominatorY = sumY2 - n * meanY ** 2;

    if (denominatorX === 0 && denominatorY === 0) {
        throw new Error("All points are identical; linear regression is undefined.");
    }

    let A, B, C;

    if (denominatorX >= denominatorY) {
        const slope = (sumXY - n * meanX * meanY) / denominatorX;
        const intercept = meanY - slope * meanX;
        A = -slope;
        B = 1;
        C = -intercept;
    } else {
        const slope = (sumXY - n * meanX * meanY) / denominatorY;
        const intercept = meanX - slope * meanY;
        A = 1;
        B = -slope;
        C = -intercept;
    }

    const ssTotal = sumY2 - n * meanY ** 2;
    const ssResidual = points.reduce((sum, { x, y }) => {
        const predictedY = -(A * x + C) / B;
        return sum + (y - predictedY) ** 2;
    }, 0);

    const r2 = ssTotal === 0 ? 1 : 1 - ssResidual / ssTotal;
    const worstR2 = points.reduce((worst, { x, y }) => {
        const predictedY = -(A * x + C) / B;
        const residual = Math.abs(y - predictedY);
        return Math.max(worst, residual);
    }, 0);

    const x1 = Math.min(...points.map(p => p.x));
    const x2 = Math.max(...points.map(p => p.x));
    const y1 = -(A * x1 + C) / B;
    const y2 = -(A * x2 + C) / B;
    
    return { A, B, C, r2, worstR2, x1, y1, x2, y2 };
    },
    /**
     * Finds the intersection line of two planes in 3D space.
     * Each plane is defined by a point on the plane and a normal vector.
     * 
     * @param {Object} plane1 - First plane definition
     * @param {Array<number>} plane1.point - Point on the first plane [x, y, z]
     * @param {Array<number>} plane1.normal - Normal vector of the first plane [x, y, z]
     * @param {Object} plane2 - Second plane definition
     * @param {Array<number>} plane2.point - Point on the second plane [x, y, z]
     * @param {Array<number>} plane2.normal - Normal vector of the second plane [x, y, z]
     * @returns {Object} Intersection line definition:
     *                   - point: A point on the intersection line [x, y, z]
     *                   - direction: Direction vector of the intersection line [x, y, z]
     *                   Returns null if planes are parallel
     */
    PlanesIntersection(plane1, plane2) {
        const [n1x, n1y, n1z] = plane1.normal;
        const [n2x, n2y, n2z] = plane2.normal;
        
        // Direction of intersection line is cross product of normals
        const direction = [
            n1y * n2z - n1z * n2y,
            n1z * n2x - n1x * n2z,
            n1x * n2y - n1y * n2x
        ];
        
        // Check if planes are parallel
        const directionMagnitude = Math.sqrt(
            direction[0] * direction[0] + 
            direction[1] * direction[1] + 
            direction[2] * direction[2]
        );
        
        if (directionMagnitude < 1e-10) {
            return null; // Planes are parallel
        }
        
        // Normalize direction vector
        direction[0] /= directionMagnitude;
        direction[1] /= directionMagnitude;
        direction[2] /= directionMagnitude;
        
        // Find a point on the intersection line
        // Using the method from: http://geomalgorithms.com/a05-_intersect-1.html
        const [p1x, p1y, p1z] = plane1.point;
        const [p2x, p2y, p2z] = plane2.point;
        
        const n1n1 = n1x * n1x + n1y * n1y + n1z * n1z;
        const n2n2 = n2x * n2x + n2y * n2y + n2z * n2z;
        const n1n2 = n1x * n2x + n1y * n2y + n1z * n2z;
        
        const d1 = n1x * p1x + n1y * p1y + n1z * p1z;
        const d2 = n2x * p2x + n2y * p2y + n2z * p2z;
        
        const det = n1n1 * n2n2 - n1n2 * n1n2;
        
        const c1 = (d1 * n2n2 - d2 * n1n2) / det;
        const c2 = (d2 * n1n1 - d1 * n1n2) / det;
        
        const point = [
            c1 * n1x + c2 * n2x,
            c1 * n1y + c2 * n2y,
            c1 * n1z + c2 * n2z
        ];
        
        return { point, direction };
    }
    

};


export default Geom;
