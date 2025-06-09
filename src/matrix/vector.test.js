
import { describe, it, expect } from 'vitest';
import { Vector } from './vector';

describe('Vector', () => {
    it('should create a vector of given length with zeros', () => {
        const v = new Vector(4);
        expect(v.length).toBe(4);
        expect(Array.from(v)).toEqual([0, 0, 0, 0]);
    });

    it('should create a vector of given length with zeros', () => {
        const v = new Vector(3);
        expect(v.length).toBe(3);
        v.x = 1; expect(v.x).to.equal(1);
        v.y = 2; expect(v.y).to.equal(2);
        v.z = 3; expect(v.z).to.equal(3);

        expect(Array.from(v)).toEqual([1, 2, 3]);
    });

    it('should create a vector from an object', () => {
        const v = new Vector({x:1, y:2, z:3});

        expect(Array.from(v)).toEqual([1, 2, 3]);
    });
});
