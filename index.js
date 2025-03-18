import svgGen from './src/svg-gen.js';
import beautify from 'js-beautify';

// Your code here to use svgGen
const s = new svgGen({});
const text = s.svg({},
    s.text({ x: 10, y: 20 }, "Hello, World!").
    circle({ cx: 50, cy: 50, r: 40 })
).ret;

const beautifiedText = beautify.html(text);
console.log(beautifiedText);
console.log(text);