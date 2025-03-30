import { describe, it, expect, beforeAll } from 'vitest';
import { Matrix } from './matrix.js';

// Add custom matchers

function toBeCloseToMatrix(received, expected, precision = 2) {
    if (!(received instanceof Matrix) || !(expected instanceof Matrix)) {
        return {
            pass: false,
            message: () => `Expected both arguments to be instances of Matrix.`,
        };
    }
    if (received.m !== expected.m || received.n !== expected.n) {
        return {
            pass: false,
            message: () => `Matrix dimensions do not match. Received (${received.m}, ${received.n}), expected (${expected.m}, ${expected.n}).`,
        };
    }
    for (let i = 0; i < received.m; i++) {
        for (let j = 0; j < received.n; j++) {
            if (Math.abs(received[i][j] - expected[i][j]) > Math.pow(10, -precision)) {
                return {
                    pass: false,
                    message: () =>
                        `Matrix values differ at (${i}, ${j}). Received ${received[i][j]}, expected ${expected[i][j]} within precision ${precision}.`,
                };
            }
        }
    }
    return {
        pass: true,
        message: () => `Matrices are close to each other within precision ${precision}.`,
    };
}

beforeAll(() => {
    expect.extend({

        toBeSVD(received) {
            const {U, S, V} = received;
            if (!U || !S || !V) {
                return {
                    pass: false,
                    message: () => `Expected received to be a valid SVD object with U, S, and V matrices.`,
                };
            }
    
            const isSRectangularDiagonal = S.every((row, i) =>
                row.every((value, j) => (i === j ? value >= 0 : value === 0))
            );
            if (!isSRectangularDiagonal) {
                return {
                    pass: false,
                    message: () => `Matrix S is not a valid rectangular diagonal matrix.`,
                };
            }
            return {
                pass: true,
                message: () => `Received is a valid SVD object.`,
            };
         },

        toBeCloseToSVDFor(received, expected, precision = 2) {
            if (!received || !received.U || !received.S || !received.V) {
                return {
                    pass: false,
                    message: () => `Expected received to be a valid SVD object with U, S, and V matrices.`,
                };
            }
            if (!(expected instanceof Matrix)) {
                return {
                    pass: false,
                    message: () => `Expected argument should be an instance of Matrix.`,
                };
            }

            const { U, S, V } = received;
            const reconstructed = U.Mult(S).Mult(V.Transpose());
            if (!toBeCloseToMatrix(reconstructed, expected, precision).pass) {
                return {
                    pass: false,
                    message: () => `SVD reconstruction differs from the expected matrix.`,
                };
            }

            return {
                pass: true,
                message: `SVD reconstruction is close to the expected matrix within precision ${precision}.`
            };
        },

        toBeCloseToMatrix(received, expected, precision = 2) {
           return toBeCloseToMatrix(received, expected, precision);
        },

        toBeCloseToArray(received, expected, precision = 2) {
            if (!Array.isArray(received) || !Array.isArray(expected)) {
                return {
                    pass: false,
                    message: () => `Expected both arguments to be arrays.`,
                };
            }
            if (received.length !== expected.length) {
                return {
                    pass: false,
                    message: () => `Array lengths do not match. Received length ${received.length}, expected length ${expected.length}.`,
                };
            }
            for (let i = 0; i < received.length; i++) {
                if (Math.abs(received[i] - expected[i]) > Math.pow(10, -precision)) {
                    return {
                        pass: false,
                        message: () =>
                            `Array values differ at index ${i}. Received ${received[i]}, expected ${expected[i]} within precision ${precision}.`,
                    };
                }
            }
            return {
                pass: true,
                message: () => `Arrays are close to each other within precision ${precision}.`,
            };
        },
    });
});

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

    it('should multiply a matrix and a vector', () => {
        const a = new Matrix("1 2\n3 4");
        const b = [2, 0];
        const result = a.Mult(b);
        expect(result).toEqual([2, 6]);

    });



    it('should create an identity matrix', () => {
        const identity = Matrix.Identity(3);
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

    it('should rotate the matrix around a specified axis', () => {
        const matrix = new Matrix("1 0 0\n0 1 0\n0 0 1");
        const rotated = matrix.Rotate({ axes: 'z', angle: Math.PI / 2 });
        expect(rotated[0][0]).toBeCloseTo(0);
        expect(rotated[0][1]).toBeCloseTo(-1);
        expect(rotated[1][0]).toBeCloseTo(1);
        expect(rotated[1][1]).toBeCloseTo(0);
        expect(rotated[2][2]).toBeCloseTo(1);
    });

    it('should apply a series of transformations', () => {
        const matrix = new Matrix("1 0 0 0\n0 1 0 0\n0 0 1 0\n0 0 0 1");
        const dz = 5;
        const transformed = matrix.Transform([
            { op: "Rotate", args: { axes: "z", angle: Math.PI / 2 } },
            { op: "Translate", args: { vec: [0, 0, -dz] } }
        ]);

        // Check rotation
        expect(transformed[0][0]).toBeCloseTo(0);
        expect(transformed[0][1]).toBeCloseTo(-1);
        expect(transformed[1][0]).toBeCloseTo(1);
        expect(transformed[1][1]).toBeCloseTo(0);

        // Check translation
        expect(transformed[2][3]).toBeCloseTo(-dz);
        expect(transformed[3][3]).toBeCloseTo(1);
    });


    it('should compute the Singular Value Decomposition (SVD)', () => {
        const A = new Matrix("1 0 0\n0 1 0\n0 0 1");
        const svd = A.SVD();

        expect(svd).toBeSVD();
        expect(svd).toBeCloseToSVDFor(A, 3);

    
    });

 
    it('should compute the SVD for a non-square matrix', () => {
        const A = new Matrix("1 2 3\n4 5 6\n4 7 6 \n4 5 22");
        const svd = A.SVD();

        expect(svd).toBeSVD();
        expect(svd).toBeCloseToSVDFor(A, 3);
    });


      



    it('should solve a linear equation using SVD', () => {
        const A = new Matrix("4 2 1\n2 5 3\n1 3 6"); 
        const B = [1, 2, 3];
        const svd = A.SVD();
        expect(svd).toBeSVD();
        expect(svd).toBeCloseToSVDFor(A, 3);

        const X = Matrix.SVDSolve(svd, B);

        // Verify the solution satisfies A * X = B
        const result = A.Mult(X);
        expect(result).toBeCloseToArray(B, 3);
    });


    it('should solve an overdetermined linear equation using SVD', () => {
        const A = new Matrix("4 2 1\n2 5 3\n1 3 6\n1 3 6\n1 3 6");
        const B = [1, 1, 1, 1, 1];
        const svd = A.SVD();
        expect(svd).toBeSVD();
        expect(svd).toBeCloseToSVDFor(A, 3);
        const X = Matrix.SVDSolve(svd, B);

        // Verify the solution satisfies A * X = B
        const result = A.Mult(X);

        expect(result).toBeCloseToArray(B, 3);
    });


    it('should compute the SVD for a larger matrix', () => {
        const A = new Matrix("1 4 2 1 2\n4 9 6 2 3\n9 49 21 3 7\n16 100 40 4 10\n25 121 55 5 11");
        const svd = A.SVD();
        expect(svd).toBeSVD();

        expect(svd).toBeCloseToSVDFor(A, 3);
    });
   
    
    it('should compute the SVD for a larger matrix and apply it to a vector', () => {
        const A = new Matrix("1 4 2 1 2\n4 9 6 2 3\n9 49 21 3 7\n16 100 40 4 10\n25 121 55 5 11");
        const B = [1, 1, 1, 1, 1];
        const svd = A.SVD();
        expect(svd).toBeSVD();
        expect(svd).toBeCloseToSVDFor(A, 3);

        const X = Matrix.SVDSolve(svd, B);
        console.log(svd, X, B);
        const result = A.Mult(X);
        expect(result).toBeCloseToArray(B, 3);

    });
});
