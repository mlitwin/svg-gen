# svg-gen

Javascript SVG Generation. At this points just notes for what I want.

## Sketch of what it will be

Create a svg by chaining calls corresponding to svg elements


```javascript
const n = svg(
        {opts},
        circle(opts),
        path(opts),
        g(
            {opts}
            line(opts)
        )
    );

    writeFile(svg, file);
```

For each node type X, there is a function `X` with:
* First optional arg if it's an object that not a SVG node, then it's the attributes of X
* Following arguments are nodes appended as children
* If it's a function, call the function with a context passed as part of the first `svg()`


