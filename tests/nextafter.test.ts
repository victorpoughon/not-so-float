import { describe, it } from "node:test";
import assert from "node:assert";

import { next, prev } from "../src/index.ts";

const positiveFloats = [
    Number.MIN_VALUE * (Math.pow(2, 52) - 1),
    Math.pow(2, -1022),
    1e-300,
    1e-100,
    1e-10,
    0.0001,
    0.1,
    1.0,
    10.0,
    100.0,
    1e5,
    1e10,
    1e20,
    1e30,
];

describe("next and prev functions", () => {
    it("works with NaN", () => {
        assert(Number.isNaN(next(NaN)));
        assert(Number.isNaN(prev(NaN)));
    });

    it("works around Infinity and Number.MAX_VALUE", () => {
        assert.strictEqual(next(Infinity), Infinity);
        assert.strictEqual(next(-Infinity), -Number.MAX_VALUE);
        assert.strictEqual(prev(Infinity), Number.MAX_VALUE);
        assert.strictEqual(prev(-Infinity), -Infinity);
        assert.strictEqual(next(Number.MAX_VALUE), Infinity);
        assert.strictEqual(next(prev(Number.MAX_VALUE)), Number.MAX_VALUE);
        assert.strictEqual(prev(-Number.MAX_VALUE), -Infinity);
        assert.strictEqual(prev(next(-Number.MAX_VALUE)), -Number.MAX_VALUE);
    });

    it("works around zero", () => {
        assert.strictEqual(next(+0), Number.MIN_VALUE);
        assert.strictEqual(next(-0), Number.MIN_VALUE);
        assert.strictEqual(prev(+0), -Number.MIN_VALUE);
        assert.strictEqual(prev(-0), -Number.MIN_VALUE);

        assert.strictEqual(prev(Number.MIN_VALUE), +0);
        assert.strictEqual(next(-Number.MIN_VALUE), -0);

        assert.strictEqual(next(next(-Number.MIN_VALUE)), Number.MIN_VALUE);
        assert.strictEqual(prev(prev(Number.MIN_VALUE)), -Number.MIN_VALUE);

        assert.strictEqual(next(prev(0)), -0.0);
        assert.strictEqual(prev(next(0)), +0.0);
        assert.strictEqual(next(next(prev(prev(0)))), -0.0);
        assert.strictEqual(prev(prev(next(next(0)))), +0.0);
        assert.strictEqual(next(prev(next(prev(0)))), -0.0);
        assert.strictEqual(prev(next(prev(next(0)))), +0.0);
    });

    it("works for test floats", () => {
        positiveFloats.forEach((x) => {
            const nextPos = next(x);
            const prevPos = prev(x);
            const nextNeg = next(-x);
            const prevNeg = prev(-x);

            assert(isFinite(nextPos));
            assert(isFinite(prevPos));
            assert(isFinite(nextNeg));
            assert(isFinite(prevNeg));

            assert(nextPos > x);
            assert(nextNeg > -x);

            assert(prevPos < x);
            assert(prevNeg < -x);

            assert(nextPos > 0);
            assert(prevPos > 0);

            assert(nextNeg < 0);
            assert(prevNeg < 0);

            assert.strictEqual(prev(nextPos), x);
            assert.strictEqual(prev(nextNeg), -x);

            assert.strictEqual(next(prevPos), x);
            assert.strictEqual(next(prevNeg), -x);
        });
    });
});
