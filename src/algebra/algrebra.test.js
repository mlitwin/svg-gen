import { describe, it, expect } from 'vitest';
import { Algebra } from './algebra';

describe('QuadraticRoots', () => {
    it('should create a quadratic expression', () => {
        const roots = Algebra.QuadraticRoots(1, 2, 3); // x² + 2x + 3
        expect(roots).toBeDefined();
    });

    it('should return the correct roots for a quadratic equation with complex roots', () => {
        const roots = Algebra.QuadraticRoots(1, 2, 5); // x² + 2x + 5
        expect(roots).toEqual([]);
    });

    it('should return the correct roots for a quadratic equation with one real root', () => {
        const roots = Algebra.QuadraticRoots(1, -4, 4); // x² - 4x + 4
        expect(roots).toEqual([2, 2]);
    });

});