# svg-gen

Javascript SVG Generation. At this points pretty bare-bones as I figure out what I want. Similar to [svg.py](https://github.com/orsinium-labs/svg.py) or [snap.svg](http://snapsvg.io/) I think. I'm adding support for perspective transformations applied directly, rather than (somewhat buggy) CSS perspective transformations, and learning about geometry, perspective, and SVGs along the way.

NPM: [@mlitwin/svg-gen](https://www.npmjs.com/package/@mlitwin/svg-gen)


![Sphere](https://antoninus.org/svg-gen/generated/spherestandard.svg)

## Status

Alpha software being hacked on.

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

## `With()` Method

The `With()` method is available for the `circle` and `ellipse` SVG types. This method allows you to create SVG elements with transformations applied based on a given perspective.

### Usage

The `With()` method applies a perspective transformation to a `circle` or `ellipse` element. It converts the geometry into an ellipse if necessary and applies rotation and scaling transformations.

#### Parameters

- `perspective` (Object): An object containing the following properties:
  - `eye` (Object): The eye position for the perspective transformation.
  - `transform` (Object): The 3D transformation matrix to apply to the object as defined in the XY Plane
  - `clip` { plane: {point, normal} }: Clipping region in 3D space. Supports a plane defined by a point and a normal.


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

return context.s.circle(opts).With(perspective);

console.debug(parseToText(svg));
```

## Samples

[Github Pages](https://antoninus.org/svg-gen/)


# References

See [References.md](./References.md)

