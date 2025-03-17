// src/svg-gen.js

// https://developer.mozilla.org/en-US/docs/Web/SVG/Element

function node(svgGenInstance, type, spec, ...args) {
    this.type = type;
    this.spec = spec;
    return svgGenInstance;
}

const svgTypes = {
    svg: {},
    g: {},
    defs: {},
    symbol: {},
    use: {},
    image: {},
    text: {},
    tspan: {},
    tref: {},
    textPath: {},
    altGlyph: {},
    altGlyphDef: {},
    altGlyphItem: {},
    glyphRef: {},
    marker: {},
    pattern: {},
    clipPath: {},
    mask: {},
    filter: {},
    feBlend: {},
    feColorMatrix: {},
    feComponentTransfer: {},
    feComposite: {},
    feConvolveMatrix: {},
    feDiffuseLighting: {},
    feDisplacementMap: {},
    feFlood: {},
    feGaussianBlur: {},
    feImage: {},
    feMerge: {},
    feMergeNode: {},
    feMorphology: {},
    feOffset: {},
    feSpecularLighting: {},
    feTile: {},
    feTurbulence: {},
    cursor: {},
    a: {},
    view: {},
    script: {},
    animate: {},
    set: {},
    animateMotion: {},
    animateColor: {},
    animateTransform: {},
    mpath: {},
    font: {},
    glyph: {},
    missingGlyph: {},
    circle: {},
    rect: {},
    line: {},
    path: {}
};

function textProcessor(cur, node) {
    cur = cur || "";
    let text = `<${node.type}>`;
    text += `</${node.type}>`;
    return cur + text;
}


function svgGen(options) {
    this.options = options || {};
    this.options.processor = this.options.processor || textProcessor;
    this.ret = null;
    const thisInstance = this;
    Object.keys(svgTypes).forEach(type => {
        this[type] = function (...args) {
            const n = new node(thisInstance, type, svgTypes[type], ...args);
            this.ret = this.options.processor(this.ret, n);
            return n;
        };
    });

    return this;
}

export default svgGen;

