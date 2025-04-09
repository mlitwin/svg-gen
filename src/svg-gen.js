// src/svg-gen.js

import { allElementsOptions, svgTypes } from "./svg-types.js";

function node(type, spec, options, children, s) {
    this.type = type;
    this.children = children;
    this.s = s;

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
    this.options = options;
    this.optionsList = optionsList;

    return this;
}

node.prototype.withPerspective = function (opts) {
    const withPerspective = svgTypes[this.type].withPerspective;
    if(!withPerspective) {
        throw new Error(`withPerspective is not defined for ${this.type}`);
    }
    return withPerspective.call(this, opts)
}




function svgGen(options) {
    this.options = options || {};
    const self = this;
    Object.keys(svgTypes).forEach(type => {
        this[type] = function (opts, children) {
            return new node(type, svgTypes[type], opts, children, self);
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

