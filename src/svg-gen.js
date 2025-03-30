// src/svg-gen.js

// https://developer.mozilla.org/en-US/docs/Web/SVG/Element

const allElementsOptions = [
    { name: "transform" },
    { name: "id" },
    { name: "xml:base" },
    { name: "xml:lang" },
    { name: "xml:space" },
    { name: "class" },
    { name: "style" },
    { name: "tabindex" },
    { name: "focusable" },
    { name: "requiredExtensions" },
    { name: "requiredFeatures" },
    { name: "systemLanguage" },
    { name: "externalResourcesRequired" },
    { name: "fill" },
    { name: "stroke" },
    { name: "stroke-width" },
];

const svgTypes = {
    svg: {
        options: [
            { name: "width", default: "100" },
            { name: "height", default: "100" },
            { name: "viewBox", default: "0 0 100 100" },
            { name: "xmlns", default: "http://www.w3.org/2000/svg" }
        ]
    },
    g: { options: [] },
    defs: { options: [] },
    symbol: { options: [] },
    use: { options: [] },
    image: {
        options: [
            { name: "href" },
            { name: "x" },
            { name: "y" },
            { name: "width" },
            { name: "height" }
        ]
    },
    text: {
        options: [
            { name: "x" },
            { name: "y" },
            { name: "dx" },
            { name: "dy" },
            { name: "rotate" },
            { name: "textLength" },
            { name: "lengthAdjust" }
        ]
    },
    tspan: {
        options: [
            { name: "x" },
            { name: "y" },
            { name: "dx" },
            { name: "dy" },
            { name: "rotate" },
            { name: "textLength" },
            { name: "lengthAdjust" }
        ]
    },
    tref: { options: [] },
    textPath: {
        options: [
            { name: "href" },
            { name: "startOffset" },
            { name: "method" },
            { name: "spacing" }
        ]
    },
    altGlyph: { options: [] },
    altGlyphDef: { options: [] },
    altGlyphItem: { options: [] },
    glyphRef: { options: [] },
    marker: {
        options: [
            { name: "refX" },
            { name: "refY" },
            { name: "markerWidth" },
            { name: "markerHeight" },
            { name: "orient" }
        ]
    },
    pattern: {
        options: [
            { name: "x" },
            { name: "y" },
            { name: "width" },
            { name: "height" },
            { name: "patternUnits" }
        ]
    },
    clipPath: {
        options: [
            { name: "clipPathUnits" }
        ]
    },
    mask: {
        options: [
            { name: "x" },
            { name: "y" },
            { name: "width" },
            { name: "height" },
            { name: "maskUnits" }
        ]
    },
    filter: {
        options: [
            { name: "x" },
            { name: "y" },
            { name: "width" },
            { name: "height" },
            { name: "filterUnits" }
        ]
    },
    feBlend: {
        options: [
            { name: "in" },
            { name: "in2" },
            { name: "mode" }
        ]
    },
    feColorMatrix: {
        options: [
            { name: "in" },
            { name: "type" },
            { name: "values" }
        ]
    },
    feComponentTransfer: { options: [] },
    feComposite: {
        options: [
            { name: "in" },
            { name: "in2" },
            { name: "operator" },
            { name: "k1" },
            { name: "k2" },
            { name: "k3" },
            { name: "k4" }
        ]
    },
    feConvolveMatrix: {
        options: [
            { name: "in" },
            { name: "order" },
            { name: "kernelMatrix" },
            { name: "divisor" },
            { name: "bias" },
            { name: "targetX" },
            { name: "targetY" },
            { name: "edgeMode" },
            { name: "kernelUnitLength" },
            { name: "preserveAlpha" }
        ]
    },
    feDiffuseLighting: {
        options: [
            { name: "in" },
            { name: "surfaceScale" },
            { name: "diffuseConstant" },
            { name: "kernelUnitLength" }
        ]
    },
    feDisplacementMap: {
        options: [
            { name: "in" },
            { name: "in2" },
            { name: "scale" },
            { name: "xChannelSelector" },
            { name: "yChannelSelector" }
        ]
    },
    feFlood: {
        options: [
            { name: "flood-color" },
            { name: "flood-opacity" }
        ]
    },
    feGaussianBlur: {
        options: [
            { name: "in" },
            { name: "stdDeviation" }
        ]
    },
    feImage: {
        options: [
            { name: "href" },
            { name: "preserveAspectRatio" }
        ]
    },
    feMerge: { options: [] },
    feMergeNode: {
        options: [
            { name: "in" }
        ]
    },
    feMorphology: {
        options: [
            { name: "in" },
            { name: "operator" },
            { name: "radius" }
        ]
    },
    feOffset: {
        options: [
            { name: "in" },
            { name: "dx" },
            { name: "dy" }
        ]
    },
    feSpecularLighting: {
        options: [
            { name: "in" },
            { name: "surfaceScale" },
            { name: "specularConstant" },
            { name: "specularExponent" },
            { name: "kernelUnitLength" }
        ]
    },
    feTile: {
        options: [
            { name: "in" }
        ]
    },
    feTurbulence: {
        options: [
            { name: "baseFrequency" },
            { name: "numOctaves" },
            { name: "seed" },
            { name: "stitchTiles" },
            { name: "type" }
        ]
    },
    cursor: {
        options: [
            { name: "x" },
            { name: "y" },
            { name: "xlink:href" }
        ]
    },
    a: {
        options: [
            { name: "href" },
            { name: "target" }
        ]
    },
    view: {
        options: [
            { name: "viewBox" },
            { name: "preserveAspectRatio" }
        ]
    },
    script: {
        options: [
            { name: "href" },
            { name: "type" }
        ]
    },
    animate: {
        options: [
            { name: "attributeName" },
            { name: "from" },
            { name: "to" },
            { name: "dur" },
            { name: "repeatCount" }
        ]
    },
    set: {
        options: [
            { name: "attributeName" },
            { name: "to" },
            { name: "begin" },
            { name: "dur" },
            { name: "repeatCount" }
        ]
    },
    animateMotion: {
        options: [
            { name: "path" },
            { name: "keyPoints" },
            { name: "keyTimes" },
            { name: "rotate" },
            { name: "dur" },
            { name: "repeatCount" }
        ]
    },
    animateColor: {
        options: [
            { name: "attributeName" },
            { name: "from" },
            { name: "to" },
            { name: "dur" },
            { name: "repeatCount" }
        ]
    },
    animateTransform: {
        options: [
            { name: "attributeName" },
            { name: "type" },
            { name: "from" },
            { name: "to" },
            { name: "dur" },
            { name: "repeatCount" }
        ]
    },
    mpath: {
        options: [
            { name: "href" }
        ]
    },
    font: {
        options: [
            { name: "horiz-origin-x" },
            { name: "horiz-origin-y" },
            { name: "horiz-adv-x" },
            { name: "vert-origin-x" },
            { name: "vert-origin-y" },
            { name: "vert-adv-y" }
        ]
    },
    glyph: {
        options: [
            { name: "d" },
            { name: "horiz-adv-x" }
        ]
    },
    missingGlyph: {
        options: [
            { name: "d" },
            { name: "horiz-adv-x" }
        ]
    },
    circle: {
        options: [
            { name: "cx" },
            { name: "cy" },
            { name: "r" }
        ]
    },
    ellipse: {
        options: [
            { name: "cx" },
            { name: "cy" },
            { name: "rx" },
            { name: "ry" }
        ]
    },
    rect: {
        options: [
            { name: "x" },
            { name: "y" },
            { name: "width" },
            { name: "height" },
            { name: "rx" },
            { name: "ry" }
        ]
    },
    line: {
        options: [
            { name: "x1" },
            { name: "y1" },
            { name: "x2" },
            { name: "y2" }
        ]
    },
    path: {
        options: [
            { name: "d" }
        ]
    }
};


