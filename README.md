# svg-gen

Javascript SVG Generation. At this points just notes for what I want.

## Sketch of what it will be

Create a svg by chaining calls corresponding to svg elements


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


