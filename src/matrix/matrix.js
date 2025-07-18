/**
 * Represents a Matrix and provides functionality to initialize it.
 * 
 * @class Matrix
 * @param {number|string} m - If a string, it represents a matrix in textual form 
 *                            where rows are separated by newlines and values by spaces. 
 *                            If a number, it represents the number of rows in the matrix.
 * @param {number} [n] - The number of columns in the matrix. Required if `m` is a number.
 * 
 * @example
 * // Initialize a matrix from a string
 * const matrix = new Matrix("1 2 3\n4 5 6\n7 8 9");
 * 
 * @example
 * // Initialize a zero matrix with 3 rows and 4 columns
 * const matrix = new Matrix(3, 4);
 */

import { Vector } from './vector.js'

import SVD from './svd.js';

function matrixFromString(ret, str) {
    const lines = str.split("\n");
    lines.forEach(l => {
        l = l.trim();

        if (l.length) {
            const row = l.split(/\s+/).map(v => parseFloat(v));
            ret.push(row);
        }
    });
    ret.m = ret.length;
    ret.n = ret[0].length;
}

function matrixFromArrayOfVector(ret, arr) {
    const m = ret.m = arr[0].length;
    const n = ret.n = arr.length;

    for (let j = 0; j < m; j++) {
        ret.push(new Array(n).fill(0));
    }

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            ret[i][j] = arr[j][i];
        }
    }

}
function matrixFromArray(ret, arr) {
    if (arr[0] instanceof Vector) {
        return matrixFromArrayOfVector(ret, arr);
    } else {
        arr.forEach(row => {
            ret.push(row.slice());
        });
    }
    ret.m = arr.length;
    ret.n = arr[0].length;
}

function Matrix(m, n) {
    if (typeof m === 'string') {
        matrixFromString(this, m);
        return;
    }
    if (m instanceof Vector) {
        matrixFromArray(this, [m]);
        return;
    }
    
    if (Array.isArray(m)) {
        matrixFromArray(this, m);
        return;
    }

    this.m = m;
    this.n = n;
    for (let j = 0; j < m; j++) {
        this.push(new Array(n).fill(0));
    }
}

Matrix.prototype = [];

Matrix.prototype.eachRow = function (f) {
    for (let j = 0; j < this.m; j++) {
        f(this[j], j);
    }
}

Matrix.prototype.eachElement = function (f) {
    for (let i = 0; i < this.m; i++) {
        for (let j = 0; j < this.n; j++) {
            f(this[i][j], i, j, this);
        }
    }
}

Matrix.prototype.print = function () {
    this.eachRow(r => {
        console.log(r.join(' '));
    });
}

Matrix.prototype.transform = function (vec) {
    let i, j;
    let ret = new Array(vec.length).fill(0);
    for (j = 0; j < vec.length; j++) {
        for (i = 0; i < this.n; i++) {
            ret[j] += this[j][i] * vec[i];
        }
    }
    return ret;
}

function MultMatrixVector(M, v) {
    if (M.n !== v.length) {
        throw new Error(`Matrix columns must match vector length expected matrix n = ${M.n} but got ${v.length}`);
    }
    const result = new Array(M.m).fill(0);
    for (let i = 0; i < M.m; i++) {
        for (let j = 0; j < M.n; j++) {
            result[i] += M[i][j] * v[j];
        }
    }
    return result;
}

/* Multiplies the current matrix with another matrix or a vector.
 * 
 * If the input is a matrix, it performs matrix multiplication. If the input is a vector,
 * it performs matrix-vector multiplication.
 * 
 * @method Mult
 * @memberof Matrix
 * @param {Matrix|Array<number>} b - The matrix or vector to multiply with.
 * @returns {Matrix|Array<number>} The resulting matrix or vector after multiplication.
 * @throws {Error} If the dimensions of the matrix and vector do not align for multiplication.
 * 
 * @example
 * // Matrix multiplication
 * const A = new Matrix("1 2\n3 4");
 * const B = new Matrix("5 6\n7 8");
 * const result = A.Mult(B);
 * console.log(result);
 * 
 * @example
 * // Matrix-vector multiplication
 * const A = new Matrix("1 2\n3 4");
 * const v = [1, 2];
 * const result = A.Mult(v);
 * console.log(result);
 */
