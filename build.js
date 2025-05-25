import svgGen, { parseToText } from './src/svg-gen.js';
import { Matrix } from './src/matrix/matrix.js';
import fs from 'fs';

function latitude(context, i, n, R) {
    const l = i * (Math.PI / 2) / n;
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
    const opts = {
        cx: 0, cy: 0, r, fill: "none",
        stroke: "black",
        'stroke-width': i == 0 ? 2 : 1
    };
    const perspective = {
        eye: context.eye,
        transform: Matrix.Identity(4).Transform(transform),
        clip: context.clip,
    }

    return context.s.circle(opts).With({ perspective });
}

function longitude(context, i, n, R) {
    const l = i * (Math.PI / 2) / n;

    const transform = [
        {
            op: "Rotate",
            args: { axes: "Z", angle: context.skew }
        },
        {
            op: "Rotate",
            args: { axes: "Y", angle: l }
        },


    ];

    const opts = {
        cx: 0, cy: 0, r: R, fill: "none",
        stroke: "black",
        'stroke-width': i === n ? 2 : 1
    };
    const perspective = {
        eye: context.eye,
        transform: Matrix.Identity(4).Transform(transform),
        clip: context.clip
    }

    return context.s.circle(opts).With({ perspective });
}

function makeRange(first, last) {
    const range = [];
    for (let i = first; i <= last; i++) {
        range.push(i);
    }
    return range;
}

const R = 250;

function makeSphere(context) {
    const svg = context.s.svg({
        width: 600,
        height: 600,
        viewBox: "-300 -300 600 600"
    }, [
        ...makeRange(-16, 16).map(i => {
            return longitude(context, i, 16, R);
        }),
        ...makeRange(-16, 16).map(i => {
            return latitude(context, i, 16, R);
        }),
    ]);

    return svg;
}

const Z = -2500;
const eye = { x: 0, y: 0, z: Z - R * R / Z };
const eyeNorm = Math.sqrt(eye.x * eye.x + eye.y * eye.y + eye.z * eye.z);
const context = {
    eye,
    clip: {
        plane: {
            point: [0, 0, 0],
            normal: [eye.x / eyeNorm, eye.y / eyeNorm, eye.z / eyeNorm]
        }
    },
    s: new svgGen({}),
    skew: 0
}

const sphereStandard = makeSphere(context);

context.skew = Math.PI / 8;
const sphereSkew = makeSphere(context);

fs.writeFileSync('docs/generated/spherestandard.svg', parseToText(sphereStandard));
fs.writeFileSync('docs/generated/sphereskew.svg', parseToText(sphereSkew));

function makeCoordSys(opts) {
    const { x1, y1, x2, y2 } = opts;
    const l1coords = { x1: 50, y1: 250, x2: 200 * x1 + 50, y2: 200 * y1 + 50 };
    const l2coords = { x1: 50, y1: 250, x2: 200 * x2 + 50, y2: 200 * y2 + 50 };
    const s = new svgGen({});
    const svg = s.svg({
        width: 150,
        height: 150,
        viewBox: "0 0 300 300"
    }, [
        s.defs({}, [
            s.marker({
                id: "arrowhead",
                markerWidth: 10,
                markerHeight: 7,
                refX: 0,
                refY: 3.5,
                orient: "auto"
            }, [
                s.polygon({ points: "0 0, 10 3.5, 0 7", fill: "red" })
            ])
        ]),
        s.line({ ...l1coords, stroke: "black", 'stroke-width': 2, 'marker-end': "url(#arrowhead)" }),
        s.text({ x: (l1coords.x1 + l1coords.x2) / 2 - 35, y: (l1coords.y1 + l1coords.y2) / 2, "font-size": "2em" }, "x₁"),
        s.line({ ...l2coords, stroke: "black", 'stroke-width': 2, 'marker-end': "url(#arrowhead)" }),
        s.text({ x: (l2coords.x1 + l2coords.x2) / 2, y: (l2coords.y1 + l2coords.y2) / 2 + 35, "font-size": "2em" }, "x₂"),

    ]);

    return svg;
}

const tangentStandard = makeCoordSys({ x1: 0, y1: 0, x2: 1, y2: 1 });
fs.writeFileSync('docs/generated/spherestandard-tanget.svg', parseToText(tangentStandard));

const tangentSkew = makeCoordSys({ x1: 0, y1: 0, x2: .75, y2: .75 });
fs.writeFileSync('docs/generated/sphereskew-tanget.svg', parseToText(tangentSkew));
