/**
 * @file ellipse.js
 * @description This module provides a `Ellipse` object that serves as a container 
 * for various geometry-related functions.
 * 
 * @module ellipse
 */

import { Matrix, Vector } from '../matrix/matrix.js';
import { Algebra } from '../algebra/algebra.js';
import Geom from './geometry.js';
import { PointWithPerspective } from './perspective.js';

const Ellipse = {
    /**
     * Computes the coefficients of a general ellipse in the x-y plane
     * from an array of points.
     * 
     * @param {Array<{x: number, y: number}>} points - An array of points with x and y coordinates.
     * @returns {Object<A: number, B: number, C: number, D: number, E: number>} The coefficients of the general ellipse equation Ax^2 + Bxy + Cy^2 + Dx + Ey = 1.
     */
    EllipseFromPoints(points) {
        const matrixRows = points.map(({ x, y }) => [x ** 2, x * y, y ** 2, x, y]);
        const matrix = new Matrix(matrixRows);
        const svd = matrix.SVD();
        const solution = Matrix.SVDSolve(svd, Array(matrixRows.length).fill(1));

        return { A: solution[0], B: solution[1], C: solution[2], D: solution[3], E: solution[4] };
    },
    /**
     * Converts the coefficients of a general conic equation into the standard form of an ellipse.
     * 
     * The general conic equation is represented as:
     * Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0
     * 
     * This function calculates the center (h, k), semi-major axis, semi-minor axis, and other parameters
     * of the ellipse in standard form.
     * 
     * @param {Object} coefficients - The coefficients of the general conic equation.
     * @param {number} coefficients.A - The coefficient of x^2.
     * @param {number} coefficients.B - The coefficient of xy.
     * @param {number} coefficients.C - The coefficient of y^2.
     * @param {number} coefficients.D - The coefficient of x.
     * @param {number} coefficients.E - The coefficient of y.
     * @returns {Object} An object containing the parameters of the ellipse in standard form.
     * @returns {number} return.cx - The x-coordinate of the center of the ellipse.
     * @returns {number} return.cy - The y-coordinate of the center of the ellipse.
     * @returns {number} return.rx - The semi-major axis of the ellipse.
     * @returns {number} return.ry - The semi-minor axis of the ellipse.
     * @returns {number} return.theta - The rotation angle of the ellipse.
     */
    EllipseStandardForm(coefficients) {
        // https://en.wikipedia.org/wiki/Conic_section#Conversion_to_canonical_form
        const { A, B, C, D, E } = coefficients;
        const F = -1; // The general conic equation is assumed to be normalized such that F = -1.

        const AQ = new Matrix([
            [A, B / 2, D / 2],
            [B / 2, C, E / 2],
            [D / 2, E / 2, F]
        ]);

        const A33 = new Matrix([
            [A, B / 2],
            [B / 2, C]
        ]);

        const d0 = B ** 2 - 4 * A * C;

        const b = (A + C);
        const c = A * C - (B / 2) ** 2;


        const [l1, l2] = Algebra.QuadraticRoots(1, -b, c, true);

        const x0 = (2 * C * D - B * E) / d0;
        const y0 = (2 * A * E - B * D) / d0;

        const theta = 0.5 * Math.atan2(-B, C - A);


        const K = - (AQ.det() / A33.det());

        const rx = Math.sqrt(K / l1);
        const ry = Math.sqrt(K / l2);

        return { cx: x0, cy: y0, rx, ry, theta };
    },
    /**
     * Generates an ellipse in the xy plane via perspective projection from the given
     *  ellipse defined by an affine transform of an ellipse defined in the xy plane.
     *
     * @param {number} cx - The x-coordinate of the center of the ellipse.
     * @param {number} cy - The y-coordinate of the center of the ellipse.
     * @param {number} rx - The radius of the ellipse along the x-axis.
     * @param {number} ry - The radius of the ellipse along the y-axis.
     * @param {Array<number>} eye - The coordinates of the eye point for perspective projection [x, y, z].
     * @param {Matrix} transform - A transformation matrix to apply to the ellipse points.
     * @returns {Object} An object representing the ellipse in standard form after perspective transformation.
     */
    EllipseWithPerspective(cx, cy, rx, ry, eye, transform) {

        if (transform.m !== 4 || transform.n !== 4) {
            throw new Error("Transform matrix must be 4x4.");
        }

        const points = new Matrix(Array.from({ length: 8 }, (_, i) => {
            const angle = (i * 2 * Math.PI) / 8;
            return Vector([cx + rx * Math.cos(angle), cy + ry * Math.sin(angle), 0, 1]);

        }));

        const transformed = transform.Mult(points);

        const perspectivePoints = Geom.PerspectiveXYProjection(eye, transformed);
        const line = Geom.SegmentFromPoints(perspectivePoints);


        const standard = Ellipse.EllipseFromPoints(perspectivePoints);
        const ellipse = Ellipse.EllipseStandardForm(standard);

        return { ellipse, line, perspectivePoints };
    },
    // https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes


    /**
     * Converts SVG arc endpoint parameterization to center parameterization.
     * See: https://www.w3.org/TR/SVG/implnote.html#ArcConversionEndpointToCenter
     * 
     * @param {number} x1 - Start point x
     * @param {number} y1 - Start point y
     * @param {number} rx - Ellipse x radius
     * @param {number} ry - Ellipse y radius
     * @param {number} phi - Ellipse x-axis rotation (in radians)
     * @param {number} fa - Large arc flag (0 or 1)
     * @param {number} fs - Sweep flag (0 or 1)
     * @param {number} x2 - End point x
     * @param {number} y2 - End point y
     * @returns {Object} { cx, cy, rx, ry, phi, theta1, deltaTheta }
     */
    arcEndpointToCenterParameters(x1, y1, rx, ry, phi, fa, fs, x2, y2) {
        // Step 1: Compute (x1', y1')
        const cosPhi = Math.cos(phi);
        const sinPhi = Math.sin(phi);

        const dx = (x1 - x2) / 2;
        const dy = (y1 - y2) / 2;

        const x1p = cosPhi * dx + sinPhi * dy;
        const y1p = -sinPhi * dx + cosPhi * dy;


        // Step 2: Correct radii
        let rx_sq = rx * rx;
        let ry_sq = ry * ry;
        let x1p_sq = x1p * x1p;
        let y1p_sq = y1p * y1p;

        // Ensure radii are large enough

        let lambda = (x1p_sq) / rx_sq + (y1p_sq) / ry_sq;
        if (lambda > 1) {
            const scale = Math.sqrt(lambda);
            rx *= scale;
            ry *= scale;
            rx_sq = rx * rx;
            ry_sq = ry * ry;
        }

        // Step 3: Compute (cx', cy')
        let sign = (fa === fs) ? -1 : 1;
        let sq = ((rx_sq * ry_sq) - (rx_sq * y1p_sq) - (ry_sq * x1p_sq)) /
            ((rx_sq * y1p_sq) + (ry_sq * x1p_sq));

        sq = sq < 0 ? 0 : sq;
        const coef = sign * Math.sqrt(sq);

        const cxp = coef * ((rx * y1p) / ry);
        const cyp = coef * (-(ry * x1p) / rx);

        // Step 4: Compute (cx, cy)
        const cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2;
        const cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2;

        // Step 5: Compute angles
        function vectorAngle(ux, uy, vx, vy) {
            const dot = ux * vx + uy * vy;
            const len = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy));
            let ang = Math.acos(Math.max(-1, Math.min(1, dot / len)));
            if (ux * vy - uy * vx < 0) ang = -ang;
            return ang;
        }

        const v1x = (x1p - cxp) / rx;
        const v1y = (y1p - cyp) / ry;
        const v2x = (-x1p - cxp) / rx;
        const v2y = (-y1p - cyp) / ry;

        let theta1 = vectorAngle(1, 0, v1x, v1y);
        let deltaTheta = vectorAngle(v1x, v1y, v2x, v2y);

        if (!fs && deltaTheta > 0) {
            deltaTheta -= 2 * Math.PI;
        } else if (fs && deltaTheta < 0) {
            deltaTheta += 2 * Math.PI;
        }

        theta1 = theta1 % (2 * Math.PI);
        deltaTheta = deltaTheta % (2 * Math.PI);

        return {
            cx,
            cy,
            rx,
            ry,
            phi,
            theta1,
            deltaTheta
        };
    },
    /**
     * Converts SVG arc center parameterization to endpoint parameterization.
     * See: https://www.w3.org/TR/SVG/implnote.html#ArcConversionCenterToEndpoint
     * 
     * @param {number} cx - Center x
     * @param {number} cy - Center y
     * @param {number} rx - Ellipse x radius
     * @param {number} ry - Ellipse y radius
     * @param {number} phi - Ellipse x-axis rotation (in radians)
     * @param {number} theta1 - Start angle (in radians)
     * @param {number} deltaTheta - Sweep angle (in radians)
     * @returns {Object} { x1, y1, x2, y2, fa, fs }
     */
    arcCenterToEndpointParameters(cx, cy, rx, ry, phi, theta1, deltaTheta) {
        // Step 1: Compute (x1', y1') and (x2', y2')
        const cosPhi = Math.cos(phi);
        const sinPhi = Math.sin(phi);

        const x1p = rx * Math.cos(theta1);
        const y1p = ry * Math.sin(theta1);

        const x2p = rx * Math.cos(theta1 + deltaTheta);
        const y2p = ry * Math.sin(theta1 + deltaTheta);

        // Step 2: Compute (x1, y1) and (x2, y2)
        const x1 = cosPhi * x1p - sinPhi * y1p + cx;
        const y1 = sinPhi * x1p + cosPhi * y1p + cy;

        const x2 = cosPhi * x2p - sinPhi * y2p + cx;
        const y2 = sinPhi * x2p + cosPhi * y2p + cy;

        // Step 3: Compute flags
        const fa = Math.abs(deltaTheta) > Math.PI ? 1 : 0;
        const fs = deltaTheta >= 0 ? 1 : 0;

        return {
            x1,
            y1,
            x2,
            y2,
            fa,
            fs
        };
    },
    ArcWithPerspective(cur, av, perspective) {
        const [rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y] = av;
        const el = Ellipse.arcEndpointToCenterParameters(cur.x, cur.y, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y);
        const ret = {}

        const { ellipse, line } = Ellipse.EllipseWithPerspective(el.cx, el.cy, el.rx, el.ry, perspective.eye, perspective.transform);

        { // Debugging instrumentation
            ret._ellipse = ellipse;
        }
        
        const pt0 = PointWithPerspective(cur.x, cur.y, perspective.eye, perspective.transform);
        const pt1 = PointWithPerspective(x, y, perspective.eye, perspective.transform);

        if (line.errorSize < 0.99) {
            ret.line = {p0,p1};

            return ret;
        }


        const w0 = {
            x: (pt0.x - el.cx) / el.rx,
            y: (pt0.y - el.cy) / el.ry,
        }
        const w1 = {
            x: (pt1.x - el.cx) / el.rx,
            y: (pt1.y - el.cy) / el.ry,
        }

        // Sweep is in -y SVG coords?
        const theta0 = Math.atan2(w0.y, w0.x);
        const theta1 = Math.atan2(w1.y, w1.x); // Can't explain the - here. TODO
        const deltaTheta = (theta1 - theta0);

        const newArc = Ellipse.arcCenterToEndpointParameters(ellipse.cx, ellipse.cy, ellipse.rx, ellipse.ry, ellipse.theta, theta0, deltaTheta);

        av[0] = ellipse.rx;
        av[1] = ellipse.ry;
        av[2] = -ellipse.theta * (180 / Math.PI);
        av[3] = newArc.fa;
        av[4] = newArc.fs;
        av[5] = pt1.x;
        av[6] = pt1.y;

        ret.arc = av

        return ret;
    }
};

export default Ellipse;