Matrix.prototype.Mult = function (b) {
    if (!(b instanceof Matrix)) {
        return MultMatrixVector(this, b);
    }
    const m = this.m;
    const n = this.n; // === b.m
    const p = b.n;
    let ret = new Matrix(m, p);
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < p; j++) {
            for (let k = 0; k < n; k++)
                ret[i][j] += this[i][k] * b[k][j];
        }
    }
    return ret;
}

Matrix.Identity = function (n) {
    const ret = new Matrix(n, n);
    ret.eachRow((r, i) => {
        r[i] = 1;
    });

    return ret;
}
Matrix.prototype.Identity = function (n) {
    if (n === undefined) {
        n = this.m;
    }
    return Matrix.Identity(n);
}
Matrix.prototype.Transpose = function () {
    const transposed = new Matrix(this.n, this.m);
    for (let i = 0; i < this.m; i++) {
        for (let j = 0; j < this.n; j++) {
            transposed[j][i] = this[i][j];
        }
    }
    return transposed;
}

Matrix.FromDiagonalArray = function (diagonal) {
    const ret = new Matrix(diagonal.length, diagonal.length);
    ret.eachRow((r, i) => {
        r[i] = diagonal[i];
    }
    );

    return ret;
}

Matrix.prototype.DiagonalArray = function () {
    let ret = [];
    for (let i = 0; i < Math.min(this.m, this.n); i++) {
        ret.push(this[i][i]);
    }

    return ret;
}

Matrix.prototype.Pow = function (n) {
    if (n === 0) return Matrix.identity(n);
    if (n === 1) return this;
    if (n % 2 === 0) {
        const m2 = this.Pow(n / 2);
        return m2.Mult(m2);
    }

    const m2 = this.Pow((n - 1) / 2);
    return m2.Mult(m2).Mult(this);
}


Matrix.prototype.Translate = function (opts) {
    const vec = opts.vec;
    const m = this.m;
    const n = this.n;
    const transform = Matrix.Identity(m);
    for (let i = 0; i < vec.length; i++) {
        transform[i][m - 1] = vec[i];
    }
    return transform.Mult(this);
}

const axesMap = {
    x: 0,
    y: 1,
    z: 2
};

/**
 * Rotates the matrix around a specified axis by a given angle.
 * 
 * @param {Object} opts - The rotation options
 * @param {string|number|array} opts.axes - The axis of rotation. Can be a string ('x', 'y', 'z'), 
 *                                     a number (0, 1, 2 corresponding to x, y, z respectively),
 *                                     or an array of two numbers representing the two axes 
 *                                     that define the plane of rotation.
 * @param {number} opts.angle - The angle of rotation in radians.
 * @returns {Matrix} A new matrix resulting from the rotation transformation.
 */
Matrix.prototype.Rotate = function (opts) {
    let axes = opts.axes;
    const angle = opts.angle;
    const center = opts.center || Array(this.n).fill(0);

    if (typeof axes === 'string') {
        axes = axesMap[axes.toLowerCase()];
    }
    if (typeof axes === 'number') {
        axes = [0, 1, 2].filter(i => i !== axes);
    }

    const toOrigin = this.Identity();
    for (let i = 0; i < this.n - 1; i++) {
        toOrigin[i][toOrigin.m - 1] = -center[i];
    }

    const rotation = this.Identity();
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    // Apply rotation
    rotation[axes[0]][axes[0]] = c;
    rotation[axes[0]][axes[1]] = -s;
    rotation[axes[1]][axes[0]] = s;
    rotation[axes[1]][axes[1]] = c;

    const fromOrigin = this.Identity();
    for (let i = 0; i < this.n - 1; i++) {
        fromOrigin[i][fromOrigin.m - 1] = center[i];
    }

    const rotationAboutCenter = fromOrigin.Mult(rotation).Mult(toOrigin);

    return rotationAboutCenter.Mult(this);
}

/*
* Computes the Singular Value Decomposition (SVD) of the matrix.
* The SVD decomposes the matrix into three components: U, S, and V, 
* where the original matrix can be represented as U * S * V^T.
* 
* @method SVD
* @memberof Matrix
* @returns {Object} An object containing the following properties:
* - `U` {Matrix}: The left singular vectors as a matrix.
* - `S` {Matrix}: The singular values as a rectangular diagonal matrix.
* - `V` {Matrix}: The right singular vectors as a matrix.
* 
* @example
* const matrix = new Matrix("1 2 3\n4 5 6\n7 8 9");
* const { U, S, V } = matrix.SVD();
* console.log("U:", U);
* console.log("S:", S);
* console.log("V:", V);
*/
Matrix.prototype.SVD = function () {
    const { q, u, v } = SVD(this);

    return { U: new Matrix(u), S: Matrix.FromDiagonalArray(q), V: new Matrix(v) };
}

