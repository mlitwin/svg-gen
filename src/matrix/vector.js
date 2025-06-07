
function arrayFromObject(obj) {
    const ret = [];
    if (obj.x) {
        ret.push(obj.x);
    }
    if (obj.y) {
        ret.push(obj.y);
    }
    if (obj.z) {
        ret.push(obj.z);
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