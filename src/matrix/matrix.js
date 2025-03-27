function Matrix(m, n) {
    if (typeof m === 'string') {

        const lines = m.split("\n");
        lines.forEach(l => {
            l = l.trim();

            if (l.length) {
                const row = l.split(/\s+/).map(v => parseFloat(v));
                this.push(row);
            }
        });
        this.m = this.length;
        this.n = this[0].length;
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

Matrix.prototype.Mult = function (b) {
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

Matrix.prototype.Identity = function (n) {
    let ret = new Matrix(n, n);
    ret.eachRow((r, i) => {
        r[i] = 1;
    });

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

Matrix.prototype.SVD = function () {
    const eps = 1e-10; // Convergence threshold
    const maxIterations = 100; // Maximum number of iterations

    const m = this.m;
    const n = this.n;

    // Initialize U, S, and V matrices
    let U = this.Identity(m);
    let S = new Matrix(m, n);
    let V = this.Identity(n);

    // Copy this matrix into S
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            S[i][j] = this[i][j];
        }
    }

    // Jacobi method for SVD
    for (let iter = 0; iter < maxIterations; iter++) {
        let maxOffDiagonal = 0;
        let p = 0, q = 0;

        // Find the largest off-diagonal element in S
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < m; j++) {
                if (Math.abs(S[i][j]) > maxOffDiagonal) {
                    maxOffDiagonal = Math.abs(S[i][j]);
                    p = i;
                    q = j;
                }
            }
        }

        // Check for convergence
        if (maxOffDiagonal < eps) break;

        // Compute Jacobi rotation
        const theta = 0.5 * Math.atan2(2 * S[p][q], S[q][q] - S[p][p]);
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);

        // Update S matrix
        for (let i = 0; i < m; i++) {
            const Sp = cos * S[i][p] - sin * S[i][q];
            const Sq = sin * S[i][p] + cos * S[i][q];
            S[i][p] = Sp;
            S[i][q] = Sq;
        }

        for (let i = 0; i < n; i++) {
            const Sp = cos * S[p][i] - sin * S[q][i];
            const Sq = sin * S[p][i] + cos * S[q][i];
            S[p][i] = Sp;
            S[q][i] = Sq;
        }

        // Update U matrix
        for (let i = 0; i < m; i++) {
            const Up = cos * U[i][p] - sin * U[i][q];
            const Uq = sin * U[i][p] + cos * U[i][q];
            U[i][p] = Up;
            U[i][q] = Uq;
        }

        // Update V matrix
        for (let i = 0; i < n; i++) {
            const Vp = cos * V[i][p] - sin * V[i][q];
            const Vq = sin * V[i][p] + cos * V[i][q];
            V[i][p] = Vp;
            V[i][q] = Vq;
        }
    }

    // Return U, S, and V matrices
    return { U, S: S.DiagonalArray(), V };
}

export { Matrix };