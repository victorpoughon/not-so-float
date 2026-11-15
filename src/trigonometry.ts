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
const tau = 2 * Math.PI;

// Quadrant of the angle x (mod 2*pi), numbered 0 to 3:
//   0: (0, pi/2)      sin > 0, cos > 0
//   1: (pi/2, pi)     sin > 0, cos < 0
//   2: (pi, 3pi/2)    sin < 0, cos < 0
//   3: (3pi/2, 2pi)   sin < 0, cos > 0
//
// For any float x other than 0, the true sin(x) and cos(x) are never zero
// (pi is irrational). Assuming Math.sin and Math.cos are accurate to within
// one ulp (as the endpoint evaluations already assume), their signs are
// therefore always correct, and the quadrant is known exactly, even for huge
// x. x = 0 lies on the boundary between quadrants 3 and 0, so it is assigned
// to quadrant 0 as a lower bound and quadrant 3 as an upper bound.
function quadrant(x: number, isLowerBound: boolean): number {
    if (x === 0) return isLowerBound ? 0 : 3;
    const s = Math.sin(x);
    const c = Math.cos(x);
    if (s > 0) return c > 0 ? 0 : 1;
    return c < 0 ? 2 : 3;
}

// Extrema of sin and cos strictly inside the interval [lo, hi]
interface Extrema {
    sinMax: boolean; // pi/2 + 2k*pi
    cosMin: boolean; // pi + 2k*pi
    sinMin: boolean; // 3pi/2 + 2k*pi
    cosMax: boolean; // 2k*pi
}

// Returns which extrema of sin and cos lie strictly inside [lo, hi]. Extrema
// at the endpoints are covered by evaluating sin/cos at the endpoints.
// Requires hi - lo < 2*pi.
//
// Going from quadrant q to quadrant q+1 crosses the angle (q+1)*pi/2, which is
// an extremum of either sin or cos. Since the interval is narrower than 2*pi,
// the number of quadrant boundaries crossed is (qhi - qlo) mod 4, except when
// both endpoints are in the same quadrant: then it is either 0 (width < pi/2)
// or 4 (width > 3pi/2), which comparing the width to pi tells apart safely.
//
// This avoids computing k*pi for large k, which drifts away from the true
// multiples of pi because Math.PI is not exactly pi.
function interiorExtrema(lo: number, hi: number): Extrema {
    const crossed = [false, false, false, false];

    if (lo !== hi) {
        const qlo = quadrant(lo, true);
        const qhi = quadrant(hi, false);
        let count = (qhi - qlo + 4) % 4;
        if (count === 0 && hi - lo > pi) count = 4;

        for (let i = 1; i <= count; i++) {
            crossed[(qlo + i) % 4] = true;
        }
    }

    // crossed[q] means the boundary at the start of quadrant q was crossed
    return {
        sinMax: crossed[1],
        cosMin: crossed[2],
        sinMin: crossed[3],
        cosMax: crossed[0],
    };
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

    if (!(X.width() < tau)) return new Union([new Interval(-1, 1)]);

    const extrema = interiorExtrema(X.lo, X.hi);
    const lower = extrema.cosMin ? -1 : Math.min(leftCos(X.lo), leftCos(X.hi));
    const upper = extrema.cosMax ? 1 : Math.max(rightCos(X.lo), rightCos(X.hi));

    return new Union([new Interval(lower, upper)]);
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

    if (!(X.width() < tau)) return new Union([new Interval(-1, 1)]);

    const extrema = interiorExtrema(X.lo, X.hi);
    const lower = extrema.sinMin ? -1 : Math.min(leftSin(X.lo), leftSin(X.hi));
    const upper = extrema.sinMax ? 1 : Math.max(rightSin(X.lo), rightSin(X.hi));

    return new Union([new Interval(lower, upper)]);
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

function leftAsin(x: number): number {
    if (x === 0) return 0;
    return prev(Math.asin(x));
}

function rightAsin(x: number): number {
    if (x === 0) return 0;
    return next(Math.asin(x));
}

export function iasin(X: Interval): Union {
    typeCheckIsInterval(X);

    if (X.lo > 1 || X.hi < -1) return EMPTY;
    const [l, h] = [Math.max(-1, X.lo), Math.min(1, X.hi)];
    return new Union([new Interval(leftAsin(l), rightAsin(h))]);
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
