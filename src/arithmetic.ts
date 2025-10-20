import { Interval, FULL, inter, typeCheckIsInterval } from "./interval.ts";
import {
    Union,
    union,
    typeCheckIsUnion,
    makeBinaryOpUnion,
    makeBinaryOpEither,
    EMPTY,
} from "./union.ts";
import { prev, next } from "./nextafter.ts";

// Addition in the context of an interval bound
function leftAdd(a: number, b: number): number {
    if (a === 0) {
        return b;
    } else if (b === 0) {
        return a;
    }
    return prev(a + b);
}

function rightAdd(a: number, b: number): number {
    if (a === 0) {
        return b;
    } else if (b === 0) {
        return a;
    }
    return next(a + b);
}

// Interval addition
export function iadd(x: Interval, y: Interval): Union {
    typeCheckIsInterval(x);
    typeCheckIsInterval(y);
    return new Union([new Interval(leftAdd(x.lo, y.lo), rightAdd(x.hi, y.hi))]);
}

export function ineg(x: Interval): Interval {
    typeCheckIsInterval(x);
    return new Interval(-x.hi, -x.lo);
}

// Interval subtraction
export function isub(x: Interval, y: Interval): Union {
    return iadd(x, ineg(y));
}

// Multiplication in the context of an interval bound
// These two functions are needed over simply called prev(a*b) or next(a*b) for
// two reasons:
// 1. Multiplying by zero yields zero, even when the other term is an infinity
// 2. Multiplying by zero yields exactly zero, not prev(0) or next(0)
export function leftMul(a: number, b: number): number {
    if (a === 0 || b === 0) {
        return 0;
    }
    return prev(a * b);
}

export function rightMul(a: number, b: number): number {
    if (a === 0 || b === 0) {
        return 0;
    }
    return next(a * b);
}

// Interval multiplication
export function imul(x: Interval, y: Interval): Union {
    typeCheckIsInterval(x);
    typeCheckIsInterval(y);

    const [a, b] = [x.lo, x.hi];
    const [c, d] = [y.lo, y.hi];

    if (b < 0) {
        if (d < 0) {
            return new Union([new Interval(leftMul(b, d), rightMul(a, c))]); // N1 * N1
        } else if (c > 0) {
            return new Union([new Interval(leftMul(a, d), rightMul(b, c))]); // N1 * P1
        } else {
            return new Union([new Interval(leftMul(a, d), rightMul(a, c))]); // N1 * (M | P0 | N0)
        }
    } else if (a > 0) {
        if (d < 0) {
            return new Union([new Interval(leftMul(b, c), rightMul(a, d))]); // P1 * N1
        } else if (c > 0) {
            return new Union([new Interval(leftMul(a, c), rightMul(b, d))]); // P1 * P1
        } else {
            return new Union([new Interval(leftMul(b, c), rightMul(b, d))]); // P1 * (M | P0 | N0)
        }
    } else {
        if (d < 0) {
            return new Union([new Interval(leftMul(b, c), rightMul(a, c))]); // (M | P0 | N0) * N1
        } else if (c > 0) {
            return new Union([new Interval(leftMul(a, d), rightMul(b, d))]); // (M | P0 | N0) * P1
        } else {
            return new Union([
                new Interval(
                    Math.min(leftMul(a, d), leftMul(b, c)),
                    Math.max(rightMul(a, c), rightMul(b, d))
                ),
            ]); // (M | P0 | N0) * (M | P0 | N0)
        }
    }
}

// Division in the context of an interval bound
function leftDiv(a: number, b: number): number {
    if (b === Infinity) {
        return Math.sign(a) * 0;
    }
    if (b === -Infinity) {
        return Math.sign(-a) * 0;
    }
    if (b === 1) return a;
    if (b === -1) return -a;
    return prev(a / b);
}

function rightDiv(a: number, b: number): number {
    if (b === Infinity) {
        return Math.sign(a) * 0;
    }
    if (b === -Infinity) {
        return Math.sign(-a) * 0;
    }
    if (b === 1) return a;
    if (b === -1) return -a;
    return next(a / b);
}

// Interval types
// N1: lo <= x < 0
// N0: lo <= x <= 0
// M: lo <= x <= hi, with lo < 0 and hi > 0
// P0: 0 <= x <= hi
// P1: 0 < x <= hi
// Z: [0, 0]
const enum IType {
    P1,
    P0,
    M,
    N0,
    N1,
    Z,
}

