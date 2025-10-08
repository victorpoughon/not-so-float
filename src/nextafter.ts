// Reuse a global buffer to avoid allocations
const buffer = new ArrayBuffer(8);
const floatView = new Float64Array(buffer);
const intView = new BigUint64Array(buffer);

// Implementation of the C function nextafter(x, Infinity)
export function next(x: number): number {
    if (x === Infinity) return x;
    if (x === 0) return Number.MIN_VALUE;

    floatView[0] = x;
    let bits: bigint = intView[0];

    if (x > 0) {
        bits += 1n;
    } else {
        bits -= 1n;
    }

    intView[0] = bits;
    return floatView[0];
}

// Implementation of the C function nextafter(x, -Infinity)
export function prev(x: number): number {
    if (x === -Infinity) return x;
    if (x === 0) return -Number.MIN_VALUE;

    floatView[0] = x;
    let bits: bigint = intView[0];

    if (x < 0) {
        bits += 1n;
    } else {
        bits -= 1n;
    }

    intView[0] = bits;
    return floatView[0];
}
