import { prev, next } from "./nextafter.ts";
import { Interval, FULL, typeCheckIsInterval } from "./interval.ts";
import {
    Union,
    union,
    EMPTY,
    UFULL,
    toUnion,
    typeCheckIsIntervalOrUnion,
    typeCheckIsUnion,
    makeUnaryOpUnion,
    makeUnaryOpEither,
    makeBinaryOpUnion,
    makeBinaryOpEither,
} from "./union.ts";
import { idiv, div, umul, ineg, uneg } from "./arithmetic.ts";

// abs: absolute value

export function iabs(X: Interval): Union {
    if (X.lo >= 0) return new Union([X]);
    if (X.hi <= 0) return new Union([ineg(X)]);
    return new Union([new Interval(0, Math.max(-X.lo, X.hi))]);
}

export const uabs = makeUnaryOpUnion(iabs);
export const abs = makeUnaryOpEither(uabs);

// min / max: binary min/max

export function imin(X: Interval, Y: Interval): Union {
    return new Union([new Interval(Math.min(X.lo, Y.lo), Math.min(X.hi, Y.hi))]);
}

export const umin = makeBinaryOpUnion(imin);
export const min = makeBinaryOpEither(umin);

export function imax(X: Interval, Y: Interval): Union {
    return new Union([new Interval(Math.max(X.lo, Y.lo), Math.max(X.hi, Y.hi))]);
}

export const umax = makeBinaryOpUnion(imax);
export const max = makeBinaryOpEither(umax);

// exp: exponential

function leftExp(x: number): number {
    if (x === -Infinity) return 0;
    if (x === 0) return 1;
    return prev(Math.exp(x));
}

function rightExp(x: number): number {
    if (x === 0) return 1;
    return next(Math.exp(x));
}

export function iexp(X: Interval): Interval {
    typeCheckIsInterval(X);
    return new Interval(leftExp(X.lo), rightExp(X.hi));
}

export function uexp(U: Union): Union {
    typeCheckIsUnion(U);
    return new Union(U.intervals.map(iexp));
}

export const exp = makeUnaryOpEither(uexp);

// log: natural logarithm

function leftLog(x: number): number {
    if (x === 0) return -Infinity;
    if (x === 1) return 0;
    return prev(Math.log(x));
}

function rightLog(x: number): number {
    if (x === 0) return -Infinity;
    if (x === 1) return 0;
    return next(Math.log(x));
}

export function ilog(X: Interval): Union {
    typeCheckIsInterval(X);
    if (X.hi <= 0) return new Union([]);
    if (X.lo <= 0) {
        return new Union([new Interval(-Infinity, rightLog(X.hi))]);
    } else {
        return new Union([new Interval(leftLog(Math.max(0, X.lo)), rightLog(X.hi))]);
    }
}

export function ulog(U: Union): Union {
    typeCheckIsUnion(U);
    return new Union(
        U.intervals
            .map((i) => ilog(i).intervals)
            .filter((il) => il.length > 0)
            .flat()
    );
}

export const log = makeUnaryOpEither(ulog);

// powInt: exponentiation with an integer exponent

function leftPowInt(base: number, exponent: number): number {
    if (base === 0) return 0;
    if (exponent === 0) return 1;
    return prev(Math.pow(base, exponent));
}

function rightPowInt(base: number, exponent: number): number {
    if (base === 0) return 0;
    if (exponent === 0) return 1;
    return next(Math.pow(base, exponent));
}

export function ipowInt(X: Interval, n: number): Union {
    typeCheckIsInterval(X);
    if (!Number.isInteger(n)) {
        throw Error(`ipowint: exponent must be an integer, got ${n}`);
    }

    if (n < 0) return idiv(new Interval(1, 1), ipowInt(X, -n).intervals[0]);
    if (n === 0) return new Union([new Interval(1, 1)]);

    if (X.lo > 0 || n % 2 !== 0) {
        return new Union([new Interval(leftPowInt(X.lo, n), rightPowInt(X.hi, n))]);
    } else if (X.hi < 0) {
        return new Union([new Interval(leftPowInt(X.hi, n), rightPowInt(X.lo, n))]);
    } else {
        // X contains 0
        return new Union([new Interval(0, rightPowInt(Math.max(X.hi, -X.lo), n))]);
    }
}

export function upowInt(U: Union, n: number): Union {
    typeCheckIsUnion(U);
    return union(U.intervals.map((i) => ipowInt(i, n).intervals).flat());
}