export function intervalType(x: Interval): IType {
    if (x.hi < 0) return IType.N1;
    if (x.lo > 0) return IType.P1;
    if (x.lo < 0 && x.hi === 0) return IType.N0;
    if (x.lo === 0 && x.hi > 0) return IType.P0;
    if (x.lo === 0 && x.hi === 0) return IType.Z;
    else return IType.M;
}

// Interval division
// See Figure 4 from:
// "Hickey, T., Ju, Q. and Van Emden, M.H., 2001. Interval arithmetic: From principles to implementation."
export function idiv(x: Interval, y: Interval): Union {
    typeCheckIsInterval(x);
    typeCheckIsInterval(y);

    const xType = intervalType(x);
    const yType = intervalType(y);

    // Zero cases
    if (yType === IType.Z) {
        return EMPTY;
    }
    if (xType === IType.Z) {
        return union([inter(0, 0)]);
    }

    const [a, b] = [x.lo, x.hi];
    const [c, d] = [y.lo, y.hi];

    if (yType === IType.P1) {
        if (xType === IType.P1) {
            return union([new Interval(leftDiv(a, d), rightDiv(b, c))]); // P1 / P1
        } else if (xType === IType.P0) {
            return union([new Interval(0, rightDiv(b, c))]); // P0 / P1
        } else if (xType === IType.M) {
            return union([new Interval(leftDiv(a, c), rightDiv(b, c))]); // M / P1
        } else if (xType === IType.N0) {
            return union([new Interval(leftDiv(a, c), -0)]); // N0 / P1
        } else {
            return union([new Interval(leftDiv(a, c), rightDiv(b, d))]); // N1 / P1
        }
    } else if (yType === IType.P0) {
        if (xType === IType.P1) {
            return union([new Interval(leftDiv(a, d), Infinity)]); // P1 / P0
        } else if (xType === IType.P0) {
            return union([new Interval(0, Infinity)]); // P0 / P0
        } else if (xType === IType.M) {
            return union([FULL]); // M / P0
        } else if (xType === IType.N0) {
            return union([new Interval(-Infinity, -0)]); // N0 / P0
        } else {
            return union([new Interval(-Infinity, rightDiv(b, d))]); // N1 / P0
        }
    } else if (yType === IType.M) {
        if (xType === IType.P1) {
            return union([
                new Interval(-Infinity, rightDiv(a, c)),
                new Interval(leftDiv(a, d), Infinity),
            ]); // P1 / M
        } else if (xType == IType.N1) {
            return union([
                new Interval(-Infinity, rightDiv(b, d)),
                new Interval(leftDiv(b, c), Infinity),
            ]); // N1 / M
        } else {
            // P0 / M
            // M / M
            // N0 / M
            return union([FULL]);
        }
    } else if (yType === IType.N0) {
        if (xType === IType.P1) {
            return union([new Interval(-Infinity, rightDiv(a, c))]); // P1 / N0
        } else if (xType === IType.P0) {
            return union([new Interval(-Infinity, -0)]); // P0 / N0
        } else if (xType === IType.M) {
            return union([FULL]); // M / N0
        } else if (xType === IType.N0) {
            return union([new Interval(0, Infinity)]); // N0 / N0
        } else {
            return union([new Interval(leftDiv(b, c), Infinity)]); // N1 / N0
        }
    } else {
        if (xType === IType.P1) {
            return union([new Interval(leftDiv(b, d), rightDiv(a, c))]); // P1 / N1
        } else if (xType === IType.P0) {
            return union([new Interval(leftDiv(b, d), -0)]); // P0 / N1
        } else if (xType === IType.M) {
            return union([new Interval(leftDiv(b, d), rightDiv(a, d))]); // M / N1
        } else if (xType === IType.N0) {
            return union([new Interval(0, rightDiv(a, d))]); // N0 / N1
        } else {
            return union([new Interval(leftDiv(b, c), rightDiv(a, d))]); // N1 / N1
        }
    }
}

export const uadd = makeBinaryOpUnion(iadd);
export const usub = makeBinaryOpUnion(isub);
export const umul = makeBinaryOpUnion(imul);
export const udiv = makeBinaryOpUnion(idiv);

export function uneg(U: Union): Union {
    typeCheckIsUnion(U);
    return new Union(U.intervals.slice().reverse().map(ineg));
}

export const add = makeBinaryOpEither(uadd);
export const sub = makeBinaryOpEither(usub);
export const mul = makeBinaryOpEither(umul);
export const div = makeBinaryOpEither(udiv);
