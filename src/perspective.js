import Geom  from "./geometry/geometry.js";

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

function clip(perspective) {
    const {eye, transform, clip} = perspective;
    if(!clip || !clip.plane) {
        return null;
    }

    // Transform the XY plane
    const transformedXYPoint = transform.Mult([0, 0, 0, 1]);
    const transformedXYNormal = transform.Mult([0, 0, 1, 0]);

    // XY plane after transform
    const transformedXYPlane = {
        point: [transformedXYPoint[0], transformedXYPoint[1], transformedXYPoint[2]],
        normal: [transformedXYNormal[0], transformedXYNormal[1], transformedXYNormal[2]]
    };
    const intersectionLine = Geom.LineFromIntersectionOfPlanes(clip.plane, transformedXYPlane);
  
    const p0 = intersectionLine.point;
    const p1 = [
        pointOnLine[0] + intersectionLine.direction[0],
        pointOnLine[1] + intersectionLine.direction[1],
        pointOnLine[2] + intersectionLine.direction[2]
    ];


    // Project the three points onto the XY plane
    const p0XY = Geom.PerspectiveXYProjection(pointOnLine, eye);
    const p1XY = Geom.PerspectiveXYProjection(secondPointOnLine, eye);
    const directionalPoint = Geom.PerspectiveXYProjection(clip.point, eye);

    // Create an SVG clip-path for the half-plane
    const R = 10000; // A large value to ensure the half-plane is covered

    return pathData;
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
function elementFromCircleOrEllipse(perspective) {
    const opts = JSON.parse(JSON.stringify(this.options));

    const geomOpts = extractElements(["cx", "cy", "r", "rx", "ry"], opts);
    if ('r' in geomOpts) {
        geomOpts.rx = geomOpts.r;
        geomOpts.ry = geomOpts.r;
        delete geomOpts.r;
    }

    const {ellipse, regression} = Geom.EllipseWithPerspective(geomOpts.cx, geomOpts.cy, geomOpts.rx, geomOpts.ry, perspective.eye, perspective.transform);

    if (regression.worstR2 < 0.99) {
        const {x1, y1, x2, y2} = regression;
        return this.s.line({
            x1,
            y1,
            x2,
            y2,
           ...opts
        });
    }

    const cx = ellipse.cx;
    const cy = ellipse.cy;
    const rx = ellipse.rx;
    const ry = ellipse.ry;

    const clipPath = clip(perspective);

    const newOpts = {
        cx,
        cy,
        rx,
        ry,
        transform: `rotate(${ellipse.theta * 180 / Math.PI} ${cx} ${cy})`,
       ...opts
    };
    if (clipPath) {
        newOpts["clip-path"] = clipPath;
    }

    return this.s.ellipse(newOpts);
}

export { elementFromCircleOrEllipse}
