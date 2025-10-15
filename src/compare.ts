import { Interval } from "./interval.ts";
import { Union, typeCheckIsIntervalOrUnion, toUnion, EMPTY, union } from "./union.ts";

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

export function overlap(A: Interval | Union, B: Interval | Union): boolean {
    typeCheckIsIntervalOrUnion(A);
    typeCheckIsIntervalOrUnion(B);

    const Bunion = toUnion(B);
    return toUnion(A).intervals.some((X) => iuoverlap(X, Bunion));
}

export function disjoint(A: Interval | Union, B: Interval | Union): boolean {
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

// Intersection of two unions
export function uintersection(A: Union, B: Union): Union {
    if (A.isEmpty() || B.isEmpty()) return EMPTY;
    if (A.isFull()) return B;
    if (B.isFull()) return A;

    const result: Interval[] = [];
    let [PA, PB] = [0, 0];

    while (PA < A.intervals.length && PB < B.intervals.length) {
        const a = A.intervals[PA];
        const b = B.intervals[PB];

        // If they intersect, add it to the result
        const aintb = iintersection(a, b);
        if (aintb !== null) {
            result.push(aintb);
        }

        // Increment the pointer of the interval that ends first
        if (a.hi > b.hi) PB += 1;
        else PA += 1;
    }

    return new Union(result);
}

// Intersection of two unions or intervals
export function intersection(A: Interval | Union, B: Interval | Union): Union {
    typeCheckIsIntervalOrUnion(A);
    typeCheckIsIntervalOrUnion(B);

    return uintersection(toUnion(A), toUnion(B));
}

// Complement of a union
export function ucomplement(U: Union): Union {
    if (U.isEmpty()) return new Union([new Interval(-Infinity, Infinity)]);
    if (U.isFull()) return EMPTY;

    const result: Interval[] = [];

    // Add interval from -Infinity to first interval if needed
    if (U.intervals[0].lo !== -Infinity) {
        result.push(new Interval(-Infinity, U.intervals[0].lo));
    }

    // Add intervals between consecutive intervals in the union
    for (let i = 0; i < U.intervals.length - 1; i++) {
        result.push(new Interval(U.intervals[i].hi, U.intervals[i + 1].lo));
    }

    // Add interval from last interval to Infinity if needed
    if (U.intervals[U.intervals.length - 1].hi !== Infinity) {
        result.push(new Interval(U.intervals[U.intervals.length - 1].hi, Infinity));
    }

    // Need to call the union constructor, because some intervals might touch
    return union(result);
}

// Complement of a union or interval
export function complement(A: Union | Interval): Union {
    typeCheckIsIntervalOrUnion(A);
    return ucomplement(toUnion(A));
}
