// src/svg-gen.js

// https://developer.mozilla.org/en-US/docs/Web/SVG/Element


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


function node(svgGenInstance, type, spec, options, lastChild) {
    this.type = type;
    this.spec = spec;
    this.hasChild = !!lastChild;
    const optionsList = [];
    const allOptions = spec.options || [];
    allOptions.forEach(opt => {
        if (opt.default || opt.name in options) {
            optionsList.push({
                name: opt.name,
                default: options[opt.name] || opt.default
            });
        }
    });
    this.optionsList = optionsList;

    console.log(options, this.hasChild);
    return this;
}

function textProcessor(cur, node) {
    function nodeTex(n, close) {
        if(typeof n === "string") {
            return n;
        }

        let t = [`<${n.type}`,
            ...n.optionsList.map(opt => {
                return `${opt.name}="${opt.default}"`;
            })].join(" ");
        t += close;

        return t;

    }


    cur = cur || "";

    if(!node.hasChild) {
        return cur + nodeTex(node, '/>');
    }

    let text = nodeTex(node, '>')

    text += cur;

    text += `</${node.type}>`;
    return text;
}


function svgGen(options) {
    this.options = options || {};
    this.options.processor = this.options.processor || textProcessor;
    this.ret = null;
    const thisInstance = this;
    Object.keys(svgTypes).forEach(type => {
        this[type] = function (opts, lastChild) {
            const n = new node(thisInstance, type, svgTypes[type], opts, lastChild);

            thisInstance.ret = this.options.processor(thisInstance.ret, n);
            return thisInstance;
        };
    });

    return this;
}

export default svgGen;

