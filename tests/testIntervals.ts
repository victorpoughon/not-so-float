import * as nsf from "../src/index.ts";

const realFloats = [
    -Number.MAX_VALUE,
    -1e50,
    -1e10,
    -10,
    -Math.PI,
    -1,
    -1e-12,
    -1e-20,
    0,
    1e-20,
    1e-12,
    1,
    Math.PI,
    10,
    1e10,
    1e50,
    Number.MAX_VALUE,
];

// Simple intervals of real floats that are:
// - finite
// - not empty
// - not degenerate
// - not "almost degenerate" (i.e. more than a few unique floats in the interval)
export const realIntervals = (() => {
    let list: nsf.Interval[] = [];
    realFloats.forEach((a) => {
        return realFloats.forEach((b) => {
            if (a < b) {
                return list.push(nsf.interval(a, b));
            }
        });
    });
    return list;
})();

// Semi infinite intervals
export const semiInfiniteIntervals = [
    // [v, +inf]
    nsf.interval(-Number.MAX_VALUE, Infinity),
    nsf.interval(-Number.MAX_VALUE / 2, Infinity),
    nsf.interval(-1e308, Infinity),
    nsf.interval(-1e50, Infinity),
    nsf.interval(-Number.MAX_SAFE_INTEGER, Infinity),
    nsf.interval(-1e5, Infinity),
    nsf.interval(-1e-12, Infinity),
    nsf.interval(-Number.MIN_VALUE, Infinity),
    nsf.interval(-0, Infinity),
    nsf.interval(+0, Infinity),
    nsf.interval(Number.MIN_VALUE, Infinity),
    nsf.interval(1e-12, Infinity),
    nsf.interval(1e5, Infinity),
    nsf.interval(Number.MAX_SAFE_INTEGER, Infinity),
    nsf.interval(1e50, Infinity),
    nsf.interval(1e308, Infinity),
    nsf.interval(Number.MAX_VALUE / 2, Infinity),
    nsf.interval(Number.MAX_VALUE, Infinity),

    // [-inf, v]
    nsf.interval(-Infinity, -Number.MAX_VALUE),
    nsf.interval(-Infinity, -Number.MAX_VALUE / 2),
    nsf.interval(-Infinity, -1e308),
    nsf.interval(-Infinity, -1e50),
    nsf.interval(-Infinity, -Number.MAX_SAFE_INTEGER),
    nsf.interval(-Infinity, -1e5),
    nsf.interval(-Infinity, -1e-12),
    nsf.interval(-Infinity, -Number.MIN_VALUE),
    nsf.interval(-Infinity, -0),
    nsf.interval(-Infinity, +0),
    nsf.interval(-Infinity, Number.MIN_VALUE),
    nsf.interval(-Infinity, 1e-12),
    nsf.interval(-Infinity, 1e5),
    nsf.interval(-Infinity, Number.MAX_SAFE_INTEGER),
    nsf.interval(-Infinity, 1e50),
    nsf.interval(-Infinity, 1e308),
    nsf.interval(-Infinity, Number.MAX_VALUE / 2),
    nsf.interval(-Infinity, Number.MAX_VALUE),
];

// Degenerate finite intervals
export const degenerateFiniteIntervals = [
    nsf.interval(0),
    nsf.interval(nsf.next(0)),
    nsf.interval(Math.PI),
    nsf.interval(-Math.PI),
    nsf.interval(1e150),
    nsf.interval(Math.E),

    // Degenerate intervals (singletons)
    nsf.interval(0, 0),
    nsf.interval(1, 1),
    nsf.interval(-1, -1),
    nsf.interval(Number.MAX_VALUE, Number.MAX_VALUE),
    nsf.interval(Number.MIN_VALUE, Number.MIN_VALUE),
];

export const allIntervals = [
    ...realIntervals,
    ...semiInfiniteIntervals,
    ...degenerateFiniteIntervals,
];

export const allIntervalsPairs = (() => {
    const out: [nsf.Interval, nsf.Interval][] = [];
    allIntervals.forEach((x) => {
        allIntervals.forEach((y) => {
            out.push([x, y]);
            out.push([y, x]);
        });
    });
    return out;
})();

// Sample an interval [a, b] where a and b are real
// Very tricky to avoid float nonsense here for extreme intervals
function sampleRealInterval(x: nsf.Interval, N: number): number[] {
    const samples: number[] = [];
    const step = x.hi / (N - 1) - x.lo / (N - 1); // careful to avoid overflow here
    samples.push(x.lo);
    for (let i = 1; i < N - 1; i++) {
        samples.push(samples[samples.length - 1] + step);
    }
    samples.push(x.hi);
    return samples;
}

function sampleSemiInfiniteRightInterval(x: nsf.Interval, N: number) {
    const samples: number[] = [x.lo];
    const step = x.lo === 0 ? 2.0 : Math.abs(x.lo);
    for (let i = 1; i < N; i++) {
        const n = x.lo + Math.pow(step, i);
        if (isFinite(n)) {
            samples.push(n);
        }
    }
    return samples;
}

function sampleSemiInfiniteLeftInterval(x: nsf.Interval, N: number) {
    const samples: number[] = [x.hi];
    const step = x.hi === 0 ? 2.0 : Math.abs(x.hi);
    for (let i = 1; i < N; i++) {
        const n = x.hi - Math.pow(step, i);
        if (isFinite(n)) {
            samples.push(n);
        }
    }
    return samples;
}

// Generate real samples of an interval for testing
export function sampleInterval(x: nsf.Interval, N: number): number[] {
    if (x.isFinite()) {
        // Real interval
        return sampleRealInterval(x, N);
    } else if (Number.isFinite(x.lo)) {
        // [a, +inf]
        return sampleSemiInfiniteRightInterval(x, N);
    } else if (Number.isFinite(x.hi)) {
        // [-inf, a]
        return sampleSemiInfiniteLeftInterval(x, N);
    } else {
        // [-inf, +inf]
        return [
            -Number.MAX_VALUE,
            -1e100,
            -1e50,
            -1e2,
            -1,
            -0.1,
            -0.001,
            -Number.MIN_VALUE,
            -0,
            +0,
            Number.MIN_VALUE,
            0.001,
            0.1,
            1,
            1e2,
            1e50,
            1e100,
            Number.MAX_VALUE,
        ];
    }
}

// Generate real samples of a union for testing
export function sampleUnion(U: nsf.Union, N: number): number[] {
    return U.intervals.map((i) => sampleInterval(i, N)).flat();
}
