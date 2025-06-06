import { Matrix } from "../matrix/matrix.js";
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
    const clipPoint = clipPlane.point;
    const clipNormal = clipPlane.normal;
    const sidePoint = [clipPoint[0] + clipNormal[0], clipPoint[1] + clipNormal[1], clipPoint[2] + clipNormal[2]];

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
        return null;
    }

    const eyePoint = [eye.x, eye.y, eye.z];

    const affinePoints = new Matrix([
        [intersectionLine.point[0], intersectionLine.point[1], intersectionLine.point[2], 1],
        [intersectionLine.point[0] + intersectionLine.direction[0], intersectionLine.point[1] + intersectionLine.direction[1], intersectionLine.point[2] + intersectionLine.direction[2], 1],
    ]).Transpose();

    const perspectivePoints = Geom.PerspectiveXYProjection(eye, affinePoints);
    const p0 = perspectivePoints[0];
    const p1 = perspectivePoints[1];

    // Test point in XY plane - which side is it on?
    const pSide = {
        x: p0.x - (p1.y - p0.y),
        y: p0.y + (p1.x - p0.x)
    };
    const pS0 =  Geom.PointFromIntersectionOfLineAndPlane(eyePoint, [pSide.x, pSide.y, 0], clipPlane);
    const pS1 =  Geom.PointFromIntersectionOfLineAndPlane(eyePoint, [pSide.x, pSide.y, 0], transformedXYPlane);
    const d0 = Geom.Distance2BetweenPoints(eyePoint, pS0);
    const d1 = Geom.Distance2BetweenPoints(eyePoint, pS1);

    let side = Geom.SideOfPointFromLine(perspectivePoints[0], perspectivePoints[1], pSide);

    // Is the clip plane between the eye and the 3D plane? Wrong side, then.
    if(d0 < d1) {
        side *= -1;
    }

    return {points: perspectivePoints, side};
}

/**
 * Calculates the intersection points and arc parameters between an ellipse and a clipping plane in perspective.
 * @param {Object} ellipse - The ellipse object.
 * @param {number} ellipse.cx - The x-coordinate of the ellipse center.
 * @param {number} ellipse.cy - The y-coordinate of the ellipse center.
 * @param {number} ellipse.rx - The x-radius of the ellipse.
 * @param {number} ellipse.ry - The y-radius of the ellipse.
 * @param {number} ellipse.theta - The rotation angle of the ellipse in radians.
 * @param {Object} perspective - The perspective object containing view parameters.
 * @param {Object} perspective.eye - The viewpoint position.
 * @param {Object} perspective.transform - The perspective transformation.
 * @param {Object} perspective.clip - The clipping parameters.
 * @param {Object} perspective.clip.plane - The clipping plane.
 * @returns {Object|null} An object containing intersection points and arc parameters, or null if no intersection exists.
 * @returns {Array} returns.intersections - Array of intersection points with x, y coordinates and theta angle.
 * @returns {number} returns.side - Side indicator for the intersection.
 * @returns {Object} returns.line - The clipping line parameters.
 * @returns {number} returns.largeArcFlag - SVG arc large arc flag.
 * @returns {number} returns.sweepFlag - SVG arc sweep flag.
 * @returns {Object} returns.ellipse - Reference to the input ellipse.
 */
function ArcFromEllipseWithClip(ellipse, perspective) {
    const { eye, transform, clip } = perspective;

    if (!clip || !clip.plane) {
        return null;
    }

    const perspectivePoints = clipXYLine(perspective);
    if (!perspectivePoints) {
        return null;
    }

    const line = { x0: perspectivePoints[0].x, y0: perspectivePoints[0].y, x1: perspectivePoints[1].x, y1: perspectivePoints[1].y };
    const directionalPoint = perspectivePoints[2];
    const pdx = line.x1 - line.x0;
    const pdy = line.y1 - line.y0;
    const side = Math.sign((directionalPoint.x - line.x0) * pdy - (directionalPoint.y - line.y0) * pdx);
    const centerSide = Math.sign((ellipse.cx - line.x0) * pdy - (ellipse.cy - line.y0) * pdx);

    const uL = {
        x0: line.x0 - ellipse.cx,
        y0: line.y0 - ellipse.cy,
        x1: line.x1 - ellipse.cx,
        y1: line.y1 - ellipse.cy
    };

    // Rotate line points by -theta to align with untransformed ellipse

    const cosTheta = Math.cos(-ellipse.theta);
    const sinTheta = Math.sin(-ellipse.theta);
    const rL = {
        x0: uL.x0 * cosTheta - uL.y0 * sinTheta,
        y0: uL.x0 * sinTheta + uL.y0 * cosTheta,
        x1: uL.x1 * cosTheta - uL.y1 * sinTheta,
        y1: uL.x1 * sinTheta + uL.y1 * cosTheta
    };


    // Calculate coefficients of quadratic equation
    // ((rL.x0 + t dx)^2 / rx^2) + ((rL.y0 + t dy)^2 / ry^2) = 1
    const dx = rL.x1 - rL.x0;
    const dy = rL.y1 - rL.y0;
    const rx2 = ellipse.rx * ellipse.rx;
    const ry2 = ellipse.ry * ellipse.ry;
    const A = (dx * dx) / rx2 + (dy * dy) / ry2;
    const B = 2 * (dx * rL.x0 / rx2 + dy * rL.y0 / ry2)
    const C = rL.x0 * rL.x0 / rx2 + rL.y0 * rL.y0 / ry2 - 1;

    // Solve quadratic equation
    const discriminant = B * B - 4 * A * C;
    if (discriminant < 0) return null;


    const t1 = (-B + Math.sqrt(discriminant)) / (2 * A);
    const t2 = (-B - Math.sqrt(discriminant)) / (2 * A);

    // Calculate intersection points and rotate back
    const intersections = [t1, t2].map(t => {
        const x = rL.x0 + t * dx;
        const y = rL.y0 + t * dy;
        const newX = x * cosTheta + y * sinTheta;
        const newY = -x * sinTheta + y * cosTheta;
        return {
            x: newX + ellipse.cx,
            y: newY + ellipse.cy,
            theta: Math.atan2(newY / ellipse.ry, newX / ellipse.rx)
        };
    });

    const largeArcFlag = side === centerSide ? 1 : 0;
    let sweepFlag;
    if (largeArcFlag) {
        sweepFlag = side === centerSide ? 1 : 0;
    } else {
        sweepFlag = side === centerSide ? 0 : 1;
    }

    return { intersections, side, line, largeArcFlag, sweepFlag, ellipse };

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

    if (!perspectivePoints) {
        return null;
    }

    return Geom.PolygonFromLineIntersectionPolygon(perspectivePoints.points[0], perspectivePoints.points[1], perspectivePoints.side, viewBoxVertices);
}

function PointWithPerspective(x, y, eye, transform) {

    if (transform.m !== 4 || transform.n !== 4) {
        throw new Error("Transform matrix must be 4x4.");
    }

    const point = new Matrix([[x, y, 0, 1]]).Transpose();
    const transformed = transform.Mult(point);

    const perspectivePoints = Geom.PerspectiveXYProjection(eye, transformed);

    return perspectivePoints[0];
};

export {
    ClipXYHalfPlane,
    ArcFromEllipseWithClip,
    PolygonFromViewBoxWithPerspective,
    PointWithPerspective
};