function node(type, spec, options, children) {
    this.type = type;
    this.children = children;

    if (this.children && !Array.isArray(this.children)) {
        this.children = [this.children];
    }

    const optionsList = [];
    const specOptions = spec.options || [];
    const allOptions = [...specOptions, ...allElementsOptions];
    allOptions.forEach(opt => {
        const haveOptVal = opt.name in options;
        if (opt.default || haveOptVal) {
            optionsList.push({
                name: opt.name,
                value: haveOptVal ? options[opt.name] : opt.default
            });
        }
    });
    this.optionsList = optionsList;

    return this;
}




function svgGen(options) {
    this.options = options || {};
    Object.keys(svgTypes).forEach(type => {
        this[type] = function (opts, children) {
            return new node(type, svgTypes[type], opts, children);
        };
    });

    return this;
}

function textProcessor(depth, node) {
    const spacing = ' '.repeat(depth * 2);

    if (typeof node === "string") {
        return spacing + node + '\n';
    }

    function open(n) {
        return [`<${n.type}`,
        ...n.optionsList.map(opt => {
            return `${opt.name}="${opt.value}"`;
        })].join(" ");
    }

    let text = spacing
    text += open(node);

    if (node.children) {
        text += '>\n';
        node.children.forEach(child => {
            text += textProcessor(depth + 1, child);
        });
        text += spacing + `</${node.type}>`;
    } else {
        text += `/>`;
    }
    if (depth > 0) {
        text += '\n';
    }

    return text;
}

export function parseToText(node) {
    return textProcessor(0, node);
}

export default svgGen;

