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

    return context.s.circle(opts).With({perspective});
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

    return context.s.circle(opts).With({perspective});
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
const eye = { x: 0, y: 0, z: Z - R*R/Z };
const eyeNorm = Math.sqrt(eye.x * eye.x + eye.y * eye.y + eye.z * eye.z);
const context = {
    eye,
    clip: {
        plane: {
            point: [0, 0, 0],
            normal: [eye.x/eyeNorm, eye.y/eyeNorm, eye.z/eyeNorm]
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
