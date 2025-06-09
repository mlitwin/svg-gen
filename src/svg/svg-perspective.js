import { Matrix } from "../matrix/matrix.js";
import Ellipse from "../geometry/ellipse.js";
import { PolygonFromViewBoxWithPerspective, PointWithPerspective } from "../geometry/perspective.js";
import { extractElements } from "./svg-util.js";
import { walkSVGPathDArray } from "./svg-path.js";

// transform is an array of 2-d affine transforms
function transformToSVGTransform(transform) {
    return transform.reduce((result, t) => {
        const prefix = result ? `${results} ` : '';
        switch (t.op) {
            case "Rotate":
                return prefix + `rotate(${t.args.angle * 180 / Math.PI} ${t.args.center[0]} ${t.args.center[1]}) `;
            case "Translate":
                return prefix + `translate(${t.args.vec[0]} ${t.args.vec[1]}) `;
            default:
                throw new Error(`Unknown transformation operation: ${t.op}`);
        }
    }, "");
}

function makeClipPath(polygon, transform) {

    if (!polygon) {
        return null;
    }
    const svd = transform.SVD();

    const pathData = polygon.map((point) => {
        const inversePoint = Matrix.SVDSolve(svd, [point.x, point.y, 1]);
        const x = inversePoint[0]
        const y = inversePoint[1];
        return `${x}px ${y}px`;
    }).join(",");

    return `polygon(${pathData}) view-box`;
}

function setClipPath(opts, perspective, renderContext, transform = Matrix.Identity(3)) {
    const clipP = PolygonFromViewBoxWithPerspective(renderContext.viewBox, perspective);

    const clipPath = makeClipPath(clipP, transform);

    if (clipPath) {
        opts["clip-path"] = clipPath;
        opts._clipP = clipP;
    }
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
function elementFromCircleOrEllipse(renderContext) {
    const opts = JSON.parse(JSON.stringify(this.options));
    const perspective = renderContext.with_opts.perspective;

    const geomOpts = extractElements(["cx", "cy", "r", "rx", "ry"], opts);

    if ('r' in geomOpts) {
        geomOpts.rx = geomOpts.r;
        geomOpts.ry = geomOpts.r;
        delete geomOpts.r;
    }

    const { ellipse, line } = Ellipse.EllipseWithPerspective(geomOpts.cx, geomOpts.cy, geomOpts.rx, geomOpts.ry, perspective.eye, perspective.transform);

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

    const transform =
        [
            {
                op: "Rotate",
                args: { axes: "Z", angle: ellipse.theta, center: [cx, cy] }
            }
        ];

    setClipPath(opts, perspective, renderContext, Matrix.Identity(3).Transform(transform));

    const transformPath = transformToSVGTransform(transform);

    const newOpts = {
        cx,
        cy,
        rx,
        ry,
        transform: transformPath,
        ...opts
    };

    return this.s.ellipse(newOpts);
}


function pathCommandFromArc(cur, av, perspective, _this) {

    const arc = Ellipse.ArcWithPerspective(cur, av, perspective);

    if (arc.line) {
        return {
            op: 'L',
            args: [arc.line.pt1.x, arc.line.pt1.y]
        };
    }

    return {
        op: 'A',
        args: arc.arc
    }
}

function elementFromPath(renderContext) {
    const opts = JSON.parse(JSON.stringify(this.options));
    const d = opts.d;
    const perspective = renderContext.with_opts.perspective;


    const pD = [];
    walkSVGPathDArray(d, (op, args, absoluteArgs, cur) => {
        let command = { op: op.toUpperCase(), args: absoluteArgs };
        const av = command.args;
        switch (command.op) {
            case 'M':
            case 'L':
            case 'T': {
                const pt = PointWithPerspective(av[0], av[1], perspective.eye, perspective.transform);
                av[0] = pt.x;
                av[1] = pt.y;
                break;
            }
            case 'H': {
                const pt = PointWithPerspective(av[0], cur.y, perspective.eye, perspective.transform);
                av[0] = pt.x;
                break;
            }
            case 'V': {
                const pt = PointWithPerspective(cur.x, av[0], perspective.eye, perspective.transform);
                av[0] = pt.y;
                break;
            }
            case 'C': {
                const pt1 = PointWithPerspective(av[0], av[1], perspective.eye, perspective.transform);
                const pt2 = PointWithPerspective(av[2], av[3], perspective.eye, perspective.transform);
                const pt3 = PointWithPerspective(av[4], av[5], perspective.eye, perspective.transform);
                av[0] = pt1.x;
                av[1] = pt1.y;
                av[2] = pt2.x;
                av[3] = pt2.y;
                av[4] = pt3.x;
                av[5] = pt3.y;
                break;
            }
            case 'S': {
                const pt1 = PointWithPerspective(av[0], av[1], perspective.eye, perspective.transform);
                const pt2 = PointWithPerspective(av[2], av[3], perspective.eye, perspective.transform);
                av[0] = pt1.x;
                av[1] = pt1.y;
                av[2] = pt2.x;
                av[3] = pt2.y;
                break;
            }
            case 'Q': {
                const pt1 = PointWithPerspective(av[0], av[1], perspective.eye, perspective.transform);
                const pt2 = PointWithPerspective(av[2], av[3], perspective.eye, perspective.transform);
                av[0] = pt1.x;
                av[1] = pt1.y;
                av[2] = pt2.x;
                av[3] = pt2.y;
                break;
            }
            case 'A': {
                command = pathCommandFromArc(cur, av, perspective, this);
                break;
            }
            default:
                break;
        };
        pD.push(command);
    });

    opts.d = pD;

    if (this._ellipsex) {
        const e = this._ellipse;
        const newOpts = {
            cx: e.cx,
            cy: e.cy,
            rx: e.rx,
            ry: e.ry,
            transform: e.transformPath,
            ...opts
        };

        return this.s.ellipse(newOpts);
    }

    setClipPath(opts, perspective, renderContext);

    return this.s.path(opts);
}


function addWithPerspective(svgTypes) {
    svgTypes.ellipse.withPerspective = elementFromCircleOrEllipse;
    svgTypes.circle.withPerspective = elementFromCircleOrEllipse;
    svgTypes.path.withPerspective = elementFromPath;
}

export { addWithPerspective }
