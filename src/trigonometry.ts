import { prev, next } from "./nextafter.ts";
import { Interval, typeCheckIsInterval } from "./interval.ts";
import { Union, typeCheckIsUnion, makeUnaryOpUnion, makeUnaryOpEither, bounded } from "./union.ts";
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

    const width = X.hi - X.lo;
    if (width >= 2 * Math.PI) return new Union([new Interval(-1, 1)]);

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

    const width = X.hi - X.lo;
    if (width >= 2 * Math.PI) return new Union([new Interval(-1, 1)]);

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
