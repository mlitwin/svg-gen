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

node.prototype.With = function (opts) {
   this.with_opts = opts;
   return this;
}

node.prototype.renderForm = function (renderContext) {
    const opts = this.with_opts;

    if(opts) {
        return this.withPerspective(opts, renderContext);
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
    const renderNode = node.renderForm(context);
    const newContext = { ...context, depth: context.depth + 1 };
    if(node.type === "svg") {
        const viewBoxOption = renderNode.options.viewBox;
        if (viewBoxOption) {
            const [x, y, width, height] = viewBoxOption.split(' ').map(Number);
            newContext.viewBox = { x, y, width, height };
        }
    }
    const spacing = ' '.repeat(context.depth * 2);
    let result = '';

    if (open) {
        result += spacing + open(renderNode) + '\n';
    }

    if (renderNode.children) {
   

        renderNode.children.forEach(child => {
            result += treeWalker(child, {...newContext}, handlers);
        });
    }

    if (close) {
        result += spacing + close(renderNode) + '\n';
    }

    return result;
}

export function parseToText(node) {
    return treeWalker(node, {depth: 0}, {
        open: (n) => {
            if (typeof n === "string") {
                return n;
            }
            return [
                `<${n.type}`,
                ...n.optionsList.map(opt => {
                    return `${opt.name}="${opt.value}"`;
                }),
                '>'
            ].join(" ");
        },
        close: (n) => {
            if (typeof n === "string") {
                return '';
            }
            return `</${n.type}>`;
        }
    }).trim();
}

export default svgGen;

