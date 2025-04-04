import svgGen, { parseToText } from './src/svg-gen.js';
import { Matrix } from './src/matrix/matrix.js';
import Geom from './src/geometry/geometry.js';

const s = new svgGen({});
const eye = { x: -50, y: 0, z: -2000 };

function EllipseFromCircle(opts, transform, sw) {
    const standard = Geom.EllipseWithPerspective(opts.cx, opts.cy, opts.r, opts.r, eye, transform);

    const cx = standard.cx;
    const cy = standard.cy;
    const rx = standard.rx;
    const ry = standard.ry;

    return s.ellipse({
        cx,
        cy,
        rx,
        ry,
        fill: "none",
        stroke: "black",
        'stroke-width': 1,
        transform: `rotate(${standard.theta * 180 / Math.PI} ${cx} ${cy})`
    });
}

function longitude(l, R) {

    const dy = Math.round(Math.sin(l) * R);
    const r = Math.abs(Math.cos(l) * R);

    const transform = [
        {
            op: "Translate",
            args: { vec: [0, dy, 0] }
        },
        {
            op: "Rotate",
            args: { axes: "X", angle: Math.PI / 2 }
        },
    ];

    const c = { cx: 0, cy: 0, r };

    const transformMatrix = Matrix.Identity(4).Transform(transform);
    return EllipseFromCircle(c, transformMatrix);
}

function latitude(i, R) {
    const l = i * (Math.PI / 2);
  
    const transform = [
        {
            op: "Rotate",
            args: { axes: "Y", angle: l }
        },
    ];

    const c = { cx: 0, cy: 0, r: R };

    const transformMatrix = Matrix.Identity(4).Transform(transform);
    return EllipseFromCircle(c, transformMatrix);
}


function longitudes(count, dir) {
    return Array.from({ length: count }, (_, index) => {
        const i = index;
        const l = dir * (i / count) * (Math.PI / 2);

        return longitude(l, 250);
    });
}

function latitudes(count, dir) {
    return Array.from({ length: count }, (_, index) => {
        const i = index;
        const l = dir * (i / count) * (Math.PI / 2);

        return latitude(l, 250);
    });
}


const svg = s.svg({
    width: 600,
    height: 600,
    viewBox: "-300 -300 600 600"
}, [
    ...longitudes(8, 1),
    ...longitudes(8, -1),
   // ...latitudes(8, 1),
   latitude((0/ 8) * (Math.PI / 2), 250),
   latitude((1/ 8) * (Math.PI / 2), 250),
   latitude((2/ 8) * (Math.PI / 2), 250),
   latitude((3/ 8) * (Math.PI / 2), 250),
   latitude((4/ 8) * (Math.PI / 2), 250),
   latitude((5/ 8) * (Math.PI / 2), 250),
   s.line({x1: -250, y1: 0, x2: 250, y2: 0, stroke: "red", 'stroke-width': 3}),
   s.line({x1: 0, y1: -250, x2: 0, y2: 250, stroke: "red", 'stroke-width': 3}),
]);



console.debug(parseToText(svg));
