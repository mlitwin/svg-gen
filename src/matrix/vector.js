/**
 * @fileoverview
 * Defines a flexible n-dimensional Vector class with array-like behavior.
 * Supports construction from arrays, objects with x/y/z/w properties, or a dimension count.
 * Provides convenient x, y, z property accessors.
 */

const nameToIndex = {
    x: 0,
    y: 1,
    z: 2,
    w: 3
};

const indexToName = {
    0: 'x',
    1: 'y',
    2: 'z',
    3: 'w'
};

function dimensionFromObject(obj) {
    for(let i = nameToIndex.length - 1; i >= 0; i--) {
        const name = indexToName[i];
        if (obj[name] !== undefined) {
            return i + 1;
        }
    }
    return 0;
    
}

function arrayFromObject(obj) {
    const dim = dimensionFromObject(obj);
    const ret = [].fill(0, 0, dim);
    for (const [k, v] of Object.entries(obj)) {
        const index = nameToIndex[k];
        if (index !== undefined) {
            ret[index] = v;
        }
    }

    return ret;
}

function Vector(n) {
    if (!(this instanceof Vector)) {
        return new Vector(n);
    }
    if (Array.isArray(n)) {
        this.push(...n);
        return;
    }
    if (typeof n === 'object') {
        this.push(...arrayFromObject(n));
    } else {
        this.push(...new Array(n).fill(0));
    }
}

Vector.prototype = [];

Object.defineProperties(Vector.prototype, {
    x: {
        get() { return this[0]; },
        set(v) { this[0] = v; }
    },
    y: {
        get() { return this[1]; },
        set(v) { this[1] = v; }
    },
    z: {
        get() { return this[2]; },
        set(v) { this[2] = v; }
    }
});

export { Vector }