import svgGen, {parseToText} from '@mlitwin/svg-gen';
import { Matrix } from '@mlitwin/svg-gen/matrix/matrix.js';
import fs from 'fs';

function latitude(context, i, n, R) {
    const l = i * (Math.PI) / n;
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
        stroke: i == 0 ? "green" : "black",
        'stroke-width': i == 0 ? 2 : 1
    };
    const perspective = {
        transform: Matrix.Identity(4).Transform(transform),
    }

    return context.s.circle(opts).With({ perspective });
}

function longitude(context, i, n, R) {
    const l = i * (Math.PI) / n;

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
    if (i == n) {
        opts.stroke = "green";
    }
    const perspective = {
        transform: Matrix.Identity(4).Transform(transform)
    }

    return [context.s.circle(opts).With({ perspective })];
}

function makeRange(first, last) {
    const range = [];
    for (let i = first; i <= last; i++) {
        range.push(i);
    }
    return range;
}

const R = 250;

function makeLongitudeArrow(context, phi, theta) {
    const s = context.s;
    const x = Math.sin(theta) * R;
    const y = Math.cos(theta) * R;

    const perspective = {
        transform: Matrix.Identity(4)
    }

    const d = `M 0 -${R} A ${R} ${R} 0 0 1 ${x} ${-y}`;
    const meridian = s.path({
        d,
        fill: "none",
        stroke: "red",
        'stroke-width': 2
    }).With({ perspective });

    const transform = [
        {
            op: "Rotate",
            args: { axes: "Y", angle: -(Math.PI / 2 - phi) }
        },
    ];

    const perspectivePhi = {
        transform: Matrix.Identity(4).Transform(transform),
    }

    const long = s.path({
        d,
        fill: "none",
        stroke: "yellow",
        'stroke-width': 3,
        'marker-end': "url(#arrowhead)"
    }).With({ perspective: perspectivePhi });

    return [meridian, long];

}

function makeLatitudeArrow(context, phi, theta) {
    const s = context.s;

    const dy = Math.cos(theta) * R;
    const r = Math.abs(Math.sin(theta) * R);
    const x = r * Math.sin(phi);
    const y = r * Math.cos(phi);

    const transform = [
        {
            op: "Translate",
            args: { vec: [0, -dy, 0] }
        },
        {
            op: "Rotate",
            args: { axes: "X", angle: Math.PI / 2 }
        },
    ];

    const perspective = {
        transform: Matrix.Identity(4).Transform(transform)
    }

    const d = `M ${r} 0 A ${r} ${r} 0 0 1 ${x} ${-y} `;
    const lat = s.path({
        d: d,
        fill: "none",
        stroke: "blue",
        'stroke-width': 3,
        'marker-end': "url(#arrowhead)"
    }).With({ perspective });
    return [lat];
}


function makeSphere(context, perspective) {
    const s = context.s;
    const N = 2 * 16;
    const phi = 29 * (Math.PI) / N;
    const theta = 13 * (Math.PI) / N;
    const svg = s.svg({
        width: 600,
        height: 600,
        viewBox: "-300 -300 600 600"
    }, [
        s.defs({}, [
            s.marker({
                id: "arrowhead",
                markerWidth: 16,
                markerHeight: 7,
                refX: 0,
                refY: 1.75,
                orient: "auto"
            }, [
                s.rect({ x: 0, y: 1.25, width: 3, height: 1, fill: "red" }),
                // Arrowhead polygon attached to end of rect
                s.polygon({ points: `3 0, 7 1.75, 3 3.5`, fill: "red" })
            ])
        ]),

        ...makeRange(0, N).map(i => {
            return longitude(context, i, N, R);
        }).flat(),
        ...makeLongitudeArrow(context, phi, theta),

        ...makeRange(-N, N).map(i => {
            return latitude(context, i, N, R);
        }),

        ...makeLatitudeArrow(context, phi, theta),


    ]).With({ perspective });

    return svg;
}

const Z = 2500;
const eye = { x: 0, y: 0, z: Z };
const clipCenter = { x: 0, y: 0, z: R * R / Z };
const clipNorm = Math.sqrt((eye.x - clipCenter.x) ** 2 + (eye.y - clipCenter.y) ** 2 + (eye.z - clipCenter.z) ** 2);

const clipNormal = {
    x: (eye.x - clipCenter.x) / clipNorm,
    y: (eye.y - clipCenter.y) / clipNorm,
    z: (eye.z - clipCenter.z) / clipNorm
};


const perspective = {
    eye,
    clip: {
        plane: {
            point: [clipCenter.x, clipCenter.y, clipCenter.z],
            normal: [clipNormal.x, clipNormal.y, clipNormal.z]
        }
    }
}

const context = {
    s: new svgGen({}),
    skew: 0
}

const sphereStandard = makeSphere(context, perspective);

context.skew = Math.PI / 8;
const sphereSkew = makeSphere(context, perspective);

fs.writeFileSync('../docs/generated/spherestandard.svg', parseToText(sphereStandard));
fs.writeFileSync('../docs/generated/sphereskew.svg', parseToText(sphereSkew));

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
        s.text({ x: (l1coords.x1 + l1coords.x2) / 2 - 35, y: (l1coords.y1 + l1coords.y2) / 2, "font-size": "2em" }, "e¹"),
        s.line({ ...l2coords, stroke: "black", 'stroke-width': 2, 'marker-end': "url(#arrowhead)" }),
        s.text({ x: (l2coords.x1 + l2coords.x2) / 2, y: (l2coords.y1 + l2coords.y2) / 2 + 35, "font-size": "2em" }, "e²"),

    ]);

    return svg;
}

const tangentStandard = makeCoordSys({ x1: 0, y1: 0, x2: 1, y2: 1 });
fs.writeFileSync('../docs/generated/spherestandard-tanget.svg', parseToText(tangentStandard));

const tangentSkew = makeCoordSys({ x1: 0, y1: 0, x2: .75, y2: .75 });
fs.writeFileSync('../docs/generated/sphereskew-tanget.svg', parseToText(tangentSkew));
