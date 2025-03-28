import { describe, it, expect } from 'vitest';
import { Matrix } from './matrix.js';
describe('Matrix', () => {
    it('should create a matrix from dimensions', () => {
        const matrix = new Matrix(2, 3);
        expect(matrix.m).toBe(2);
        expect(matrix.n).toBe(3);
        expect(matrix[0]).toEqual([0, 0, 0]);
        expect(matrix[1]).toEqual([0, 0, 0]);
    });

    it('should create a matrix from a string', () => {
        const matrix = new Matrix("1 2 3\n4 5 6");
        expect(matrix.m).toBe(2);
        expect(matrix.n).toBe(3);
        expect(matrix[0]).toEqual([1, 2, 3]);
        expect(matrix[1]).toEqual([4, 5, 6]);
    });

    it('should iterate over each row', () => {
        const matrix = new Matrix("1 2 3\n4 5 6");
        const rows = [];
        matrix.eachRow((row) => rows.push(row));
        expect(rows).toEqual([[1, 2, 3], [4, 5, 6]]);
    });

    it('should iterate over each element', () => {
        const matrix = new Matrix("1 2\n3 4");
        const elements = [];
        matrix.eachElement((value) => elements.push(value));
        expect(elements).toEqual([1, 2, 3, 4]);
    });

    it('should transform a vector', () => {
        const matrix = new Matrix("1 2\n3 4");
        const result = matrix.transform([1, 1]);
        expect(result).toEqual([3, 7]);
    });

    it('should multiply two matrices', () => {
        const a = new Matrix("1 2\n3 4");
        const b = new Matrix("2 0\n1 2");
        const result = a.Mult(b);
        expect(result[0]).toEqual([4, 4]);
        expect(result[1]).toEqual([10, 8]);
    });

    it('should create an identity matrix', () => {
        const identity = Matrix.prototype.Identity(3);
        expect(identity[0]).toEqual([1, 0, 0]);
        expect(identity[1]).toEqual([0, 1, 0]);
        expect(identity[2]).toEqual([0, 0, 1]);
    });

    it('should raise a matrix to a power', () => {
        const matrix = new Matrix("1 1\n1 0");
        const result = matrix.Pow(2);
        expect(result[0]).toEqual([2, 1]);
        expect(result[1]).toEqual([1, 1]);
    });

    it('should compute the Singular Value Decomposition (SVD)', () => {
        const matrix = new Matrix("1 0 0\n0 1 0\n0 0 1");
        const { U, S, V } = matrix.SVD();
        expect(U[0]).toEqual([1, 0, 0]);
        expect(U[1]).toEqual([0, 1, 0]);
        expect(U[2]).toEqual([0, 0, 1]);
        expect(S).toEqual([1, 1, 1]);
        expect(V[0]).toEqual([1, 0, 0]);
        expect(V[1]).toEqual([0, 1, 0]);
        expect(V[2]).toEqual([0, 0, 1]);
    });

    it('should compute the SVD for a non-square matrix', () => {
        const matrix = new Matrix("1 2 3\n4 5 6");
        const { U, S, V } = matrix.SVD();
        expect(U.length).toBe(2); // U should have 2 rows
        expect(V.length).toBe(3); // V should have 3 rows
        expect(S.length).toBe(2); // Singular values should match the smaller dimension
    });

    it('should rotate the matrix around a specified axis', () => {
        const matrix = new Matrix("1 0 0\n0 1 0\n0 0 1");
        const rotated = matrix.Rotate('z', Math.PI / 2);
        expect(rotated[0][0]).toBeCloseTo(0);
        expect(rotated[0][1]).toBeCloseTo(-1);
        expect(rotated[1][0]).toBeCloseTo(1);
        expect(rotated[1][1]).toBeCloseTo(0);
        expect(rotated[2][2]).toBeCloseTo(1);
    });
});
