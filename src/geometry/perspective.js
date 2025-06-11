import { Matrix, Vector } from "../matrix/matrix.js";
import Geom from "./geometry.js";


/**
 * Computes a half-plane in XY space based on a perspective and clipping plane
 * @param {Object} perspective - The perspective object
 * @param {Object} perspective.eye - The eye point for perspective projection
 * @param {Object} perspective.transform - The transformation matrix
 * @param {Object} perspective.clip - The clipping information
 * @param {Object} perspective.clip.plane - The clipping plane
 * @param {Array<number>} perspective.clip.plane.point - A point on the clipping plane
 * @param {Array<number>} perspective.clip.plane.normal - The normal vector of the clipping plane
 * @returns {Array<{x: number, y: number}|null} An array containing 3 points in perspective space defining a half-plane:
 *                       - First two points define the boundary line
 *                       - Third point indicates the interior side of the half-plane
 *                       Returns null if no intersection exists
 */
function ClipXYHalfPlane(perspective) {
    const { eye, transform, clip } = perspective;

    const clipPlane = clip.plane;

    // Transform the XY plane
    const transformedXYPointO = transform.Mult([0, 0, 0, 1]);
    const transformedXYPointX = transform.Mult([1, 0, 0, 1]);
    const transformedXYPointY = transform.Mult([0, 1, 0, 1]);

    const dX = [transformedXYPointX[0] - transformedXYPointO[0], transformedXYPointX[1] - transformedXYPointO[1], transformedXYPointX[2] - transformedXYPointO[2]];
    const dY = [transformedXYPointY[0] - transformedXYPointO[0], transformedXYPointY[1] - transformedXYPointO[1], transformedXYPointY[2] - transformedXYPointO[2]];
    const cross = [
        dX[1] * dY[2] - dX[2] * dY[1],
        dX[2] * dY[0] - dX[0] * dY[2],
        dX[0] * dY[1] - dX[1] * dY[0]
    ];
    const transformedXYNormal = cross;

    // XY plane after transform
    const transformedXYPlane = {
        point: [transformedXYPointO[0], transformedXYPointO[1], transformedXYPointO[2]],
        normal: [transformedXYNormal[0], transformedXYNormal[1], transformedXYNormal[2]]
    };

    const intersectionLine = Geom.LineFromIntersectionOfPlanes(clipPlane, transformedXYPlane);
    if (!intersectionLine) {
        const d0 = Geom.DistanceFromPointToPlane(Vector(eye), clipPlane);
        const d1 = Geom.DistanceFromPointToPlane(Vector(eye), transformedXYPlane);
        return {
            points: null,
            side: d0 < d1 ? -1 : 1
        };
    }

    const eyePoint = [eye.x, eye.y, eye.z];

    const affinePoints = new Matrix([
        Vector([intersectionLine.point[0], intersectionLine.point[1], intersectionLine.point[2], 1]),
        Vector([intersectionLine.point[0] + intersectionLine.direction[0], intersectionLine.point[1] + intersectionLine.direction[1], intersectionLine.point[2] + intersectionLine.direction[2], 1]),
    ]);

    const perspectivePoints = Geom.PerspectiveXYProjection(eye, affinePoints);
    const p0 = perspectivePoints[0];
    const p1 = perspectivePoints[1];

    // Test point in XY plane - which side is it on?
    const pSide = {
        x: p0.x - (p1.y - p0.y),
        y: p0.y + (p1.x - p0.x)
    };
    const pS0 = Geom.PointFromIntersectionOfLineAndPlane(eyePoint, [pSide.x, pSide.y, 0], clipPlane);
    const pS1 = Geom.PointFromIntersectionOfLineAndPlane(eyePoint, [pSide.x, pSide.y, 0], transformedXYPlane);
    const d0 = Geom.Distance2BetweenPoints(eyePoint, pS0);
    const d1 = Geom.Distance2BetweenPoints(eyePoint, pS1);

    let side = Geom.SideOfPointFromLine(perspectivePoints[0], perspectivePoints[1], pSide);

    // Is the clip plane between the eye and the 3D plane? Wrong side, then.
    if (d0 < d1) {
        side *= -1;
    }

    return { points: perspectivePoints, side };
}

/**
 * Creates a polygon by clipping a viewBox with a perspective plane in the XY plane
 * @param {Object} viewBox - The view box to be clipped
 * @param {number} viewBox.x - X coordinate of view box origin
 * @param {number} viewBox.y - Y coordinate of view box origin
 * @param {number} viewBox.width - Width of view box
 * @param {number} viewBox.height - Height of view box
 * @param {Object} perspective - The perspective configuration
 * @param {Object} perspective.clip - Clipping configuration
 * @param {Object} perspective.clip.plane - Plane used for clipping
 * @returns {Array<Object>|null} Array of vertices defining the clipped polygon, or null if clipping cannot be performed
 */
function PolygonFromViewBoxWithPerspective(viewBox, perspective) {
    const { clip } = perspective;
    const viewBoxVertices = [
        { x: viewBox.x, y: viewBox.y },
        { x: viewBox.x + viewBox.width, y: viewBox.y },
        { x: viewBox.x + viewBox.width, y: viewBox.y + viewBox.height },
        { x: viewBox.x, y: viewBox.y + viewBox.height }
    ];

    if (!clip || !clip.plane) {
        return null;
    }

    const perspectivePoints = ClipXYHalfPlane(perspective);

    if (!perspectivePoints.points) {
        return perspectivePoints.side === 1 ? viewBoxVertices : null;
    }

    return Geom.PolygonFromLineIntersectionPolygon(perspectivePoints.points[0], perspectivePoints.points[1], perspectivePoints.side, viewBoxVertices);
}

function PointWithPerspective(x, y, eye, transform) {

    if (transform.m !== 4 || transform.n !== 4) {
        throw new Error("Transform matrix must be 4x4.");
    }

    const point = new Matrix(Vector([x, y, 0, 1]));
    const transformed = transform.Mult(point);

    const perspectivePoints = Geom.PerspectiveXYProjection(eye, transformed);

    return perspectivePoints[0];
};

export {
    ClipXYHalfPlane,
    PolygonFromViewBoxWithPerspective,
    PointWithPerspective
};