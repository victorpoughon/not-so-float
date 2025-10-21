import { describe, it } from "node:test";
import assert from "node:assert";

// Public API
import * as nsf from "../src/index.ts";

// Internal functions
import { iadd, isub, imul, idiv } from "../src/arithmetic.ts";
import { interval } from "../src/interval.ts";

import { allIntervalsPairs, sampleInterval } from "./testIntervals.ts";

// Short names to make test cases easier to read
const int = interval;
const inf = Infinity;
const equal = assert.deepEqual;
const uint = nsf.single;

describe("arithmetic functions never produce invalid intervals", () => {
    it("add", () => {
        allIntervalsPairs.forEach(([x, y]) => {
            const resultAddUnion = iadd(x, y);
            assert(resultAddUnion.intervals.length === 1);
            const resultAdd = resultAddUnion.intervals[0];
            assert.ok(
                !isNaN(resultAdd.lo) && !isNaN(resultAdd.hi),
                `iadd(x, y) produced ${resultAdd} for inputs x = ${x} y = ${y}`
            );
            assert.ok(resultAdd.lo !== Infinity, "interval lower bound cannot be Infinity");
            assert.ok(resultAdd.hi !== -Infinity, "interval upper bound cannot be -Infinity");
        });
    });
    it("sub", () => {
        allIntervalsPairs.forEach(([x, y]) => {
            const resultSubUnion = isub(x, y);
            assert.ok(resultSubUnion.intervals.length === 1);
            const resultSub = resultSubUnion.intervals[0];
            assert.ok(
                !isNaN(resultSub.lo) && !isNaN(resultSub.hi),
                `isub(x, y) produced ${resultSub} for inputs x = ${x} y = ${y}`
            );
            assert.ok(resultSub.lo !== Infinity, "interval lower bound cannot be Infinity");
            assert.ok(resultSub.hi !== -Infinity, "interval upper bound cannot be -Infinity");
        });
    });
    it("mul", () => {
        allIntervalsPairs.forEach(([x, y]) => {
            const resultMulUnion = imul(x, y);
            assert.ok(resultMulUnion.intervals.length === 1);
            const resultMul = resultMulUnion.intervals[0];
            assert.ok(
                !isNaN(resultMul.lo) && !isNaN(resultMul.hi),
                `imul(x, y) produced ${resultMul} for inputs x = ${x} y = ${y}`
            );
            assert.ok(resultMul.lo !== Infinity, "interval lower bound cannot be Infinity");
            assert.ok(resultMul.hi !== -Infinity, "interval upper bound cannot be -Infinity");
        });
    });
    it("div", () => {
        allIntervalsPairs.forEach(([x, y]) => {
            const resultDiv = idiv(x, y);
            resultDiv.forEach((i) => {
                assert.ok(
                    !isNaN(i.lo) && !isNaN(i.hi),
                    `idiv(x, y) produced ${i} for inputs x = ${x} y = ${y}`
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
            const intervalResultUnion = iadd(X, Y);
            assert.ok(intervalResultUnion.intervals.length === 1);
            const intervalResult = intervalResultUnion.intervals[0];

            xSamples.forEach((x) => {
                ySamples.forEach((y) => {
                    const realResult = x + y;
                    assert.ok(
                        intervalResult.contains(realResult),
                        `${x} + ${y} = ${realResult} is not in output of iadd(X, Y) = ${intervalResult} for inputs X = ${X} Y = ${Y}`
                    );
                });
            });
        });
    });

    it("sub", () => {
        allIntervalsPairs.forEach(([X, Y]) => {
            const xSamples: number[] = sampleInterval(X, 5);
            const ySamples: number[] = sampleInterval(Y, 5);
            const intervalResultUnion = isub(X, Y);
            assert.ok(intervalResultUnion.intervals.length === 1);
            const intervalResult = intervalResultUnion.intervals[0];

            xSamples.forEach((x) => {
                ySamples.forEach((y) => {
                    const realResult = x - y;
                    assert.ok(
                        intervalResult.contains(realResult),
                        `${x} - ${y} = ${realResult} is not in output of isub(X, Y) = ${intervalResult} for inputs X = ${X} Y = ${Y}`
                    );
                });
            });
        });
    });

    it("mul", () => {
        allIntervalsPairs.forEach(([X, Y]) => {
            const xSamples: number[] = sampleInterval(X, 5);
            const ySamples: number[] = sampleInterval(Y, 5);
            const intervalResultUnion = imul(X, Y);
            assert.ok(intervalResultUnion.intervals.length === 1);
            const intervalResult = intervalResultUnion.intervals[0];

            xSamples.forEach((x) => {
                ySamples.forEach((y) => {
                    const realResult = x * y;
                    assert.ok(
                        intervalResult.contains(realResult),
                        `${x} * ${y} = ${realResult} is not in output of imul(X, Y) = ${intervalResult} for inputs X = ${X} Y = ${Y}`
                    );
                });
            });
        });
    });

    it("div", () => {
        allIntervalsPairs.forEach(([X, Y]) => {
            const xSamples: number[] = sampleInterval(X, 5);
            const ySamples: number[] = sampleInterval(Y, 5);
            const resultArray = idiv(X, Y).intervals;

            xSamples.forEach((x) => {
                ySamples.forEach((y) => {
                    if (y !== 0) {
                        const realResult = x / y;
                        assert.ok(resultArray.length <= 2);
                        assert.ok(
                            resultArray.some((i) => i.contains(realResult)),
                            `${x} / ${y} = ${realResult} is not in output of idiv(X, Y) = ${resultArray} for inputs X = ${X} Y = ${Y}`
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
        equal(iadd(int(0, M), int(0, 1e300)), uint(0, inf));
        equal(iadd(int(M, M), int(M, M)), uint(M, inf));
    });

    it("sub", () => {
        equal(isub(int(0, M), int(-1e300, 0)), uint(0, inf));
        equal(isub(int(M, M), int(-M, -M)), uint(M, inf));
    });

    it("mul", () => {
        equal(imul(int(0, M), int(0, 10)), uint(0, inf));
    });

    it("div", () => {
        equal(idiv(int(0, M), int(0.5, 0.9)), uint(0, inf));
    });
});
