import svgGen, {parseToText} from '@mlitwin/svg-gen';

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