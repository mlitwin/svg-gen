import { describe, it, expect } from 'vitest';
import { Matrix, Vector } from '../matrix/matrix.js';
import {
    ClipXYHalfPlane,
    PolygonFromViewBoxWithPerspective,
    PointWithPerspective
} from './perspective.js';

// Minimal Geom implementation for test (since no mocks allowed, but Geom is imported in perspective.js)
// We'll use basic stubs for Geom methods, but since the user said "no mocks", we assume the real Geom is present in the environment.

describe('ClipXYHalfPlane', () => {
    const identity = new Matrix([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ]);

    const perspective = {
        eye: { x: 0, y: 0, z: 10 },
        transform: identity,
        clip: {
            plane: {
                point: [0, 0, 5],
                normal: [1, 0, 0]
            }
        }
    };

    it('returns points and side for a simple XY plane intersection', () => {
        const result = ClipXYHalfPlane(perspective);
        expect(result).toBeTruthy();
        expect(result.points).toHaveLength(2);
        expect(typeof result.side).toBe('number');
    });

    it('returns null if planes are parallel (no intersection)', () => {
        const noIntersectPerspective = {
            ...perspective,
            clip: {
                plane: {
                    point: [0, 0, 1],
                    normal: [0, 0, 1]
                }
            }
        };
        // The XY plane after transform is also z=0, so intersection is undefined (should return null)
        const result = ClipXYHalfPlane(noIntersectPerspective);
        expect(result).toBeNull();
    });
});


describe('PolygonFromViewBoxWithPerspective', () => {
    const identity = new Matrix([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ]);
    const perspective = {
        eye: { x: 0, y: 0, z: 10 },
        transform: identity,
        clip: {
            plane: {
                point: [0, 0, 5],
                normal: [1, 0, 0]
            }
        }
    };
    const viewBox = { x: -10, y: -10, width: 20, height: 20 };

    it('returns a polygon array when clipping is possible', () => {
        const result = PolygonFromViewBoxWithPerspective(viewBox, perspective);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
        expect(result[0]).toHaveProperty('x');
        expect(result[0]).toHaveProperty('y');
    });

    it('returns null if no clip plane', () => {
        const result = PolygonFromViewBoxWithPerspective(viewBox, { ...perspective, clip: {} });
        expect(result).toBeNull();
    });
});

describe('PointWithPerspective', () => {
    const identity = new Matrix([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ]);
    const eye = { x: 0, y: 0, z: 10 };

    it('projects a point with identity transform', () => {
        const pt = PointWithPerspective(1, 2, eye, identity);
        expect(pt).toHaveProperty('x');
        expect(pt).toHaveProperty('y');
    });

    it('throws if transform is not 4x4', () => {
        const badMatrix = new Matrix([
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ]);
        expect(() => PointWithPerspective(1, 2, eye, badMatrix)).toThrow();
    });
});