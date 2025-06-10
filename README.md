# svg-gen

Javascript SVG Generation. At this points pretty bare-bones as I figure out what I want. Similar to [svg.py](https://github.com/orsinium-labs/svg.py) or [snap.svg](http://snapsvg.io/) I think. I'm adding support for perspective transformations applied directly, rather than (somewhat buggy) CSS perspective transformations, and learning about geometry, perspective, and SVGs along the way.

NPM: [@mlitwin/svg-gen](https://www.npmjs.com/package/@mlitwin/svg-gen)


![Sphere](https://antoninus.org/svg-gen/generated/spherestandard.svg)

## Status

Alpha software being hacked on.

## Work Plan Notes

* [ ] Different perspectives show some errors that look like in clipping. `eye = { x: 0, y: -1000, z: Z };` in examples.
* [ ] More on Vector class: Matrix.Cols() return array of Vector(). 
* [X] Turn build.js into a more generic set of web pages as examples each x.js makes an x.svg. Beginning of e2e
* [ ] svg-types is data driven which is fast to start, but probably better to just make SVGElement hierarchy mirroring W3C standard

## Usage

```javascript
import svgGen, {parseToText} from '@mlitwin/svg-gen';

const s = new svgGen({});
const svg = s.svg({}, [
    s.title({ }, "Hello World with circle"),
    s.text({ x: 10, y: 20 }, "Hello, World!"),
    s.g({}, [
        s.text({ x: 10, y: 60 }, "A group")
    ]),
    s.circle({ cx: 50, cy: 50, r: 40, fill: "none", stroke: "black" })
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

The `With()` method supports non-svg standard behaviors. Currently perspective.

### Perspective

The `With( { perspective })` applies a perspective transformation with optional clipping. Supported elements are:

* `circle` - transforms to an ellipse, or when viewed on-edge, a line.
* `ellipse` - transforms to an ellipse, when viewed on-edge, a line.
* `path` - transforms to a path.
* `polygon` - TODO
* `polyline` - TODO
* `line` - TODO
* `text` - TODO. Position of text, not transforming the text per se.
* `rect` - TODO. Not sure what to do about corner radii.


#### Parameters

- `perspective` (Object): An object containing the following properties:
  - `eye` (Object): The eye position for the perspective transformation.
  - `transform` (Object): The 3D transformation matrix to apply to the object as defined in the XY Plane
  - `clip` { plane: {point, normal} }: Clipping region in 3D space. Supports a plane defined by a point and a normal.

## Samples

[Github Pages](https://antoninus.org/svg-gen/)


# References

See [References.md](./References.md)