/**
 * Solves the linear equation A * X = B using the Singular Value Decomposition (SVD).
 * 
 * Given the SVD decomposition of matrix A as U, S, and V (where A = U * S * V^T),
 * this method computes the solution vector X for the equation A * X = B.
 * 
 * @method SVDSolve
 * @memberof Matrix
 * @static
 * @param {Object} svd - The SVD decomposition of matrix A, as returned by `Matrix.prototype.SVD`.
 * @param {Array<number>} B - The right-hand side of the equation A * X = B
 * @returns {Array<number>} The solution vector X that satisfies A * X = B.
 * 
 * @example
 * const A = new Matrix("1 2 3\n4 5 6\n7 8 9");
 * const B = [1, 0, 0];
 * const svd = A.SVD();
 * const X = Matrix.SVDSolve(svd, B);
 * console.log("Solution X:", X);
 */
Matrix.SVDSolve = function (svd, B) {
    const { U, S, V } = svd;

    // Ensure S is treated as a rectangular diagonal matrix
    const minDim = Math.min(S.m, S.n);
    const S_inv = new Matrix(S.n, S.m); // Transpose dimensions for pseudo-inverse
    for (let i = 0; i < minDim; i++) {
        if (Math.abs(S[i][i]) > 1e-10) { // Avoid division by zero
            S_inv[i][i] = 1 / S[i][i];
        }
    }
    return V.Mult(S_inv).Mult(U.Transpose()).Mult(B);
};

/**
 * Solves the linear equation A * X = B using Singular Value Decomposition (SVD).
 * 
 * This method computes the solution vector X for the equation A * X = B by 
 * leveraging the SVD decomposition of the matrix A. It internally calls 
 * `Matrix.SVDSolve` to perform the computation.
 * 
 * @method Solve
 * @memberof Matrix
 * @param {Array<number>} B - The right-hand side of the equation A * X = B.
 * @returns {Array<number>} The solution vector X that satisfies A * X = B.
 * 
 * @example
 * const A = new Matrix("1 2 3\n4 5 6\n7 8 9");
 * const B = [1, 0, 0];
 * const X = A.Solve(B);
 * console.log("Solution X:", X);
 */
Matrix.prototype.Solve = function (B) {
    const svd = this.SVD();
    return Matrix.SVDSolve(svd, B);
}

Matrix.prototype.Transform = function (transformation) {
    let result = this;
    transformation.reverse().forEach(t => {
        switch (t.op) {
            case "Rotate":
                result = result.Rotate(t.args);
                break;
            case "Translate":
                result = result.Translate(t.args);
                break;
            default:
                throw new Error(`Unknown transformation operation: ${t.op}`);
        }
    });
    return result;
}

Matrix.prototype.Graphics = function () {
    if (this.m !== this.n) {
        throw new Error(`No graphics transformation possible when m (${this.m}) != n (${this.n})`);
    }
    if (this.n <= 1) {
        return this;
    }

    const T = this.Identity();
    T[1][1] = -1;

    return T.Mult(this).Mult(T);
}


Matrix.prototype.Graphics1 = function () {
    if (this.m !== this.n) {
        throw new Error(`No graphics transformation possible when m (${this.m}) != n (${this.n})`);
    }
    if (this.n <= 1) {
        return this;
    }

    const T = this.Identity();
    T[1][1] = -1;

    return this.Mult(T);
}

Matrix.prototype.det = function () {
    if (this.m !== this.n) {
        throw new Error("Matrix must be square to compute determinant");
    }
    if (this.m === 2) {
        return this[0][0] * this[1][1] - this[0][1] * this[1][0];
    }
    if (this.m === 3) {
        return this[0][0] * this[1][1] * this[2][2] +
            this[0][1] * this[1][2] * this[2][0] +
            this[0][2] * this[1][0] * this[2][1] -
            this[0][2] * this[1][1] * this[2][0] -
            this[0][0] * this[1][2] * this[2][1] -
            this[0][1] * this[1][0] * this[2][2];
    }
    throw new Error("Determinant not implemented for matrices larger than 3x3");
}

export { Matrix, Vector };