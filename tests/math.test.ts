import { describe, it } from "node:test";
import assert from "node:assert";

import * as nsf from "../src/index.ts";
import { sampleInterval, sampleUnion } from "./testIntervals.ts";

const int = nsf.inter;
const uint = (a: number, b: number) => nsf.union([nsf.inter(a, b)]);
const inf = Infinity;
const prev = nsf.prev;
const next = nsf.next;
const union = nsf.union;

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

        assert.deepEqual(nsf.powInt(uint(5, 5), 0), uint(1, 1));
        assert.deepEqual(nsf.powInt(uint(-3, 5), 2), uint(0, next(25)));
        assert.deepEqual(nsf.powInt(uint(0, 5), 2), uint(0, next(25)));
        assert.deepEqual(nsf.powInt(uint(3, 5), 2), uint(prev(9), next(25)));
        assert.deepEqual(nsf.powInt(uint(-3, 1), 2), uint(0, next(9)));
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

    it("sqinv", () => {
        assert.deepEqual(nsf.sqinv(uint(0, 64)), union([int(prev(-8), next(8))]));

        assert.deepEqual(
            nsf.sqinv(uint(4, 64)),
            union([int(prev(-8), next(-2)), int(prev(2), next(8))])
        );

        assert.deepEqual(nsf.sqinv(uint(-10, -5)), nsf.EMPTY);
        assert.deepEqual(nsf.sqinv(uint(-10, 0)), uint(0, 0));
    });

    it("powIntInv (n=2)", () => {
        const n = 2;

        // empty and full
        assert.deepEqual(nsf.powIntInv(nsf.EMPTY, n), nsf.EMPTY);
        assert.deepEqual(nsf.powIntInv(nsf.FULL, n), nsf.UFULL);
        assert.deepEqual(nsf.powIntInv(uint(0, Infinity), n), nsf.UFULL);
        assert.deepEqual(
            nsf.powIntInv(uint(1, Infinity), n),
            union([int(1, Infinity), int(-Infinity, -1)])
        );
        assert.deepEqual(nsf.powIntInv(uint(-Infinity, 0), n), uint(0, 0));
        assert.deepEqual(nsf.powIntInv(uint(-Infinity, -1), n), nsf.EMPTY);

        // Degenerate 0, 1, -1
        assert.deepEqual(nsf.powIntInv(uint(0, 0), n), uint(0, 0));
        assert.deepEqual(nsf.powIntInv(uint(1, 1), n), union([int(1, 1), int(-1, -1)]));
        assert.deepEqual(nsf.powIntInv(uint(-1, -1), n), nsf.EMPTY);

        // Strictly positive
        assert.deepEqual(
            nsf.powIntInv(uint(25, 49), n),
            union([
                int(prev(Math.pow(25, prev(1 / 2))), next(Math.pow(49, next(1 / 2)))),
                int(prev(-Math.pow(49, next(1 / 2))), next(-Math.pow(25, prev(1 / 2)))),
            ])
        );

        // Strictly negative
        assert.deepEqual(nsf.powIntInv(uint(-49, -25), n), nsf.EMPTY);

        // Positive touching zero
        assert.deepEqual(
            nsf.powIntInv(uint(0, 49), n),
            union([int(prev(-Math.pow(49, next(1 / 2))), next(Math.pow(49, next(1 / 2))))])
        );

        // Negative touching zero
        assert.deepEqual(nsf.powIntInv(uint(-49, 0), n), uint(0, 0));

        // Mixed: non degenerate containing zero
        assert.deepEqual(
            nsf.powIntInv(uint(-25, 49), n),
            union([int(prev(-Math.pow(49, next(1 / 2))), next(Math.pow(49, next(1 / 2))))])
        );
        assert.deepEqual(
            nsf.powIntInv(uint(-49, 25), n),
            union([int(prev(-Math.pow(25, next(1 / 2))), next(Math.pow(25, next(1 / 2))))])
        );

        // union
        assert.deepEqual(
            nsf.powIntInv(union([int(25, 49), int(100, 10000), int(-49, -25)]), n),
            union([
                int(prev(Math.pow(25, prev(1 / 2))), next(Math.pow(49, next(1 / 2)))),
                int(prev(-Math.pow(49, next(1 / 2))), next(-Math.pow(25, prev(1 / 2)))),
                int(prev(Math.pow(100, prev(1 / 2))), next(Math.pow(10000, next(1 / 2)))),
                int(prev(-Math.pow(10000, next(1 / 2))), next(-Math.pow(100, prev(1 / 2)))),
            ])
        );
    });

    it("powIntInv (n=3)", () => {
        const n = 3;

        // empty and full
        assert.deepEqual(nsf.powIntInv(nsf.EMPTY, n), nsf.EMPTY);
        assert.deepEqual(nsf.powIntInv(nsf.FULL, n), nsf.UFULL);

        // Degenerate 0, 1, -1
        assert.deepEqual(nsf.powIntInv(uint(0, 0), n), uint(0, 0));
        assert.deepEqual(nsf.powIntInv(uint(1, 1), n), uint(1, 1));
        assert.deepEqual(nsf.powIntInv(uint(-1, -1), n), uint(-1, -1));

        // Strictly positive
        assert.deepEqual(
            nsf.powIntInv(uint(8, 27), n),
            union([int(prev(Math.pow(8, prev(1 / 3))), next(Math.pow(27, next(1 / 3))))])
        );

        // Strictly negative
        assert.deepEqual(
            nsf.powIntInv(uint(-27, -8), n),
            union([int(prev(-Math.pow(27, next(1 / 3))), next(-Math.pow(8, prev(1 / 3))))])
        );

        // Positive touching zero
        assert.deepEqual(
            nsf.powIntInv(uint(0, 27), n),
            union([int(0, next(Math.pow(27, next(1 / 3))))])
        );

        // Negative touching zero
        assert.deepEqual(
            nsf.powIntInv(uint(-27, 0), n),
            union([int(prev(-Math.pow(27, next(1 / 3))), 0)])
        );

        // Mixed: non degenerate containing zero
        assert.deepEqual(
            nsf.powIntInv(uint(-8, 27), n),
            union([int(prev(-Math.pow(8, next(1 / 3))), next(Math.pow(27, next(1 / 3))))])
        );

        // union
        assert.deepEqual(
            nsf.powIntInv(union([int(8, 27), int(-27, -8)]), n),
            union([
                int(prev(Math.pow(8, prev(1 / 3))), next(Math.pow(27, next(1 / 3)))),
                int(prev(-Math.pow(27, next(1 / 3))), next(-Math.pow(8, prev(1 / 3)))),
            ])
        );
    });
});
