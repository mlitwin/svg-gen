// https://developer.mozilla.org/en-US/docs/Web/SVG/Element

import {elementFromCircleOrEllipse} from "./svg-perspective.js";

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
    { name: "clip-path" },
];

const svgTypes = {
    a: {
        options: [
            { name: "href" },
            { name: "target" }
        ]
    },
    altGlyph: { options: [] },
    altGlyphDef: { options: [] },
    altGlyphItem: { options: [] },
    animate: {
        options: [
            { name: "attributeName" },
            { name: "from" },
            { name: "to" },
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
    circle: {
        options: [
            { name: "cx" },
            { name: "cy" },
            { name: "r" },
            { name: "marker-start" },
            { name: "marker-mid" },
            { name: "marker-end" }
        ]
    },
    clipPath: {
        options: [
            { name: "clipPathUnits" }
        ]
    },
    cursor: {
        options: [
            { name: "x" },
            { name: "y" },
            { name: "xlink:href" }
        ]
    },
    defs: { options: [] },
    desc: { options: [] },
    ellipse: {
        options: [
            { name: "cx" },
            { name: "cy" },
            { name: "rx" },
            { name: "ry" },
            { name: "marker-start" },
            { name: "marker-mid" },
            { name: "marker-end" }
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
    filter: {
        options: [
            { name: "x" },
            { name: "y" },
            { name: "width" },
            { name: "height" },
            { name: "filterUnits" }
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
    foreignObject: {
        options: [
            { name: "x" },
            { name: "y" },
            { name: "width" },
            { name: "height" }
        ]
    },
    g: { options: [] },
    glyph: {
        options: [
            { name: "d" },
            { name: "horiz-adv-x" }
        ]
    },
    glyphRef: { options: [] },
    image: {
        options: [
            { name: "href" },
            { name: "x" },
            { name: "y" },
            { name: "width" },
            { name: "height" }
        ]
    },
    line: {
        options: [
            { name: "x1" },
            { name: "y1" },
            { name: "x2" },
            { name: "y2" },
            { name: "marker-start" },
            { name: "marker-mid" },
            { name: "marker-end" }
        ]
    },
    linearGradient: {
        options: [
            { name: "x1" },
            { name: "y1" },
            { name: "x2" },
            { name: "y2" },
            { name: "gradientUnits" }
        ]
    },
    marker: {
        options: [
            { name: "refX" },
            { name: "refY" },
            { name: "markerWidth" },
            { name: "markerHeight" },
            { name: "orient" }
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
    metadata: { options: [] },
    missingGlyph: {
        options: [
            { name: "d" },
            { name: "horiz-adv-x" }
        ]
    },
    mpath: {
        options: [
            { name: "href" },
        ]
    },
    path: {
        options: [
            { name: "d" },
            { name: "marker-start" },
            { name: "marker-mid" },
            { name: "marker-end" }
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
    polygon: {
        options: [
            { name: "points" },
            { name: "marker-start" },
            { name: "marker-mid" },
            { name: "marker-end" }
        ]
    },
    polyline: {
        options: [
            { name: "points" },
            { name: "marker-start" },
            { name: "marker-mid" },
            { name: "marker-end" }
        ]
    },
    radialGradient: {
        options: [
            { name: "cx" },
            { name: "cy" },
            { name: "r" },
            { name: "fx" },
            { name: "fy" },
            { name: "gradientUnits" }
        ]
    },
    rect: {
        options: [
            { name: "x" },
            { name: "y" },
            { name: "width" },
            { name: "height" },
            { name: "rx" },
            { name: "ry" },
            { name: "marker-start" },
            { name: "marker-mid" },
            { name: "marker-end" }
        ]
    },
    script: {
        options: [
            { name: "href" },
            { name: "type" }
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
    stop: {
        options: [
            { name: "offset" },
            { name: "stop-color" },
            { name: "stop-opacity" }
        ]
    },
    style: {
        options: [
            { name: "type" }
        ]
    },
    svg: {
        options: [
            { name: "width", default: "100" },
            { name: "height", default: "100" },
            { name: "viewBox", default: "0 0 100 100" },
            { name: "xmlns", default: "http://www.w3.org/2000/svg" }
        ]
    },
    switch: { options: [] },
    symbol: { options: [] },
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
    textPath: {
        options: [
            { name: "href" },
            { name: "startOffset" },
            { name: "method" },
            { name: "spacing" }
        ]
    },
    title: { options: [] },
    tref: { options: [] },
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
    use: { options: [] },
    view: {
        options: [
            { name: "viewBox" },
            { name: "preserveAspectRatio" }
        ]
    }
};

svgTypes.circle.withPerspective = function(perspective, renderContext) {
    return elementFromCircleOrEllipse.call(this, perspective, renderContext);
}

svgTypes.ellipse.withPerspective = function(perspective, renderContext) {
    return elementFromCircleOrEllipse.call(this, perspective, renderContext);
}

export {allElementsOptions, svgTypes};
