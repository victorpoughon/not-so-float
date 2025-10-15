import { Interval } from "./interval.ts";
import { Union, typeCheckIsIntervalOrUnion, toUnion } from "./union.ts";

export function ioverlap(a: Interval, b: Interval): boolean {
    return a.hi >= b.lo && a.lo <= b.hi;
}

export function idisjoint(a: Interval, b: Interval): boolean {
    return a.hi < b.lo || a.lo > b.hi;
}

export function iuoverlap(X: Interval, U: Union): boolean {
    return U.intervals.some((Y) => ioverlap(X, Y));
}

export function iudisjoint(X: Interval, U: Union): boolean {
    return U.intervals.every((Y) => idisjoint(X, Y));
}

export function overlap(A: Interval | Union, B: Interval | Union) {
    typeCheckIsIntervalOrUnion(A);
    typeCheckIsIntervalOrUnion(B);

    const Bunion = toUnion(B);
    return toUnion(A).intervals.some((X) => iuoverlap(X, Bunion));
}

export function disjoint(A: Interval | Union, B: Interval | Union) {
    typeCheckIsIntervalOrUnion(A);
    typeCheckIsIntervalOrUnion(B);

    const Bunion = toUnion(B);
    return toUnion(A).intervals.every((X) => iudisjoint(X, Bunion));
}

// Intersection of two intervals
export function iintersection(a: Interval, b: Interval): Interval | null {
    if (a.hi < b.lo || a.lo > b.hi) return null;
    return new Interval(Math.max(a.lo, b.lo), Math.min(a.hi, b.hi));
}
}
