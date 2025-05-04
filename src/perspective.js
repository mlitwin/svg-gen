import { Matrix } from "./matrix/matrix.js";
import Geom from "./geometry/geometry.js";
import { PolygonFromViewBoxWithPerspective } from "./geometry/perspective.js";

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

    const { ellipse, line } = Geom.EllipseWithPerspective(geomOpts.cx, geomOpts.cy, geomOpts.rx, geomOpts.ry, perspective.eye, perspective.transform);

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

    const inverseTransform = Matrix.Identity(3).Transform(
        [
            {
                op: "Translate",
                args: { vec: [cx, cy, 1] }
            },
            {
                op: "Rotate",
                args: { axes: "Z", angle: -ellipse.theta }
            },
            {
                op: "Translate",
                args: { vec: [-cx, -cy, 1] }
            },
        ]);

    const clipP = PolygonFromViewBoxWithPerspective(renderContext.viewBox, perspective);

    const clipPath = makeClipPath(clipP, inverseTransform);

    if (clipPath) {
        opts["clip-path"] = clipPath;
    }

    const newOpts = {
        cx,
        cy,
        rx,
        ry,
        transform: `rotate(${ellipse.theta * 180 / Math.PI} ${cx} ${cy})`,
        ...opts
    };

    return this.s.ellipse(newOpts);
}

export { elementFromCircleOrEllipse }
