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