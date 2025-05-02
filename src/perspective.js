import { Matrix } from "./matrix/matrix.js";
import Geom from "./geometry/geometry.js";

function extractElements(elements, opts) {
    const ret = {}
    elements.forEach((el) => {
        if (el in opts) {
            ret[el] = opts[el];
            delete opts[el];
        }
    });

    return ret;
}



function clipIntersection(ellipse, perspective) {
    const { eye, transform, clip } = perspective;

    if (!clip || !clip.plane) {
        return null;
    }
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

    const sidePointXY = Geom.PerpendicularPointOnPlane(sidePoint, transformedXYPlane);

    const affinePoints = new Matrix([
        [intersectionLine.point[0], intersectionLine.point[1], intersectionLine.point[2], 1],
        [intersectionLine.point[0] + intersectionLine.direction[0], intersectionLine.point[1] + intersectionLine.direction[1], intersectionLine.point[2] + intersectionLine.direction[2], 1],
        [sidePointXY[0], sidePointXY[1], sidePointXY[2], 1],
    ]).Transpose();

    const  perspectivePoints =  Geom.PerspectiveXYProjection(eye, affinePoints,);

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
            theta: Math.atan2(newY/ellipse.ry, newX/ellipse.rx)
        };
    });

    const largeArcFlag = side === centerSide ? 1 : 0;
    let sweepFlag;
    if(largeArcFlag) {
        sweepFlag = side === centerSide ? 1 : 0;
    } else {
        sweepFlag = side === centerSide ? 0 : 1;
    }

    return {intersections, side, line, largeArcFlag, sweepFlag, ellipse};
    
}


function clipPolygon(viewBox, perspective) {
    const { eye, transform, clip } = perspective;
    const viewBoxVertices = [
        { x: viewBox.x, y: viewBox.y },
        { x: viewBox.x + viewBox.width, y: viewBox.y },
        { x: viewBox.x + viewBox.width, y: viewBox.y + viewBox.height },
        { x: viewBox.x, y: viewBox.y + viewBox.height }
    ];

    if (!clip || !clip.plane) {
        return null;
    }
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

    const sidePointXY = Geom.PerpendicularPointOnPlane(sidePoint, transformedXYPlane);

    const affinePoints = new Matrix([
        [intersectionLine.point[0], intersectionLine.point[1], intersectionLine.point[2], 1],
        [intersectionLine.point[0] + intersectionLine.direction[0], intersectionLine.point[1] + intersectionLine.direction[1], intersectionLine.point[2] + intersectionLine.direction[2], 1],
        [sidePointXY[0], sidePointXY[1], sidePointXY[2], 1],
    ]).Transpose();

    const  perspectivePoints =  Geom.PerspectiveXYProjection(eye, affinePoints,);

    const line = { x0: perspectivePoints[0].x, y0: perspectivePoints[0].y, x1: perspectivePoints[1].x, y1: perspectivePoints[1].y };
    const directionalPoint = perspectivePoints[2];

    return Geom.PolygonFromLineIntersectionPolygon(line, directionalPoint, viewBoxVertices);
}

function makeClipPath(polygon, inverseTransform) {
    if (!polygon) {
        return null;
    }
    const pathData = polygon.map((point) => {
        const inversePoint = inverseTransform.Mult([point.x, point.y, 1]);
     const x = inversePoint[0]
     const y = inversePoint[1];
       return `${x}px ${y}px`;
    }).join(",");

    return `polygon(${pathData}) view-box`;
}

/**
 * Creates an SVG ellipse element based on the given perspective and options.
 * The function supports both circle and ellipse geometries, converting circles
 * into ellipses if necessary.
 *
 * @param {Object} perspective - The perspective object containing the eye and transform properties.
 * @param {Object} opts - The options for the circle or ellipse element.
 * @param {number} opts.cx - The x-coordinate of the center of the circle or ellipse.
 * @param {number} opts.cy - The y-coordinate of the center of the circle or ellipse.
 * @param {number} [opts.r] - The radius of the circle (used for circles only).
 * @param {number} [opts.rx] - The x-radius of the ellipse (used for ellipses).
 * @param {number} [opts.ry] - The y-radius of the ellipse (used for ellipses).
 * @returns {Object} An SVG ellipse element with the specified properties and transformations.
 */
function elementFromCircleOrEllipse(perspective, renderContext) {
    const opts = JSON.parse(JSON.stringify(this.options));

    const geomOpts = extractElements(["cx", "cy", "r", "rx", "ry"], opts);
    if ('r' in geomOpts) {
        geomOpts.rx = geomOpts.r;
        geomOpts.ry = geomOpts.r;
        delete geomOpts.r;
    }

    const { ellipse, line, perspectivePoints} = Geom.EllipseWithPerspective(geomOpts.cx, geomOpts.cy, geomOpts.rx, geomOpts.ry, perspective.eye, perspective.transform);

    if (line.errorSize < 0.99) {
        const { x0, y0, x1, y1 } = line.segment;
        return this.s.line({
            x1: x0,
            y1: y0,
            x2: x1,
            y2: y1,
            ...opts
        });
    }

    const cx = ellipse.cx;
    const cy = ellipse.cy;
    const rx = ellipse.rx;
    const ry = ellipse.ry;

    const arcSegment = clipIntersection(ellipse, perspective);
   
    const newOpts = {
        cx,
        cy,
        rx,
        ry,
        transform: `rotate(${ellipse.theta * 180 / Math.PI} ${cx} ${cy})`,
        ...opts
    };


    if(arcSegment) {
        const {intersections, side, line, largeArcFlag, sweepFlag} = arcSegment
        const angle = ellipse.theta * 180 / Math.PI;
        const p = intersections;
        const d = ["M", p[0].x, p[0].y, "A", rx, ry, angle, largeArcFlag, (1-sweepFlag), p[1].x, p[1].y].join(" ");
    
        return this.s.path({d,
            ...opts
        });
    }
    return this.s.ellipse(newOpts);
}

export { elementFromCircleOrEllipse }
