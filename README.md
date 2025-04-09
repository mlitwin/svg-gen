# svg-gen

Javascript SVG Generation. At this points pretty bare-bones as I figure out what I want. Similar to [svg.py](https://github.com/orsinium-labs/svg.py) or [snap.svg])http://snapsvg.io/) I think. I'm adding support for perspective transformations applied directly, rather than (somewhat buggy) CSS perspective transformations, and learning about geometry, perspective, and SVGs along the way.

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

## Samples

[Github Pages](https://antoninus.org/svg-gen/)


