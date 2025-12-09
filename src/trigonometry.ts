import { prev, next } from "./nextafter.ts";
import { Interval, typeCheckIsInterval } from "./interval.ts";
import {
    Union,
    typeCheckIsUnion,
    makeUnaryOpUnion,
    makeUnaryOpEither,
    bounded,
    EMPTY,
} from "./union.ts";
import { udiv, usub } from "./arithmetic.ts";

const pi = Math.PI;
const halfpi = Math.PI / 2;
const tau = 2 * Math.PI;
export function wrapAngle(angle: number): number {
    return ((angle % tau) + tau) % tau;
}

// Returns the list of integers n such that n*pi is in an interval
export function piMultiples(X: Interval): number[] {
    const lower = Math.ceil(X.lo / Math.PI);
    const upper = Math.floor(X.hi / Math.PI);

    if (lower > upper) {
        return [];
    }

    const result: number[] = [];
    for (let n = lower; n <= upper; n++) {
        result.push(n);
    }
    return result;
}

// Returns the list of integers n such that (pi/2) + n*pi is in an interval
export function halfPiMultiples(X: Interval): number[] {
    const lower = Math.ceil((X.lo - Math.PI / 2) / Math.PI);
    const upper = Math.floor((X.hi - Math.PI / 2) / Math.PI);

    if (lower > upper) {
        return [];
    }

    const result: number[] = [];
    for (let n = lower; n <= upper; n++) {
        result.push(n);
    }
    return result;
}

// COS

function leftCos(x: number): number {
    if (x === 0) return 1;
    return Math.max(-1, Math.min(1, prev(Math.cos(x))));
}

function rightCos(x: number): number {
    if (x === 0) return 1;
    return Math.max(-1, Math.min(1, next(Math.cos(x))));
}

export function icos(X: Interval): Union {
    typeCheckIsInterval(X);

    if (X.width() >= 2 * Math.PI) return new Union([new Interval(-1, 1)]);

    const candidates = [X.lo, X.hi, ...piMultiples(X).map((x) => x * pi)];

    const left = candidates.map(leftCos);
    const right = candidates.map(rightCos);

    return new Union([new Interval(Math.min(...left), Math.max(...right))]);
}

export const ucos = makeUnaryOpUnion(icos);
export const cos = makeUnaryOpEither(ucos);

// SIN

function leftSin(x: number): number {
    if (x === 0) return 0;
    return Math.max(-1, Math.min(1, prev(Math.sin(x))));
}

function rightSin(x: number): number {
    if (x === 0) return 0;
    return Math.max(-1, Math.min(1, next(Math.sin(x))));
}

export function isin(X: Interval): Union {
    typeCheckIsInterval(X);

    if (X.width() >= 2 * Math.PI) return new Union([new Interval(-1, 1)]);

    const candidates = [X.lo, X.hi, ...halfPiMultiples(X).map((x) => halfpi + x * pi)];

    const left = candidates.map(leftSin);
    const right = candidates.map(rightSin);

    return new Union([new Interval(Math.min(...left), Math.max(...right))]);
}

export const usin = makeUnaryOpUnion(isin);
export const sin = makeUnaryOpEither(usin);

// TAN

export function utan(U: Union): Union {
    return udiv(usin(U), ucos(U));
}

export const tan = makeUnaryOpEither(utan);

// ARCCOS

export function iacos(X: Interval): Union {
    typeCheckIsInterval(X);

    if (X.lo > 1 || X.hi < -1) return EMPTY;
    const lower = X.hi >= 1 ? 0 : prev(Math.acos(X.hi));
    const upper = next(Math.acos(Math.max(-1, X.lo)));
    return new Union([new Interval(lower, upper)]);
}

export const uacos = makeUnaryOpUnion(iacos);
export const acos = makeUnaryOpEither(uacos);

// ARCSIN

export function iasin(X: Interval): Union {
    typeCheckIsInterval(X);

    if (X.lo > 1 || X.hi < -1) return EMPTY;
    const [l, h] = [Math.max(-1, X.lo), Math.min(1, X.hi)];
    return new Union([new Interval(prev(Math.asin(l)), next(Math.asin(h)))]);
}

export const uasin = makeUnaryOpUnion(iasin);
export const asin = makeUnaryOpEither(uasin);

// ARCTAN

function leftAtan(x: number): number {
    if (x === 0) return 0;
    return prev(Math.atan(x));
}

function rightAtan(x: number): number {
    if (x === 0) return 0;
    return next(Math.atan(x));
}

export function iatan(X: Interval): Union {
    typeCheckIsInterval(X);
    return new Union([new Interval(leftAtan(X.lo), rightAtan(X.hi))]);
}

export const uatan = makeUnaryOpUnion(iatan);
export const atan = makeUnaryOpEither(uatan);
