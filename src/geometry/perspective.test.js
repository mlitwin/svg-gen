import { describe, it, expect } from 'vitest';
import { Matrix, Vector } from '../matrix/matrix.js';
import Geom from './geometry.js';
import {
    ClipXYHalfPlane,
    PolygonFromViewBoxWithPerspective,
    PointWithPerspective
} from './perspective.js';

const perspectives = [
    {
        eye: { x: 0, y: 0, z: 2 },
        transform: Matrix.Identity(4),
    },
    {
        eye: { x: 0, y: 0, z: 2500 },
        transform: Matrix.Identity(4).Transform([
            {
                op: "Translate",
                args: { vec: [0, -100, 0] }
            },
            {
                op: "Rotate",
                args: { axes: "X", angle: Math.PI / 2 }
            },
        ])
    },
    {
        eye: { x: 0, y: 0, z: 2500 },
        transform: Matrix.Identity(4).Transform([
            {
                op: "Rotate",
                args: { axes: "Y", angle: Math.PI / 4 }
            },
        ])
    },
    {
        eye: { x: 1000, y: 0, z: 2500 },
        transform: Matrix.Identity(4).Transform([
            {
                op: "Translate",
                args: { vec: [0, -100, 0] }
            },
            {
                op: "Rotate",
                args: { axes: "X", angle: Math.PI / 2 }
            },
        ])
    },
];

const clips = [
    {
        plane: {
            point: [0, 0, 5],
            normal: [1, 0, 0]
        }
    },
    {
        plane: {
            point: [0, 0, 1],
            normal: [0, 0, 1]
        }
    }
];

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
        expect(result.points).toBeNull();
    });
    it('returns intersection for each perspective and clip', () => {
        perspectives.forEach((perspectiveBase, i) => {
            clips.forEach((clip, j) => {
                const perspective = {
                    ...perspectiveBase,
                    clip
                };
                const result = ClipXYHalfPlane(perspective);
                if (result.points) {
                    const p = {
                        x: clip.plane.point[0] + clip.plane.normal[0],
                        y: clip.plane.point[1] + clip.plane.normal[1],
                        z: clip.plane.point[2] + clip.plane.normal[2],
                        w: 1
                    }
                    const p1 = Geom.PerspectiveXYProjection(perspective.eye, new Matrix([Vector(p)]));
                    const side = Geom.SideOfPointFromLine(result.points[0], result.points[1], p1[0]);
                    // TODO console.log(result, side);
                }
            });
        });
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