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

    const ellipse = Geom.EllipseWithPerspective(geomOpts.cx, geomOpts.cy, geomOpts.rx, geomOpts.ry, perspective.eye, perspective.transform);

    const cx = ellipse.cx;
    const cy = ellipse.cy;
    const rx = ellipse.rx;
    const ry = ellipse.ry;

    return this.s.ellipse({
        cx,
        cy,
        rx,
        ry,
        transform: `rotate(${ellipse.theta * 180 / Math.PI} ${cx} ${cy})`,
       ...opts
    });
}

export { elementFromCircleOrEllipse}
