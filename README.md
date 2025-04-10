# svg-gen

Javascript SVG Generation. At this points pretty bare-bones as I figure out what I want. Similar to [svg.py](https://github.com/orsinium-labs/svg.py) or [snap.svg](http://snapsvg.io/) I think. I'm adding support for perspective transformations applied directly, rather than (somewhat buggy) CSS perspective transformations, and learning about geometry, perspective, and SVGs along the way.

## Usage

```javascript
import svgGen, {parseToText} from './src/svg-gen.js';

const s = new svgGen({});
const svg = s.svg({}, [
    s.text({ x: 10, y: 20 }, "Hello, World!"),
    s.g({}, [
        s.text({ x: 10, y: 20 }, "A")
    ]),
    s.circle({ cx: 50, cy: 50, r: 40 })
]
);

console.debug(parseToText(svg));
```

yields

```
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <text x="10" y="20">
    Hello, World!
  </text>
  <g>
    <text x="10" y="20">
      A
    </text>
  </g>
  <circle cx="50" cy="50" r="40"/>
</svg>
```

## Perspective

## `withPerspective()` Method

The `withPerspective()` method is available for the `circle` and `ellipse` SVG types. This method allows you to create SVG elements with transformations applied based on a given perspective.

### Usage

The `withPerspective()` method applies a perspective transformation to a `circle` or `ellipse` element. It converts the geometry into an ellipse if necessary and applies rotation and scaling transformations.

#### Parameters

- `perspective` (Object): An object containing the following properties:
  - `eye` (Object): The eye position for the perspective transformation.
  - `transform` (Object): The transformation matrix to apply.

#### Returns

An SVG `ellipse` element with the specified properties and transformations.

#### Example

```javascript
import svgGen, {parseToText} from './src/svg-gen.js';
import { Matrix } from './src/matrix/matrix.js';
import Geom from './src/geometry/geometry.js';

const transform = [

    {
        op: "Rotate",
        args: { axes: "Y", angle: l }
    },
    {
        op: "Rotate",
        args: { axes: "X", angle: Math.PI/4 }
    },
];

const opts = {
    cx: 0, cy: 0, r: R, fill: "none",
    stroke: "black",
    'stroke-width': 1
};
const perspective = {
    eye:  { x: -50, y: 0, z: -2000 },
    transform: Matrix.Identity(4).Transform(transform)
}

const s = new svgGen({});
const svg = s.svg({}, [
    s.circle({ cx: 50, cy: 50, r: 40 }).withPerspective( {
        eye:  { x: -50, y: 0, z: -2000 },
        transform: Matrix.Identity(4).Transform(transform)
    })
    ]
);

    return context.s.circle(opts).withPerspective(perspective);

console.debug(parseToText(svg));
```

## Samples

[Github Pages](https://antoninus.org/svg-gen/)

# References

## Spherical Coordinate Systems

* https://en.wikipedia.org/wiki/Spherical_coordinate_system

## Matrices

### Singular Value Decomposition

* https://en.wikipedia.org/wiki/Singular_value_decomposition
* https://github.com/danilosalvati/svd-js

### Affine Transformation Matrices

* https://en.wikipedia.org/wiki/Affine_transformation

## Perspective Transform

* https://en.wikipedia.org/wiki/3D_projection#Perspective_projection

### SVG and CSV Perspective Transform

* https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/transform
* https://developer.mozilla.org/en-US/docs/Web/CSS/perspective
* https://developer.mozilla.org/en-US/docs/Web/CSS/transform

## Ellipses

* https://en.wikipedia.org/wiki/Matrix_representation_of_conic_sections
* https://en.wikipedia.org/wiki/Conic_section#Conversion_to_canonical_form
* https://en.wikipedia.org/wiki/Ellipse#Canonical_form


