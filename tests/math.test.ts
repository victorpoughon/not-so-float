import { describe, it } from "node:test";
import assert from "node:assert";

import * as nsf from "../src/index.ts";
import { sampleInterval, sampleUnion } from "./testIntervals.ts";

const uint = (a: number, b: number) => nsf.union([nsf.inter(a, b)]);
const inf = Infinity;
const prev = nsf.prev;
const next = nsf.next;

describe("math functions", () => {
    it("abs", () => {
        assert.deepEqual(nsf.abs(uint(1, 6)), uint(1, 6));
        assert.deepEqual(nsf.abs(uint(-10, -6)), uint(6, 10));
        assert.deepEqual(nsf.abs(uint(-10, 6)), uint(0, 10));
    });

    it("min/max", () => {
        assert.deepEqual(nsf.min(uint(1, 6), uint(4, 5)), uint(1, 5));
        assert.deepEqual(nsf.max(uint(1, 6), uint(4, 5)), uint(4, 6));
    });

    it("exp", () => {
        assert.deepEqual(nsf.exp(uint(-inf, 0)), uint(0, 1));
        assert.deepEqual(nsf.exp(uint(0, 1)), uint(1, next(Math.E)));
    });

    it("log", () => {
        assert.deepEqual(nsf.log(uint(-inf, 0)), nsf.EMPTY);
        assert.deepEqual(nsf.log(uint(0, 1)), uint(-inf, 0));
        assert.deepEqual(nsf.log(uint(1, 2)), uint(0, next(Math.log(2))));
    });

    it("pow (int)", () => {
        assert.deepEqual(nsf.powInt(uint(-inf, 0), 2), uint(0, inf));
        assert.deepEqual(nsf.powInt(uint(-2, 2), 2), uint(0, next(4)));
        assert.deepEqual(nsf.powInt(uint(1, 2), 2), uint(prev(1), next(4)));

        assert.deepEqual(nsf.powInt(uint(-inf, 0), 3), uint(-inf, 0));
        assert.deepEqual(nsf.powInt(uint(-2, 2), 3), uint(prev(-8), next(8)));
        assert.deepEqual(nsf.powInt(uint(1, 2), 3), uint(prev(1), next(8)));
    });

    it("pow (interval/union)", () => {
        // TODO tough to test properly because it's implemented as the
        // composition of exp and log, which means multiple calls to prev/next.
    });

    it("sqrt", () => {
        assert.deepEqual(nsf.sqrt(uint(-inf, 0)), uint(0, 0));
        assert.deepEqual(nsf.sqrt(uint(0, 1)), uint(0, 1));
        assert.deepEqual(nsf.sqrt(uint(1, 2)), uint(1, next(Math.sqrt(2))));
    });
});
