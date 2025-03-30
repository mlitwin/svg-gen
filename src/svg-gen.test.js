import { describe, it, expect } from 'vitest';
import svgGen, { parseToText } from './svg-gen.js';

describe('svgGen', () => {
    it('should generate SVG with text and circle elements', () => {
        const s = new svgGen({});
        const svg = s.svg({}, [
            s.text({ x: 10, y: 20 }, "Hello, World!"),
            s.g({}, [
                s.text({ x: 10, y: 20 }, "A")
            ]),
            s.circle({ cx: 50, cy: 50, r: 40 })
        ]);

        const result = parseToText(svg);
        expect(result).toContain('Hello, World!');
        expect(result).toContain('A');
        expect(result).toContain('<circle cx="50" cy="50" r="40"/>');
    });

    it('should generate empty SVG', () => {
        const s = new svgGen({});
        const svg = s.svg({}, []);

        const result = parseToText(svg);
        expect(result).toContain('<svg');
        expect(result).toContain('</svg>');
    });

    it('should generate SVG with a rectangle', () => {
        const s = new svgGen({});
        const svg = s.svg({}, [
            s.rect({ x: 10, y: 10, width: 100, height: 50 })
        ]);

        const result = parseToText(svg);
        expect(result).toContain('<rect x="10" y="10" width="100" height="50"/>');
    });

    it('should generate SVG with nested groups', () => {
        const s = new svgGen({});
        const svg = s.svg({}, [
            s.g({}, [
                s.g({}, [
                    s.text({ x: 10, y: 20 }, "Nested")
                ])
            ])
        ]);

        const result = parseToText(svg);
        expect(result).toContain('Nested');
    });
});
