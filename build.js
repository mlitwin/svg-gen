import svgGen, { parseToText } from './src/svg-gen.js';
import { Matrix } from './src/matrix/matrix.js';
import Geom from './src/geometry/geometry.js';
import fs from 'fs';


function EllipseFromCircle(context, opts, transform) {
    const standard = Geom.EllipseWithPerspective(opts.cx, opts.cy, opts.r, opts.r, context.eye, transform);

    const cx = standard.cx;
    const cy = standard.cy;
    const rx = standard.rx;
    const ry = standard.ry;

    return context.s.ellipse({
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

function longitude(context, l, R) {

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

    return EllipseFromCircle(context, { cx: 0, cy: 0, r }, Matrix.Identity(4).Transform(transform));
}

function latitude(context, i, R) {
    const l = i * (Math.PI / 2);

    const transform = [

        {
            op: "Rotate",
            args: { axes: "Y", angle: l }
        },
        {
            op: "Rotate",
            args: { axes: "X", angle: context.skew }
        },
    ];

    return EllipseFromCircle(context, { cx: 0, cy: 0, r: R }, Matrix.Identity(4).Transform(transform));
}

function makeRange(first, last) {
    const range = [];
    for (let i = first; i <= last; i++) {
        range.push(i);
    }
    return range;
}

function makeSphere(context) {
    const svg = context.s.svg({
        width: 600,
        height: 600,
        viewBox: "-300 -300 600 600"
    }, [
        ...makeRange(-8, 8).map(i => (i / 8) * (Math.PI / 2)).map(l => {
            return longitude(context, l, 250);
        }),
        ...makeRange(0, 7).map(i => (i / 8) * (Math.PI / 2)).map(l => {
            return latitude(context, l, 250);
        }),

        //s.line({x1: -250, y1: 0, x2: 250, y2: 0, stroke: "red", 'stroke-width': 3}),
        // s.line({x1: 0, y1: -250, x2: 0, y2: 250, stroke: "red", 'stroke-width': 3}),
    ]);

    return svg;
}

const context = {
    eye: { x: -50, y: 0, z: -2000 },
    s: new svgGen({}),
    skew: 0
}

const sphereStandard = makeSphere(context);

context.skew = Math.PI / 8;
const sphereSkew = makeSphere(context);

fs.writeFileSync('docs/generated/spherestandard.svg', parseToText(sphereStandard));
fs.writeFileSync('docs/generated/sphereskew.svg', parseToText(sphereSkew));
