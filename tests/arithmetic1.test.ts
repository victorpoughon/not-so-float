import { describe, it } from "node:test";
import assert from "node:assert";

import * as nsf from "../src/index.ts";

import { allIntervalsPairs, sampleInterval } from "./testIntervals.ts";

// Short names to make test cases easier to read
const int = nsf.inter;
const inf = Infinity;
const equal = assert.deepEqual;

function uint(a: number, b: number): nsf.Union {
    return nsf.union([nsf.inter(a, b)]);
}

describe("arithmetic functions never produce invalid intervals", () => {
    it("add", () => {
        allIntervalsPairs.forEach(([x, y]) => {
            const resultAddUnion = nsf.iadd(x, y);
            assert(resultAddUnion.intervals.length === 1);
            const resultAdd = resultAddUnion.intervals[0];
            assert.ok(
                !isNaN(resultAdd.lo) && !isNaN(resultAdd.hi),
                `nsf.iadd(x, y) produced ${resultAdd} for inputs x = ${x} y = ${y}`
            );
            assert.ok(resultAdd.lo !== Infinity, "interval lower bound cannot be Infinity");
            assert.ok(resultAdd.hi !== -Infinity, "interval upper bound cannot be -Infinity");
        });
    });
    it("sub", () => {
        allIntervalsPairs.forEach(([x, y]) => {
            const resultSubUnion = nsf.isub(x, y);
            assert.ok(resultSubUnion.intervals.length === 1);
            const resultSub = resultSubUnion.intervals[0];
            assert.ok(
                !isNaN(resultSub.lo) && !isNaN(resultSub.hi),
                `nsf.isub(x, y) produced ${resultSub} for inputs x = ${x} y = ${y}`
            );
            assert.ok(resultSub.lo !== Infinity, "interval lower bound cannot be Infinity");
            assert.ok(resultSub.hi !== -Infinity, "interval upper bound cannot be -Infinity");
        });
    });
    it("mul", () => {
        allIntervalsPairs.forEach(([x, y]) => {
            const resultMulUnion = nsf.imul(x, y);
            assert.ok(resultMulUnion.intervals.length === 1);
            const resultMul = resultMulUnion.intervals[0];
            assert.ok(
                !isNaN(resultMul.lo) && !isNaN(resultMul.hi),
                `nsf.imul(x, y) produced ${resultMul} for inputs x = ${x} y = ${y}`
            );
            assert.ok(resultMul.lo !== Infinity, "interval lower bound cannot be Infinity");
            assert.ok(resultMul.hi !== -Infinity, "interval upper bound cannot be -Infinity");
        });
    });
    it("div", () => {
        allIntervalsPairs.forEach(([x, y]) => {
            const resultDiv = nsf.idiv(x, y);
            resultDiv.forEach((i) => {
                assert.ok(
                    !isNaN(i.lo) && !isNaN(i.hi),
                    `nsf.idiv(x, y) produced ${i} for inputs x = ${x} y = ${y}`
                );
            });
            resultDiv.forEach((i) => {
                assert.ok(i.lo !== Infinity, "interval lower bound cannot be Infinity");
                assert.ok(i.hi !== -Infinity, "interval upper bound cannot be -Infinity");
            });
        });
    });
});

describe("arithmetic operators have the inclusion property", () => {
    it("add", () => {
        allIntervalsPairs.forEach(([X, Y]) => {
            const xSamples: number[] = sampleInterval(X, 5);
            const ySamples: number[] = sampleInterval(Y, 5);
            const intervalResultUnion = nsf.iadd(X, Y);
            assert.ok(intervalResultUnion.intervals.length === 1);
            const intervalResult = intervalResultUnion.intervals[0];

            xSamples.forEach((x) => {
                ySamples.forEach((y) => {
                    const realResult = x + y;
                    assert.ok(
                        intervalResult.contains(realResult),
                        `${x} + ${y} = ${realResult} is not in output of nsf.iadd(X, Y) = ${intervalResult} for inputs X = ${X} Y = ${Y}`
                    );
                });
            });
        });
    });

    it("sub", () => {
        allIntervalsPairs.forEach(([X, Y]) => {
            const xSamples: number[] = sampleInterval(X, 5);
            const ySamples: number[] = sampleInterval(Y, 5);
            const intervalResultUnion = nsf.isub(X, Y);
            assert.ok(intervalResultUnion.intervals.length === 1);
            const intervalResult = intervalResultUnion.intervals[0];

            xSamples.forEach((x) => {
                ySamples.forEach((y) => {
                    const realResult = x - y;
                    assert.ok(
                        intervalResult.contains(realResult),
                        `${x} - ${y} = ${realResult} is not in output of nsf.isub(X, Y) = ${intervalResult} for inputs X = ${X} Y = ${Y}`
                    );
                });
            });
        });
    });

    it("mul", () => {
        allIntervalsPairs.forEach(([X, Y]) => {
            const xSamples: number[] = sampleInterval(X, 5);
            const ySamples: number[] = sampleInterval(Y, 5);
            const intervalResultUnion = nsf.imul(X, Y);
            assert.ok(intervalResultUnion.intervals.length === 1);
            const intervalResult = intervalResultUnion.intervals[0];

            xSamples.forEach((x) => {
                ySamples.forEach((y) => {
                    const realResult = x * y;
                    assert.ok(
                        intervalResult.contains(realResult),
                        `${x} * ${y} = ${realResult} is not in output of nsf.imul(X, Y) = ${intervalResult} for inputs X = ${X} Y = ${Y}`
                    );
                });
            });
        });
    });

    it("div", () => {
        allIntervalsPairs.forEach(([X, Y]) => {
            const xSamples: number[] = sampleInterval(X, 5);
            const ySamples: number[] = sampleInterval(Y, 5);
            const resultArray = nsf.idiv(X, Y).intervals;

            xSamples.forEach((x) => {
                ySamples.forEach((y) => {
                    if (y !== 0) {
                        const realResult = x / y;
                        assert.ok(resultArray.length <= 2);
                        assert.ok(
                            resultArray.some((i) => i.contains(realResult)),
                            `${x} / ${y} = ${realResult} is not in output of nsf.idiv(X, Y) = ${resultArray} for inputs X = ${X} Y = ${Y}`
                        );
                    }
                });
            });
        });
    });
});

describe("overflow tests", () => {
    const M = Number.MAX_VALUE;
    it("add", () => {
        equal(nsf.iadd(int(0, M), int(0, 1e300)), uint(0, inf));
        equal(nsf.iadd(int(M, M), int(M, M)), uint(M, inf));
    });

    it("sub", () => {
        equal(nsf.isub(int(0, M), int(-1e300, 0)), uint(0, inf));
        equal(nsf.isub(int(M, M), int(-M, -M)), uint(M, inf));
    });

    it("mul", () => {
        equal(nsf.imul(int(0, M), int(0, 10)), uint(0, inf));
    });

    it("div", () => {
        equal(nsf.idiv(int(0, M), int(0.5, 0.9)), uint(0, inf));
    });
});
