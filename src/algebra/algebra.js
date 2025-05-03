const Algebra = {
    /**
     * Calculates the real roots of a quadratic equation ax² + bx + c = 0
     * Uses a numerically stable algorithm to avoid loss of significance
     * @param {number} a - The coefficient of x²
     * @param {number} b - The coefficient of x
     * @param {number} c - The constant term
     * @returns {number[]} Array containing the real roots (empty if no real roots exist, 2 roots if they are equal)
     */
    QuadraticRoots(a, b, c) {
        const discriminant = b ** 2 - 4 * a * c;

        if (discriminant < 0) {
            return [];
        }

        const sqrtDiscriminant = Math.sqrt(discriminant);
        let ret;

        if (b >= 0) {
            const x1 = (-b - sqrtDiscriminant) / (2 * a);
            const x2 = (2 * c) / (-b - sqrtDiscriminant);
            ret = [x1, x2];
        } else {
            const x1 = (2 * c) / (-b + sqrtDiscriminant);
            const x2 = (-b + sqrtDiscriminant) / (2 * a);
            ret = [x1, x2];
        }

        return ret.sort((a, b) => a - b);
    }
}

export {Algebra};

