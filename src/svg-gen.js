// src/svg-gen.js

import { svgTypes } from "./svg/svg-types.js";
import { addWithPerspective } from "./svg/svg-perspective.js";

addWithPerspective(svgTypes);

function node(type, spec, options, children, s) {
    this.type = type;
    this.children = children;
    this.s = s;

    if (this.children && !Array.isArray(this.children)) {
        this.children = [this.children];
    }

    const optionsList = [];
    const setOptions = options || {};
    const specOptions = spec.options || [];
    const allOptions = [...specOptions];
    allOptions.forEach(opt => {
        const haveOptVal = opt.name in options;
        if (opt.default || haveOptVal) {
            let value = haveOptVal ? options[opt.name] : opt.default;
            if(opt.fromSVGString && typeof value === 'string') {
                value = opt.fromSVGString(value);
            }
            const optWithValue = {
                name: opt.name,
                value
            };
            optionsList.push(optWithValue);
            setOptions[opt.name] = optWithValue.value;
        }
    });
    this.options = setOptions;
    this.optionsList = optionsList;

    return this;
}

node.prototype.With = function (opts) {
    this.with_opts = opts;
    return this;
}

node.prototype.renderForm = function (renderContext) {
    const opts = this.with_opts;
    if(this.options._clipP) {
        const pts = this.options._clipP;
       // console.log(pts);
    }

    if (opts?.perspective) {
        return this.withPerspective(opts.perspective, renderContext);
    }

    return this;
}


node.prototype.withPerspective = function (opts, renderContext) {
    const withPerspective = svgTypes[this.type].withPerspective;
    if (!withPerspective) {
        throw new Error(`withPerspective is not defined for ${this.type}`);
    }
    return withPerspective.call(this, opts, renderContext)
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

function treeWalker(node, context, handlers) {
    const { open, close } = handlers;
    const renderNode = node.renderForm ? node.renderForm(context) : node;
    const newContext = { ...context, depth: context.depth + 1 };
    if (node.type === "svg") {
        const viewBoxOption = renderNode.options.viewBox;
        if (viewBoxOption) {
            newContext.viewBox = viewBoxOption;
        }
    }
    const spacing = ' '.repeat(context.depth * 2);
    let result = '';

    if (open) {
        result += spacing + open(renderNode) + '\n';
    }

    if (renderNode.children) {


        renderNode.children.forEach(child => {
            result += treeWalker(child, { ...newContext }, handlers);
        });
    }

    if (close) {
        result += spacing + close(renderNode) + '\n';
    }

    return result;
}

function optionsToSVGString(type, name, value) {
    const optionMap = svgTypes[type].optionsMap;
    const option = optionMap[name];
    if(option.toSVGString && typeof value !== 'string') {
        return option.toSVGString(value);
    }
    return String(value)
} 

export function parseToText(node) {
    return treeWalker(node, { depth: 0 }, {
        open: (n) => {
            if (typeof n === "string") {
                return n;
            }
            let val = [
                `<${n.type}`,
                ...n.optionsList.map(opt => {
                    const strVal = optionsToSVGString(n.type, opt.name, opt.value);
                    return `${opt.name}="${strVal}"`;
                })
            ].join(" ");
            if (n.children) {
                val += '>';
            } else {
                val += '/>';
            }
            return val;
        },
        close: (n) => {
            if (typeof n === "string") {
                return '';
            }
            return n.children ? `</${n.type}>` : "";
        }
    }).trim();
}

export default svgGen;

