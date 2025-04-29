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

        const b = (A + C);
        const c = A * C - (B / 2) ** 2;


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
        const perspectivePoints = Geom.PerspectiveXYProjection(eye, transformed);
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

        const perspectivePoints = Geom.PerspectiveXYProjection(eye, transformed);
        const regression = Geom.LinearRegression(perspectivePoints);


        const standard = Geom.EllipseFromPoints(perspectivePoints);
        const ellipse = Geom.EllipseStandardForm(standard);

        return { ellipse, regression };
    },
    /**
     * Projects a set of 3D affine points onto a 2D plane using a projective transformation.
     *
     * @param {{x: number, y: number, z: number}} eye - The eye or camera position in 3D space.
     * @param {Array<Array<number>>} affinePoints - A matrix representing the affine points in 3D space.
     * @returns {Array<{x: number, y: number}>} An array of 2D points resulting from the projection.
     */
    PerspectiveXYProjection(eye, affinePoints) {
        if (affinePoints.m !== 4) {
            throw new Error("Affine points matrix must have 4 rows.");
        }
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
     * @returns {Object} Intersection line (dx(x-x0), dy(y-y0), dz(z-z0))
    
     */
    LineFromIntersectionOfPlanes(plane1, plane2) {
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

        // Find a point on the line of intersection
        const [p1x, p1y, p1z] = plane1.point;
        const [p2x, p2y, p2z] = plane2.point;

        // Solve for a point on the line by solving the system of equations
        // n1 · (x, y, z) = n1 · p1
        // n2 · (x, y, z) = n2 · p2
        const d1 = n1x * p1x + n1y * p1y + n1z * p1z;
        const d2 = n2x * p2x + n2y * p2y + n2z * p2z;

        // Use the cross product of the normals to find a direction perpendicular to both
        const cross = [
            n1y * n2z - n1z * n2y,
            n1z * n2x - n1x * n2z,
            n1x * n2y - n1y * n2x
        ];

        // Find a point on the line by solving for one coordinate (e.g., z = 0)
        let x0, y0, z0;
        if (Math.abs(cross[2]) > 1e-10) { // If z-component of cross product is non-zero
            z0 = 0;
            const matrix = new Matrix([
                [n1x, n1y],
                [n2x, n2y]
            ]);
            const constants = [d1, d2];
            const [x, y] = matrix.Solve(constants);
            x0 = x;
            y0 = y;
        } else if (Math.abs(cross[1]) > 1e-10) { // If y-component of cross product is non-zero
            y0 = 0;
            const matrix = new Matrix([
                [n1x, n1z],
                [n2x, n2z]
            ]);
            const constants = [d1, d2];
            const [x, z] = matrix.Solve(constants);
            x0 = x;
            z0 = z;
        } else { // If x-component of cross product is non-zero
            x0 = 0;
            const matrix = new Matrix([
                [n1y, n1z],
                [n2y, n2z]
            ]);
            const constants = [d1, d2];
            const [y, z] = matrix.Solve(constants);
            y0 = y;
            z0 = z;
        }

        return { direction, point: [x0, y0, z0] };
    },
    /**
     * Calculates the intersection point of two lines in a plane.
     *
     * @param {{x0: number, y0: number, x1: number, y1: number}} l0 - The first line represented by two points (x0, y0) and (x1, y1).
     * @param {{x0: number, y0: number, x1: number, y1: number}} l1 - The second line represented by two points (x0, y0) and (x1, y1).
     * @returns {{x: number, y: number, l: number}} The intersection point of the two lines, where `x` and `y` are the coordinates of the intersection,
     * and `l` is the parameter of the intersection along the second line (l1).
     */
    PointFromIntersectionOfLinesInPlane(l0, l1) {
        const { x0: x0_0, y0: y0_0, x1: x1_0, y1: y1_0 } = l0;
        const { x0: x0_1, y0: y0_1, x1: x1_1, y1: y1_1 } = l1;

        const a1 = y1_0 - y0_0;
        const b1 = x0_0 - x1_0;
        const c1 = a1 * x0_0 + b1 * y0_0;

        const a2 = y1_1 - y0_1;
        const b2 = x0_1 - x1_1;
        const c2 = a2 * x0_1 + b2 * y0_1;

        const determinant = a1 * b2 - a2 * b1;

        if (Math.abs(determinant) < 1e-10) {
            return null; // Lines are parallel or coincident
        }

        const x = (b2 * c1 - b1 * c2) / determinant;
        const y = (a1 * c2 - a2 * c1) / determinant;

        const l = ((x - x0_1) * (x1_1 - x0_1) + (y - y0_1) * (y1_1 - y0_1)) /
                  ((x1_1 - x0_1) ** 2 + (y1_1 - y0_1) ** 2);

        return { x, y, l };
    },
    /**
     * Generates a polygon from the intersection of a line with another polygon.
     * 
     * @param {{x0: number, y0: number, x1: number, y1: number}} line - The line defined by two points (x0, y0) and (x1, y1).
     * @param {{x: number, y: number}} sidePoint - A point used to determine which side of the line to include.
     * @param {{x: number, y: number}[]} poly - An array of points defining the vertices of the polygon.
     * @returns {{x: number, y: number}[]} A new polygon consisting of the points from the input polygon that are on the same side of the line as `sidePoint`, 
     * along with the intersection points of the line with the polygon's edges.
     */
    PolygonFromLineIntersectionPolygon(line, sidePoint, poly) {
        const { x0, y0, x1, y1 } = line;

        // Helper function to determine which side of the line a point is on
        const side = (x, y) => (x1 - x0) * (y - y0) - (y1 - y0) * (x - x0);

        const sideOfSidePoint = side(sidePoint.x, sidePoint.y);
        const result = [];

        for (let i = 0; i < poly.length; i++) {
            const current = poly[i];
            const next = poly[(i + 1) % poly.length];

            const currentSide = side(current.x, current.y);
            const nextSide = side(next.x, next.y);

            // Include the current point if it's on the same side as the sidePoint
            if (currentSide * sideOfSidePoint >= 0) {
                result.push(current);
            }

            // Check if the edge intersects the line
			const intersection = Geom.PointFromIntersectionOfLinesInPlane(
				{ x0, y0, x1, y1 },
				{ x0: current.x, y0: current.y, x1: next.x, y1: next.y }
			);

			if (intersection && intersection.l >= 0 && intersection.l <= 1) {
				result.push({ x: intersection.x, y: intersection.y });
			}
 
        }

        // Sort the resulting polygon vertices in counter-clockwise order
        const centroid = result.reduce((acc, point) => ({
            x: acc.x + point.x / result.length,
            y: acc.y + point.y / result.length,
        }), { x: 0, y: 0 });

        result.sort((a, b) => {
            const angleA = Math.atan2(a.y - centroid.y, a.x - centroid.x);
            const angleB = Math.atan2(b.y - centroid.y, b.x - centroid.x);
            return angleA - angleB;
        });

        return result;
    },
    /**
     * Calculates the perpendicular point on a plane from a given point in 3D space.
     *
     * @param {number[]} point - The coordinates of the point in 3D space as [x, y, z].
     * @param {{point: number[], normal: number[]}} plane - The plane defined by a point on the plane 
     *                                                      ([x, y, z]) and its normal vector ([x, y, z]).
     * @returns {number[]} The coordinates of the perpendicular point on the plane as [x, y, z].
     */
    PerpendicularPointOnPlane(point, plane) {
        const [px, py, pz] = point;
        const [planePointX, planePointY, planePointZ] = plane.point;
        const [nx, ny, nz] = plane.normal;

        // Calculate the vector from the point to the plane point
        const vectorToPlane = [
            px - planePointX,
            py - planePointY,
            pz - planePointZ
        ];

        // Calculate the distance from the point to the plane along the normal
        const distance = (vectorToPlane[0] * nx + vectorToPlane[1] * ny + vectorToPlane[2] * nz) /
                 (nx ** 2 + ny ** 2 + nz ** 2);

        // Calculate the perpendicular point on the plane
        const perpendicularPoint = [
            px - distance * nx,
            py - distance * ny,
            pz - distance * nz
        ];

        return perpendicularPoint;
    }
};


export default Geom;
