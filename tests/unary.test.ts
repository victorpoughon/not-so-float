import { describe, it } from "node:test";
import assert from "node:assert";

import * as nsf from "../src/index.ts";
import { allIntervals, sampleUnion } from "./testIntervals.ts";

// Unary functions of the public API and their real counterparts
const unaryFunctions: [string, (A: nsf.Union) => nsf.Union, (x: number) => number][] = [
    ["abs", nsf.abs, Math.abs],
    ["exp", nsf.exp, Math.exp],
    // log(0) is -Infinity in JS, but is not a real number: 0 is outside the domain
    ["log", nsf.log, (x) => (x === 0 ? NaN : Math.log(x))],
    ["sqrt", nsf.sqrt, Math.sqrt],
    ["cos", nsf.cos, Math.cos],
    ["sin", nsf.sin, Math.sin],
    ["tan", nsf.tan, Math.tan],
    ["acos", nsf.acos, Math.acos],
    ["asin", nsf.asin, Math.asin],
    ["atan", nsf.atan, Math.atan],
];

// Inputs: all test intervals, plus some unions of several disjoint intervals
const unions = [
    nsf.union([nsf.interval(-10, -9), nsf.interval(-1, 0.5), nsf.interval(2, 3)]),
    nsf.union([nsf.interval(-Infinity, -100), nsf.interval(1, 4), nsf.interval(1e9, 1e9 + 1)]),
    nsf.union([nsf.interval(0.1, 0.2), nsf.interval(1.5, 1.6), nsf.interval(1e15, Infinity)]),
];
const inputs = [...allIntervals.map((X) => nsf.union([X])), ...unions];

// A valid union is made of sorted, disjoint, non-empty intervals with no NaN bounds
function assertValidUnion(U: nsf.Union, message: string) {
    U.intervals.forEach((X, i) => {
        assert.ok(!Number.isNaN(X.lo) && !Number.isNaN(X.hi), `NaN bound in ${U}: ${message}`);
        assert.ok(X.lo <= X.hi, `invalid interval in ${U}: ${message}`);
        if (i > 0) {
            assert.ok(U.intervals[i - 1].hi < X.lo, `unsorted or overlapping ${U}: ${message}`);
        }
    });
}

describe("unary functions", () => {
    for (const [name, f, freal] of unaryFunctions) {
        it(`${name} produces valid unions with the inclusion property`, () => {
            for (const X of inputs) {
                const result = f(X);
                assertValidUnion(result, `${name}(${X})`);

                for (const x of sampleUnion(X, 5)) {
                    const y = freal(x);
                    // Samples outside of the function's domain have no image
                    if (Number.isNaN(y)) continue;
                    assert.ok(
                        result.contains(y),
                        `${name}(${x}) = ${y} is not in ${name}(${X}) = ${result}`,
                    );
                }
            }
        });
    }
});