export function powInt(A: Interval | Union, n: number): Union {
    typeCheckIsIntervalOrUnion(A);
    return upowInt(toUnion(A), n);
}

// pow: exponentiation with a real exponent

export function ipow(X: Interval, Y: Interval): Union {
    if (X.hi <= 0) return new Union([]);
    return uexp(umul(new Union([Y]), ilog(X)));
}

export const upow = makeBinaryOpUnion(ipow);
export const pow = makeBinaryOpEither(upow);

// sqrt: square root

function leftSqrt(x: number): number {
    if (x === 0) return 0;
    if (x === 1) return 1;
    return prev(Math.sqrt(x));
}

function rightSqrt(x: number): number {
    if (x === 0) return 0;
    if (x === 1) return 1;
    return next(Math.sqrt(x));
}

export function isqrt(X: Interval): Union {
    if (X.hi < 0) return EMPTY;
    return new Union([new Interval(leftSqrt(Math.max(0, X.lo)), rightSqrt(X.hi))]);
}

export function usqrt(U: Union): Union {
    typeCheckIsUnion(U);
    return new Union(
        U.intervals
            .map((i) => isqrt(i).intervals)
            .filter((il) => il.length > 0)
            .flat()
    );
}

export const sqrt = makeUnaryOpEither(usqrt);

// sqinv: inverse of the square function

export function usqinv(U: Union): Union {
    const x = usqrt(U);
    return union(uneg(x).intervals.concat(x.intervals));
}

export const sqinv = makeUnaryOpEither(usqinv);

// powIntInv: inverse of an integral power

export function upowIntInv(U: Union, n: number): Union {
    if (n === 0) {
        if (U.contains(1)) return UFULL;
        else return EMPTY;
    }

    if (n === 1) {
        return U;
    }

    if (n > 0 && n % 2 === 0) {
        return upowEvenInv(U, n);
    }

    if (n > 0 && n % 2 !== 0) {
        return upowOddInv(U, n);
    }

    // n negative
    if (U.lower() === 0 && U.upper() === 0) {
        return EMPTY;
    }
    
    const one = new Union([new Interval(1, 1)]);
    return div(one, upowIntInv(U, -n));
}

export function powIntInv(A: Interval | Union, n: number): Union {
    typeCheckIsIntervalOrUnion(A);
    return upowIntInv(toUnion(A), n);
}

// x = y^(1/n) with n odd and positive
function leftPowOddInv(y: number, n: number): number {
    if (y === 0) return 0;
    if (y === 1) return 1;
    if (y === -1) return -1;
    else if (y > 0) return prev(Math.pow(y, prev(1 / n)));
    else return prev(-Math.pow(-y, next(1 / n)));
}

function rightPowOddInv(y: number, n: number): number {
    if (y === 0) return 0;
    if (y === 1) return 1;
    if (y === -1) return -1;
    else if (y > 0) return next(Math.pow(y, next(1 / n)));
    else return next(-Math.pow(-y, prev(1 / n)));
}

// Inverse of an odd integer power
function ipowOddInv(X: Interval, n: number): Interval {
    typeCheckIsInterval(X);
    return new Interval(leftPowOddInv(X.lo, n), rightPowOddInv(X.hi, n));
}

function upowOddInv(U: Union, n: number): Union {
    typeCheckIsUnion(U);
    return new Union(U.intervals.map((X) => ipowOddInv(X, n)));
}

export function powOddInv(A: Interval | Union, n: number): Union {
    typeCheckIsIntervalOrUnion(A);
    return upowOddInv(toUnion(A), n);
}

// x = y^(1/n) with n even and positive, and y positive
function leftPowEvenInv(y: number, n: number): number {
    if (y === 0) return 0;
    if (y === 1) return 1;
    return prev(Math.pow(y, prev(1 / n)));
}

function rightPowEvenInv(y: number, n: number): number {
    if (y === 0) return 0;
    if (y === 1) return 1;
    return next(Math.pow(y, next(1 / n)));
}

export function ipowEvenInv(Y: Interval, n: number): Union {
    if (Y.hi < 0) {
        return EMPTY;
    } else if (Y.hi === 0) {
        return new Union([new Interval(0, 0)]);
    } else {
        const principal = new Interval(
            leftPowEvenInv(Math.max(0, Y.lo), n),
            rightPowEvenInv(Y.hi, n)
        );
        return new Union([ineg(principal), principal]);
    }
}

export function upowEvenInv(U: Union, n: number): Union {
    typeCheckIsUnion(U);
    return union(U.intervals.map((X) => ipowEvenInv(X, n).intervals).flat());
}
