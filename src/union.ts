import { prev, next } from "./nextafter.ts";
import { Interval, interval, defaultNumbers, typeCheckIsInterval } from "./interval.ts";

export class Union {
    constructor(readonly intervals: Interval[]) {}

    public isEmpty(): boolean {
        return this.intervals.length === 0;
    }

    public isFull(): boolean {
        return (
            this.intervals.length === 1 &&
            this.intervals[0].lo === -Infinity &&
            this.intervals[0].hi === Infinity
        );
    }

    public lower(): number {
        if (this.isEmpty()) return Infinity;
        return this.intervals[0].lo;
    }

    public upper(): number {
        if (this.isEmpty()) return -Infinity;
        return this.intervals[this.intervals.length - 1].hi;
    }

    public contains(value: number): boolean {
        return this.intervals.some((i) => i.contains(value));
    }

    public hull(): Union {
        if (this.isEmpty()) return EMPTY;
        return single(this.lower(), this.upper());
    }

    public forEach(callback: (x: Interval, index: number) => void) {
        this.intervals.forEach(callback);
    }

    public toString(numbers: (x: number) => string = defaultNumbers) {
        if (this.intervals.length === 0) return "{∅}";
        return this.intervals.map((i) => i.toString(numbers)).join(" U ");
    }

    public print(): void {
        console.log(this.toString());
    }
}

// Construct a union
// Minimum disjoint set of a list of intervals
export function union(intervals: Interval[]): Union {
    if (intervals.length <= 1) {
        return new Union(intervals);
    }

    // Sort by lower bound
    intervals.sort((x, y) => x.lo - y.lo);

    const merged: Interval[] = [intervals[0]];

    for (let i = 1; i < intervals.length; i++) {
        // If current interval overlaps, merge it
        const last = merged[merged.length - 1];
        const curr = intervals[i];
        if (curr.lo <= last.hi) {
            merged[merged.length - 1] = new Interval(last.lo, Math.max(last.hi, curr.hi));
        } else {
            merged.push(curr);
        }
    }

    return new Union(merged);
}

export function typeCheckIsUnion(U: any): U is Union {
    if (!(U instanceof Union)) {
        throw TypeError(`Argument must be a Union (got type ${typeof U})`);
    }
    return true;
}

export function toUnion(x: Interval | Union): Union {
    if (x instanceof Interval) return new Union([x]);
    return x;
}

type UnaryOpInterval = (X: Interval) => Union;
type UnaryOpUnion = (U: Union) => Union;
type UnaryOpEither = (A: Interval | Union) => Union;

type BinaryOpInterval = (X: Interval, Y: Interval) => Union;
type BinaryOpUnion = (U: Union, V: Union) => Union;
type BinaryOpEither = (A: Interval | Union, B: Interval | Union) => Union;

// Generic unary union operation corresponding to a unary interval operation
export function makeUnaryOpUnion(op: UnaryOpInterval): UnaryOpUnion {
    return (U: Union): Union => {
        typeCheckIsUnion(U);

        // Apply the operator to every interval in the union
        const results: Interval[] = [];
        U.forEach((X) => {
            results.push(...op(X).intervals);
        });

        // Merge resulting intervals into a disjoint union
        return union(results);
    };
}

// Generic binary union operation corresponding to a binary interval operation
export function makeBinaryOpUnion(op: BinaryOpInterval): BinaryOpUnion {
    return (U: Union, V: Union): Union => {
        typeCheckIsUnion(U);
        typeCheckIsUnion(V);
        // Apply the operator to the cartesian product of the input unions
        const results: Interval[] = [];
        U.forEach((X, i) => {
            V.forEach((Y) => {
                results.push(...op(X, Y).intervals);
            });
        });

        // Merge resulting intervals into a disjoint union
        return union(results);
    };
}

export function isIntervalOrUnion(x: any): boolean {
    return x instanceof Interval || x instanceof Union;
}

export function typeCheckIsIntervalOrUnion(x: any): boolean {
    if (!isIntervalOrUnion(x)) {
        throw TypeError("Argument must be of type Interval or Union");
    }
    return true;
}

export function makeUnaryOpEither(op: UnaryOpUnion): UnaryOpEither {
    return (A: Interval | Union) => {
        typeCheckIsIntervalOrUnion(A);
        return op(toUnion(A));
    };
}

export function makeBinaryOpEither(op: BinaryOpUnion): BinaryOpEither {
    return (A: Interval | Union, B: Interval | Union) => {
        typeCheckIsIntervalOrUnion(A);
        typeCheckIsIntervalOrUnion(B);

        return op(toUnion(A), toUnion(B));
    };
}

// Create a singleton: a union with a single interval
export function single(a: number, b?: number): Union {
    if (typeof b === "undefined") {
        b = a;
    }
    return union([interval(a, b)]);
}

// Create a singleton that bounds a number
export function bounded(x: number): Union {
    return single(prev(x), next(x));
}

export const EMPTY = new Union([]);
export const FULL = new Union([new Interval(-Infinity, Infinity)]);
