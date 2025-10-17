import { prev, next } from "./nextafter.ts";
import { Interval, FULL, typeCheckIsInterval } from "./interval.ts";
import {
    Union,
    union,
    EMPTY,
    toUnion,
    typeCheckIsIntervalOrUnion,
    typeCheckIsUnion,
    makeUnaryOpUnion,
    makeUnaryOpEither,
    makeBinaryOpUnion,
    makeBinaryOpEither,
} from "./union.ts";
import { idiv, umul, ineg, uneg } from "./arithmetic.ts";

// ABS

export function iabs(X: Interval): Union {
    if (X.lo >= 0) return new Union([X]);
    if (X.hi <= 0) return new Union([ineg(X)]);
    return new Union([new Interval(0, Math.max(-X.lo, X.hi))]);
}

export const uabs = makeUnaryOpUnion(iabs);
export const abs = makeUnaryOpEither(uabs);

// MIN / MAX

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

// EXPONENTIAL

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

// LOGARITHM

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

// POW (integer exponent)

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

// POW (real exponent)

export function ipow(X: Interval, Y: Interval): Union {
    if (X.hi <= 0) return new Union([]);
    return uexp(umul(new Union([Y]), ilog(X)));
}

export const upow = makeBinaryOpUnion(ipow);
export const pow = makeBinaryOpEither(upow);

// SQRT

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

// SQINV: inverse of the square function

export function usqinv(U: Union): Union {
    const x = usqrt(U);
    return union(uneg(x).intervals.concat(x.intervals));
}

export const sqinv = makeUnaryOpEither(usqinv);
