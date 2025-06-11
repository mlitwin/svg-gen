/**
 * @file geometry.js
 * @description This module provides a `Geom` object that serves as a container 
 * for various geometry-related functions.
 * 
 * @module geometry
 */

import { Matrix } from '../matrix/matrix.js';

const Geom = {

    PointsWithPerspective(points, eye, transform) {

        if (transform.m !== 4 || transform.n !== 4) {
            throw new Error("Transform matrix must be 4x4.");
        }

        const transformed = transform.Mult(points);
        const perspectivePoints = Geom.PerspectiveXYProjection(eye, transformed);
        return perspectivePoints;
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
     * @param {{p0: {x: number, y: number}, p1: {x: number, y: number}}} l0 - The first line represented by two points p0 and p1.
     * @param {{p0: {x: number, y: number}, p1: {x: number, y: number}}} l1 - The second line represented by two points p0 and p1.
     * @returns {{x: number, y: number, l: number}} The intersection point of the two lines, where `x` and `y` are the coordinates of the intersection,
     * and `l` is the parameter of the intersection along the second line (l1).
     */
    PointFromIntersectionOfLinesInPlane(l0, l1) {
        // l0: {p0: {x, y}, p1: {x, y}}
        // l1: {p0: {x, y}, p1: {x, y}}
        const a1 = l0.p1.y - l0.p0.y;
        const b1 = l0.p0.x - l0.p1.x;
        const c1 = a1 * l0.p0.x + b1 * l0.p0.y;

        const a2 = l1.p1.y - l1.p0.y;
        const b2 = l1.p0.x - l1.p1.x;
        const c2 = a2 * l1.p0.x + b2 * l1.p0.y;

        const determinant = a1 * b2 - a2 * b1;

        if (Math.abs(determinant) < 1e-10) {
            return null; // Lines are parallel or coincident
        }

        const x = (b2 * c1 - b1 * c2) / determinant;
        const y = (a1 * c2 - a2 * c1) / determinant;

        const l = ((x - l1.p0.x) * (l1.p1.x - l1.p0.x) + (y - l1.p0.y) * (l1.p1.y - l1.p0.y)) /
            ((l1.p1.x - l1.p0.x) ** 2 + (l1.p1.y - l1.p0.y) ** 2);

        return { point: { x, y }, l };
    },
    /**
     * Generates a polygon from the intersection of a line with another polygon.
     * 
     * @param {{x: number, y: number}} p0 - Base point of line
     * @param {{x: number, y: number}} p1 - Second point of line
     * @param {{x: number, y: number}} point - Point used to determine side
     * @returns {number} -1, 0, 1 depending on side calculation
     */
    SideOfPointFromLine(p0, p1, point) {
        const value = (p1.x - p0.x) * (point.y - p0.y) - (p1.y - p0.y) * (point.x - p0.x);
        if (value < 0) return -1;
        if (value > 0) return 1;
        return 0;
    },
    /**
     * Computes a new polygon by intersecting a line with an existing polygon.
     * The resulting polygon includes points from the original polygon that lie on
     * the specified side of the line, plus any intersection points.
     * 
     * @param {Object} p0 - Start point of the line {x, y}
     * @param {Object} p1 - End point of the line {x, y}
     * @param {number} sideOfSidePoint - Determines which side of the line to keep (-1 or 1)
     * @param {Array<Object>} poly - Array of points {x, y} representing the polygon vertices
     * @returns {Array<Object>} A new array of points {x, y} representing the resulting polygon,
     *                         sorted in counter-clockwise order
     */
    PolygonFromLineIntersectionPolygon(p0, p1, sideOfSidePoint, poly) {
   
        const result = [];

        for (let i = 0; i < poly.length; i++) {
            const current = poly[i];
            const next = poly[(i + 1) % poly.length];

            const currentSide = Geom.SideOfPointFromLine(p0, p1, current);

            // Include the current point if it's on the same side as the sidePoint
            if (currentSide * sideOfSidePoint >= 0) {
                result.push(current);
            }

            // Check if the edge intersects the line
            const intersection = Geom.PointFromIntersectionOfLinesInPlane(
                {p0, p1},
                {p0: current, p1: next}
            );

            if (intersection && intersection.l >= 0 && intersection.l <= 1) {
                result.push(intersection.point);
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
    },
    /**
      * Calculates the distance squared between two points
      *
      * @param {number[]} p0 - The coordinates of the point.
      * @param {number[]} p1 - The coordinates of the point.
      * @returns {number} The square of the distance
      */
    Distance2BetweenPoints(p0, p1) {
        const d0 = p0.length;
        const d1 = p1.length;
        const maxDim = Math.max(d0, d1);
        let sumSquares = 0;

        for (let i = 0; i < maxDim; i++) {
            const v0 = i < d0 ? p0[i] : 0;
            const v1 = i < d1 ? p1[i] : 0;
            sumSquares += (v1 - v0) ** 2;
        }

        return sumSquares;
    },
    /**
     * Calculates the intersection of a line through two points with a plane.
     *
     * @param {number[]} p0 - The coordinates of the point in 3D space as [x, y, z].
     * @param {number[]} p1 - The coordinates of the point in 3D space as [x, y, z].
     * @param {{point: number[], normal: number[]}} plane - The plane defined by a point on the plane 
     *                                                      ([x, y, z]) and its normal vector ([x, y, z]).
     * @returns {number[]} The coordinates of the perpendicular point on the plane as [x, y, z].
     */
    PointFromIntersectionOfLineAndPlane(p0, p1, plane) {
        const [x0, y0, z0] = p0;
        const [x1, y1, z1] = p1;
        const [px, py, pz] = plane.point;
        const [nx, ny, nz] = plane.normal;

        // Vector along the line
        const dx = x1 - x0;
        const dy = y1 - y0;
        const dz = z1 - z0;

        // Calculate denominator
        const denom = nx * dx + ny * dy + nz * dz;

        // Check if line is parallel to plane
        if (Math.abs(denom) < 1e-10) {
            return null;
        }

        // Calculate t parameter of line
        const t = (nx * (px - x0) + ny * (py - y0) + nz * (pz - z0)) / denom;

        // Calculate intersection point
        return [
            x0 + t * dx,
            y0 + t * dy,
            z0 + t * dz
        ];
    },
    /**
     * Generates a best-fit line segment from an array of points.
     *
     * @param {Array<{x: number, y: number}>} points - An array of points, where each point is an object with `x` and `y` coordinates.
     * @returns {{segment: {x0: number, y0: number, x1: number, y1: number}, goodnessOfFit: number}} 
     *          An object containing the best-fit line segment and its goodness of fit.
     *          - `segment`: An object representing the line segment with start point (`x0`, `y0`) and end point (`x1`, `y1`).
     *          - `errorSize`: A number representing how well the line segment fits the given points.
     */
    SegmentFromPoints(points) {
        if (points.length < 2) {
            throw new Error("At least two points are required to calculate a segment.");
        }

        // Calculate the bounding box
        const xMin = Math.min(...points.map(p => p.x));
        const xMax = Math.max(...points.map(p => p.x));
        const yMin = Math.min(...points.map(p => p.y));
        const yMax = Math.max(...points.map(p => p.y));

        // Define the two diagonals
        const diagonal1 = { x0: xMin, y0: yMin, x1: xMax, y1: yMax };
        const diagonal2 = { x0: xMin, y0: yMax, x1: xMax, y1: yMin };

        // Helper function to calculate perpendicular distance from a point to a line
        const perpendicularDistance = (point, line) => {
            const { x0, y0, x1, y1 } = line;

            // Handle vertical line
            if (x0 === x1) {
                return Math.abs(point.x - x0);
            }

            // Handle horizontal line
            if (y0 === y1) {
                return Math.abs(point.y - y0);
            }

            const numerator = Math.abs((y1 - y0) * point.x - (x1 - x0) * point.y + x1 * y0 - y1 * x0);
            const denominator = Math.sqrt((y1 - y0) ** 2 + (x1 - x0) ** 2);
            return numerator / denominator;
        };

        // Calculate the error size for each diagonal
        const errorSize1 = Math.max(...points.map(p => perpendicularDistance(p, diagonal1)));
        const errorSize2 = Math.max(...points.map(p => perpendicularDistance(p, diagonal2)));

        // Return the diagonal with the smaller error size
        if (errorSize1 <= errorSize2) {
            return { segment: diagonal1, errorSize: errorSize1 };
        } else {
            return { segment: diagonal2, errorSize: errorSize2 };
        }
    },
    DistanceFromPointToPlane(point, plane) {
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
            Math.sqrt(nx ** 2 + ny ** 2 + nz ** 2);

        return Math.abs(distance);
    }
};


export default Geom;
