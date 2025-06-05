/*

    M = moveto (move from one point to another point)
    L = lineto (create a line)
    H = horizontal lineto (create a horizontal line)
    V = vertical lineto (create a vertical line)
    C = curveto (create a curve)
    S = smooth curveto (create a smooth curve)
    Q = quadratic Bézier curve (create a quadratic Bézier curve)
    T = smooth quadratic Bézier curveto (create a smooth quadratic Bézier curve)
    A = elliptical Arc (create a elliptical arc)
    Z = closepath (close the path)

*/
function svgPathDStringFromArray(value) {
    const commands = value.map(v => {
        return v.op + v.args.join(" ");
    });

    return commands.join(" ");
}

function svgPathDArrayFromString(value) {
    const commands = [];
    const regex = /([a-zA-Z])([^a-zA-Z]*)/g;
    let match;
    while ((match = regex.exec(value)) !== null) {
        const op = match[1];
        const args = match[2]
            .trim()
            .replace(/(\d)-/g, "$1 -") // separate negative numbers
            .replace(/,/g, " ")
            .split(/\s+/)
            .filter(Boolean)
            .map(Number);
        commands.push({ op, args });
    }
    return commands;
}

function walkSVGPathDArray(value, callback) {
    const cur = { x: 0, y: 0 };
    let subpathStart = { x: 0, y: 0 };
    for (const command of value) {
        const { op, args } = command;
        let isRelative = (op === op.toLowerCase());
        const next = {...cur}
        const absoluteArgs = [...args]
;
        switch (op) {
            case 'M':
            case 'm':
                absoluteArgs[0] = next.x = isRelative ? cur.x + args[0] : args[0];
                absoluteArgs[1]  = next.y = isRelative ? cur.y + args[1] : args[1];
                break;
            case 'L':
            case 'l':
                absoluteArgs[0] = next.x = isRelative ? cur.x + args[0] : args[0];
                absoluteArgs[1]  = next.y = isRelative ? cur.y + args[1] : args[1];
                break;
            case 'H':
            case 'h':
                absoluteArgs[0] = next.x = isRelative ? cur.x + args[0] : args[0];
                break;
            case 'V':
            case 'v':
                absoluteArgs[0] = next.y = isRelative ? cur.y + args[0] : args[0];
                break;
            case 'C':
            case 'c':
                absoluteArgs[4] = next.x = isRelative ? cur.x + args[4] : args[4];
                absoluteArgs[5] = next.y = isRelative ? cur.y + args[5] : args[5];
                break;
            case 'S':
            case 's':
                absoluteArgs[2] = next.x = isRelative ? cur.x + args[2] : args[2];
                absoluteArgs[3] = next.y = isRelative ? cur.y + args[3] : args[3];
                break;
            case 'Q':
            case 'q':
                absoluteArgs[2] = next.x = isRelative ? cur.x + args[2] : args[2];
                absoluteArgs[3] = next.y = isRelative ? cur.y + args[3] : args[3];
                break;
            case 'T':
            case 't':
                absoluteArgs[0] = next.x = isRelative ? cur.x + args[0] : args[0];
                absoluteArgs[1] = next.y = isRelative ? cur.y + args[1] : args[1];
                break;
            case 'A':
            case 'a':
                absoluteArgs[5] = next.x = isRelative ? cur.x + args[5] : args[5];
                absoluteArgs[6] = next.y = isRelative ? cur.y + args[6] : args[6];
                break;
            case 'Z':
            case 'z':
                next.x = subpathStart.x;
                next.y = subpathStart.y;
                break;
            default:
                break;
        }
        callback(op, args, absoluteArgs, { ...cur });
        cur.x = next.x;
        cur.y = next.y;
    }
}

export { svgPathDArrayFromString, svgPathDStringFromArray, walkSVGPathDArray };