import { describe, it } from "node:test";
import assert from "node:assert";

import {
    single,
    interval,
    prev,
    next,
    union,
    powInt,
    powIntInv,
    Union,
    abs,
    pow,
    mul,
    sqrt,
    min,
    max,
    EMPTY,
    FULL,
    log,
    exp,
    sqinv,
} from "../src/index.ts";

const int = interval;
const uint = single;
const inf = Infinity;
const eq = (a: Union, b: Union) => assert.deepEqual(a, b);

describe("math functions", () => {
    it("abs", () => {
        eq(abs(uint(1, 6)), uint(1, 6));
        eq(abs(uint(-10, -6)), uint(6, 10));
        eq(abs(uint(-10, 6)), uint(0, 10));
    });

    it("min/max", () => {
        eq(min(uint(1, 6), uint(4, 5)), uint(1, 5));
        eq(max(uint(1, 6), uint(4, 5)), uint(4, 6));
    });

    it("exp", () => {
        eq(exp(uint(-inf, 0)), uint(0, 1));
        eq(exp(uint(0, 1)), uint(1, next(Math.E)));
    });

    it("log", () => {
        eq(log(uint(-inf, 0)), EMPTY);
        eq(log(uint(0, 1)), uint(-inf, 0));
        eq(log(uint(1, 2)), uint(0, next(Math.log(2))));
    });

    it("powInt (n=0)", () => {
        eq(powInt(EMPTY, 0), EMPTY); // empty
        eq(powInt(FULL, 0), uint(1, 1)); // full
        eq(powInt(uint(-10, -10), 0), uint(1, 1)); // single negative
        eq(powInt(uint(0, 0), 0), uint(1, 1)); // single zero
        eq(powInt(uint(10, 10), 0), uint(1, 1)); // single positive
        eq(powInt(uint(-10, -5), 0), uint(1, 1)); // strictly negative
        eq(powInt(uint(-10, 0), 0), uint(1, 1)); // negative and zero
        eq(powInt(uint(-10, 10), 0), uint(1, 1)); // both positive and negative
        eq(powInt(uint(0, 10), 0), uint(1, 1)); // positive and zero
        eq(powInt(uint(5, 10), 0), uint(1, 1)); // strictly positive
    });

    it("powInt (n=1)", () => {
        eq(powInt(EMPTY, 1), EMPTY); // empty
        eq(powInt(FULL, 1), FULL); // full
        eq(powInt(uint(-10, -10), 1), uint(-10, -10)); // single negative
        eq(powInt(uint(0, 0), 1), uint(0, 0)); // single zero
        eq(powInt(uint(10, 10), 1), uint(10, 10)); // single positive
        eq(powInt(uint(-10, -5), 1), uint(-10, -5)); // strictly negative
        eq(powInt(uint(-10, 0), 1), uint(-10, 0)); // negative and zero
        eq(powInt(uint(-10, 10), 1), uint(-10, 10)); // both positive and negative
        eq(powInt(uint(0, 10), 1), uint(0, 10)); // positive and zero
        eq(powInt(uint(5, 10), 1), uint(5, 10)); // strictly positive
    });

    it("powInt (n=2)", () => {
        eq(powInt(EMPTY, 2), EMPTY); // empty
        eq(powInt(FULL, 2), uint(0, inf)); // full
        eq(powInt(uint(-10, -10), 2), uint(prev(100), next(100))); // single negative
        eq(powInt(uint(0, 0), 2), uint(0, 0)); // single zero
        eq(powInt(uint(10, 10), 2), uint(prev(100), next(100))); // single positive
        eq(powInt(uint(-10, -5), 2), uint(prev(25), next(100))); // strictly negative
        eq(powInt(uint(-10, 0), 2), uint(0, next(100))); // negative and zero
        eq(powInt(uint(-10, 10), 2), uint(0, next(100))); // both positive and negative
        eq(powInt(uint(0, 10), 2), uint(0, next(100))); // positive and zero
        eq(powInt(uint(5, 10), 2), uint(prev(25), next(100))); // strictly positive
    });

    it("powInt (n=3)", () => {
        eq(powInt(EMPTY, 3), EMPTY); // empty
        eq(powInt(FULL, 3), FULL); // full
        eq(powInt(uint(-10, -10), 3), uint(prev(-1000), next(-1000))); // single negative
        eq(powInt(uint(0, 0), 3), uint(0, 0)); // single zero
        eq(powInt(uint(10, 10), 3), uint(prev(1000), next(1000))); // single positive
        eq(powInt(uint(-10, -5), 3), uint(prev(-1000), next(-125))); // strictly negative
        eq(powInt(uint(-10, 0), 3), uint(prev(-1000), 0)); // negative and zero
        eq(powInt(uint(-10, 10), 3), uint(prev(-1000), next(1000))); // both positive and negative
        eq(powInt(uint(0, 10), 3), uint(0, next(1000))); // positive and zero
        eq(powInt(uint(5, 10), 3), uint(prev(125), next(1000))); // strictly positive
    });

    it("powInt (n=-1)", () => {
        eq(powInt(EMPTY, -1), EMPTY); // empty
        eq(powInt(FULL, -1), FULL); // full
        eq(powInt(uint(-10, -10), -1), uint(prev(-1 / 10), next(-1 / 10))); // single negative
        eq(powInt(uint(0, 0), -1), EMPTY); // single zero
        eq(powInt(uint(10, 10), -1), uint(prev(1 / 10), next(1 / 10))); // single positive
        eq(powInt(uint(-10, -5), -1), uint(prev(1 / -5), next(1 / -10))); // strictly negative
        eq(powInt(uint(-10, 0), -1), uint(-inf, next(1 / -10))); // negative and zero
        eq(powInt(uint(-10, 10), -1), union([uint(-inf, next(1 / -10)), uint(prev(1 / 10), inf)])); // both positive and negative
        eq(powInt(uint(0, 10), -1), uint(prev(1 / 10), inf)); // positive and zero
        eq(powInt(uint(5, 10), -1), uint(prev(1 / 10), next(1 / 5))); // strictly positive
    });

    it("powInt (n=-2)", () => {
        eq(powInt(EMPTY, -2), EMPTY); // empty
        eq(powInt(FULL, -2), uint(0, inf)); // full
        eq(powInt(uint(-10, -10), -2), uint(prev(1 / next(100)), next(1 / prev(100)))); // single negative
        eq(powInt(uint(0, 0), -2), EMPTY); // single zero
        eq(powInt(uint(10, 10), -2), uint(prev(1 / next(100)), next(1 / prev(100)))); // single positive
        eq(powInt(uint(-10, -5), -2), uint(prev(1 / next(100)), next(1 / prev(25)))); // strictly negative
        eq(powInt(uint(-10, 0), -2), uint(prev(1 / next(100)), inf)); // negative and zero
        eq(powInt(uint(-10, 10), -2), uint(prev(1 / next(100)), inf)); // both positive and negative
        eq(powInt(uint(0, 10), -2), uint(prev(1 / next(100)), inf)); // positive and zero
        eq(powInt(uint(5, 10), -2), uint(prev(1 / next(100)), next(1 / prev(25)))); // strictly positive
    });

    it("powInt (n=-3)", () => {
        eq(powInt(EMPTY, -3), EMPTY); // empty
        eq(powInt(FULL, -3), FULL); // full
        eq(powInt(uint(-10, -10), -3), uint(prev(1 / next(-1000)), next(1 / prev(-1000)))); // single negative
        eq(powInt(uint(0, 0), -3), EMPTY); // single zero
        eq(powInt(uint(10, 10), -3), uint(prev(1 / next(1000)), next(1 / prev(1000)))); // single positive
        eq(powInt(uint(-10, -5), -3), uint(prev(1 / next(-125)), next(1 / prev(-1000)))); // strictly negative
        eq(powInt(uint(-10, 0), -3), uint(-inf, next(1 / prev(-1000)))); // negative and zero
        eq(
            powInt(uint(-10, 10), -3),
            union([uint(-inf, next(1 / prev(-1000))), uint(prev(1 / next(1000)), inf)])
        ); // both positive and negative
        eq(powInt(uint(0, 10), -3), uint(prev(1 / next(1000)), inf)); // positive and zero
        eq(powInt(uint(5, 10), -3), uint(prev(1 / next(1000)), next(1 / prev(125)))); // strictly positive
    });

    it("pow (union exponent)", () => {
        const zero = uint(0, 0);
        const one = uint(1, 1);

        // Strictly negative base
        eq(pow(uint(-10, -5), uint(-inf, -1)), EMPTY);
        eq(pow(uint(-10, -5), uint(-2, -1)), EMPTY);
        eq(pow(uint(-10, -5), uint(-1, -1)), EMPTY);
        eq(pow(uint(-10, -5), uint(-1, 0)), EMPTY);
        eq(pow(uint(-10, -5), uint(0, 0)), EMPTY);
        eq(pow(uint(-10, -5), uint(-1, 1)), EMPTY);
        eq(pow(uint(-10, -5), uint(0, 1)), EMPTY);
        eq(pow(uint(-10, -5), uint(1, 1)), EMPTY);
        eq(pow(uint(-10, -5), uint(1, 2)), EMPTY);
        eq(pow(uint(-10, -5), uint(1, inf)), EMPTY);
        eq(pow(uint(-10, -5), uint(-inf, inf)), EMPTY);

        // Negative or zero base
        eq(pow(uint(-10, 0), uint(-inf, -1)), zero);
        eq(pow(uint(-10, 0), uint(-2, -1)), zero);
        eq(pow(uint(-10, 0), uint(-1, -1)), zero);
        eq(pow(uint(-10, 0), uint(-1, 0)), union([zero, one]));
        eq(pow(uint(-10, 0), uint(0, 0)), one);
        eq(pow(uint(-10, 0), uint(-1, 1)), union([zero, one]));
        eq(pow(uint(-10, 0), uint(0, 1)), union([zero, one]));
        eq(pow(uint(-10, 0), uint(1, 1)), zero);
        eq(pow(uint(-10, 0), uint(1, 2)), zero);
        eq(pow(uint(-10, 0), uint(1, inf)), zero);
        eq(pow(uint(-10, 0), uint(-inf, inf)), union([zero, one]));

        // Degenerate zero base
        eq(pow(zero, uint(-inf, -1)), zero);
        eq(pow(zero, uint(-2, -1)), zero);
        eq(pow(zero, uint(-1, -1)), zero);
        eq(pow(zero, uint(-1, 0)), union([zero, one]));
        eq(pow(zero, uint(0, 0)), one);
        eq(pow(zero, uint(-1, 1)), union([zero, one]));
        eq(pow(zero, uint(0, 1)), union([zero, one]));
        eq(pow(zero, uint(1, 1)), zero);
        eq(pow(zero, uint(1, 2)), zero);
        eq(pow(zero, uint(1, inf)), zero);
        eq(pow(zero, uint(-inf, inf)), union([zero, one]));

        // Mixed base
        eq(
            pow(uint(-2, 2), uint(-inf, -1)),
            union([zero, exp(mul(uint(-inf, -1), log(uint(0, 2))))])
        );
        eq(pow(uint(-2, 2), uint(-2, -1)), union([zero, exp(mul(uint(-2, -1), log(uint(0, 2))))]));
        eq(pow(uint(-2, 2), uint(-1, -1)), union([zero, exp(mul(uint(-1, -1), log(uint(0, 2))))]));
        eq(
            pow(uint(-2, 2), uint(-1, 0)),
            union([zero, one, exp(mul(uint(-1, 0), log(uint(0, 2))))])
        );
        eq(pow(uint(-2, 2), uint(0, 0)), one);
        eq(
            pow(uint(-2, 2), uint(-1, 1)),
            union([zero, one, exp(mul(uint(-1, 1), log(uint(0, 2))))])
        );
        eq(pow(uint(-2, 2), uint(0, 1)), union([zero, one, exp(mul(uint(0, 1), log(uint(0, 2))))]));
        eq(pow(uint(-2, 2), uint(1, 1)), union([zero, exp(mul(uint(1, 1), log(uint(0, 2))))]));
        eq(pow(uint(-2, 2), uint(1, 2)), union([zero, exp(mul(uint(1, 2), log(uint(0, 2))))]));
        eq(pow(uint(-2, 2), uint(1, inf)), union([zero, exp(mul(uint(1, inf), log(uint(0, 2))))]));
        eq(
            pow(uint(-2, 2), uint(-inf, inf)),
            union([zero, one, exp(mul(uint(-inf, inf), log(uint(0, 2))))])
        );

        // Positive or zero base
        eq(
            pow(uint(0, 2), uint(-inf, -1)),
            union([zero, exp(mul(uint(-inf, -1), log(uint(0, 2))))])
        );
        eq(pow(uint(0, 2), uint(-2, -1)), union([zero, exp(mul(uint(-2, -1), log(uint(0, 2))))]));
        eq(pow(uint(0, 2), uint(-1, -1)), union([zero, exp(mul(uint(-1, -1), log(uint(0, 2))))]));
        eq(
            pow(uint(0, 2), uint(-1, 0)),
            union([zero, one, exp(mul(uint(-1, 0), log(uint(0, 2))))])
        );
        eq(pow(uint(0, 2), uint(0, 0)), one);
        eq(
            pow(uint(0, 2), uint(-1, 1)),
            union([zero, one, exp(mul(uint(-1, 1), log(uint(0, 2))))])
        );
        eq(pow(uint(0, 2), uint(0, 1)), union([zero, one, exp(mul(uint(0, 1), log(uint(0, 2))))]));
        eq(pow(uint(0, 2), uint(1, 1)), union([zero, exp(mul(uint(1, 1), log(uint(0, 2))))]));
        eq(pow(uint(0, 2), uint(1, 2)), union([zero, exp(mul(uint(1, 2), log(uint(0, 2))))]));
        eq(pow(uint(0, 2), uint(1, inf)), union([zero, exp(mul(uint(1, inf), log(uint(0, 2))))]));
        eq(
            pow(uint(0, 2), uint(-inf, inf)),
            union([zero, one, exp(mul(uint(-inf, inf), log(uint(0, 2))))])
        );

        // Strictly positive base
        eq(pow(uint(1, 2), uint(-inf, -1)), union([exp(mul(uint(-inf, -1), log(uint(1, 2))))]));
        eq(pow(uint(1, 2), uint(-2, -1)), union([exp(mul(uint(-2, -1), log(uint(1, 2))))]));
        eq(pow(uint(1, 2), uint(-1, -1)), union([exp(mul(uint(-1, -1), log(uint(1, 2))))]));
        eq(pow(uint(1, 2), uint(-1, 0)), union([one, exp(mul(uint(-1, 0), log(uint(1, 2))))]));
        eq(pow(uint(1, 2), uint(0, 0)), one);
        eq(pow(uint(1, 2), uint(-1, 1)), union([one, exp(mul(uint(-1, 1), log(uint(1, 2))))]));
        eq(pow(uint(1, 2), uint(0, 1)), union([one, exp(mul(uint(0, 1), log(uint(1, 2))))]));
        eq(pow(uint(1, 2), uint(1, 1)), union([exp(mul(uint(1, 1), log(uint(1, 2))))]));
        eq(pow(uint(1, 2), uint(1, 2)), union([exp(mul(uint(1, 2), log(uint(1, 2))))]));
        eq(pow(uint(1, 2), uint(1, inf)), union([exp(mul(uint(1, inf), log(uint(1, 2))))]));
        eq(
            pow(uint(1, 2), uint(-inf, inf)),
            union([one, exp(mul(uint(-inf, inf), log(uint(1, 2))))])
        );
    });

    it("sqrt", () => {
        eq(sqrt(uint(-inf, 0)), uint(0, 0));
        eq(sqrt(uint(0, 1)), uint(0, 1));
        eq(sqrt(uint(1, 2)), uint(1, next(Math.sqrt(2))));
    });

    it("sqinv", () => {
        eq(sqinv(uint(0, 64)), union([int(prev(-8), next(8))]));

        eq(sqinv(uint(4, 64)), union([int(prev(-8), next(-2)), int(prev(2), next(8))]));

        eq(sqinv(uint(-10, -5)), EMPTY);
        eq(sqinv(uint(-10, 0)), uint(0, 0));
    });

    it("powIntInv (n=0)", () => {
        const n = 0;
        const one = uint(1, 1);

        // empty and full
        eq(powIntInv(EMPTY, n), EMPTY);
        eq(powIntInv(FULL, n), FULL);
        eq(powIntInv(uint(0, inf), n), FULL);
        eq(powIntInv(uint(1, inf), n), FULL);
        eq(powIntInv(uint(-inf, 0), n), EMPTY);
        eq(powIntInv(uint(-inf, -1), n), EMPTY);

        // Degenerate
        eq(powIntInv(uint(0, 0), n), EMPTY);
        eq(powIntInv(uint(1, 1), n), FULL);
        eq(powIntInv(uint(-1, -1), n), EMPTY);
        eq(powIntInv(uint(2, 2), n), EMPTY);

        // Strictly positive
        eq(powIntInv(uint(25, 49), n), EMPTY);

        // Strictly negative
        eq(powIntInv(uint(-49, -25), n), EMPTY);

        // Positive touching zero
        eq(powIntInv(uint(0, 49), n), FULL);

        // Negative touching zero
        eq(powIntInv(uint(-49, 0), n), EMPTY);

        // Mixed: non degenerate containing zero
        eq(powIntInv(uint(-25, 49), n), FULL);
        eq(powIntInv(uint(-49, 25), n), FULL);

        // union
        eq(powIntInv(union([int(25, 49), int(100, 10000), int(-49, -25)]), n), EMPTY);
    });

    it("powIntInv (n=1)", () => {
        const n = 1;

        // empty and full
        eq(powIntInv(EMPTY, n), EMPTY);
        eq(powIntInv(FULL, n), FULL);
        eq(powIntInv(uint(0, inf), n), uint(0, inf));
        eq(powIntInv(uint(1, inf), n), uint(1, inf));
        eq(powIntInv(uint(-inf, 0), n), uint(-inf, 0));
        eq(powIntInv(uint(-inf, -1), n), uint(-inf, -1));

        // Degenerate 0, 1, -1
        eq(powIntInv(uint(0, 0), n), uint(0, 0));
        eq(powIntInv(uint(1, 1), n), uint(1, 1));
        eq(powIntInv(uint(-1, -1), n), uint(-1, -1));

        // Strictly positive
        eq(powIntInv(uint(25, 49), n), uint(25, 49));

        // Strictly negative
        eq(powIntInv(uint(-49, -25), n), uint(-49, -25));

        // Positive touching zero
        eq(powIntInv(uint(0, 49), n), uint(0, 49));

        // Negative touching zero
        eq(powIntInv(uint(-49, 0), n), uint(-49, 0));

        // Mixed: non degenerate containing zero
        eq(powIntInv(uint(-25, 49), n), uint(-25, 49));
        eq(powIntInv(uint(-49, 25), n), uint(-49, 25));

        // union
        eq(
            powIntInv(union([int(25, 49), int(100, 10000), int(-49, -25)]), n),
            union([int(25, 49), int(100, 10000), int(-49, -25)])
        );
    });

    it("powIntInv (n=2)", () => {
        const n = 2;

        // empty and full
        eq(powIntInv(EMPTY, n), EMPTY);
        eq(powIntInv(FULL, n), FULL);
        eq(powIntInv(uint(0, inf), n), FULL);
        eq(powIntInv(uint(1, inf), n), union([int(1, inf), int(-inf, -1)]));
        eq(powIntInv(uint(-inf, 0), n), uint(0, 0));
        eq(powIntInv(uint(-inf, -1), n), EMPTY);

        // Degenerate 0, 1, -1
        eq(powIntInv(uint(0, 0), n), uint(0, 0));
        eq(powIntInv(uint(1, 1), n), union([int(1, 1), int(-1, -1)]));
        eq(powIntInv(uint(-1, -1), n), EMPTY);

        // Strictly positive
        eq(
            powIntInv(uint(25, 49), n),
            union([
                int(prev(Math.pow(25, prev(1 / 2))), next(Math.pow(49, next(1 / 2)))),
                int(prev(-Math.pow(49, next(1 / 2))), next(-Math.pow(25, prev(1 / 2)))),
            ])
        );

        // Strictly negative
        eq(powIntInv(uint(-49, -25), n), EMPTY);

        // Positive touching zero
        eq(
            powIntInv(uint(0, 49), n),
            union([int(prev(-Math.pow(49, next(1 / 2))), next(Math.pow(49, next(1 / 2))))])
        );

        // Negative touching zero
        eq(powIntInv(uint(-49, 0), n), uint(0, 0));

        // Mixed: non degenerate containing zero
        eq(
            powIntInv(uint(-25, 49), n),
            union([int(prev(-Math.pow(49, next(1 / 2))), next(Math.pow(49, next(1 / 2))))])
        );
        eq(
            powIntInv(uint(-49, 25), n),
            union([int(prev(-Math.pow(25, next(1 / 2))), next(Math.pow(25, next(1 / 2))))])
        );

        // union
        eq(
            powIntInv(union([int(25, 49), int(100, 10000), int(-49, -25)]), n),
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
        eq(powIntInv(EMPTY, n), EMPTY);
        eq(powIntInv(FULL, n), FULL);

        // Degenerate 0, 1, -1
        eq(powIntInv(uint(0, 0), n), uint(0, 0));
        eq(powIntInv(uint(1, 1), n), uint(1, 1));
        eq(powIntInv(uint(-1, -1), n), uint(-1, -1));

        // Strictly positive
        eq(
            powIntInv(uint(8, 27), n),
            union([int(prev(Math.pow(8, prev(1 / 3))), next(Math.pow(27, next(1 / 3))))])
        );

        // Strictly negative
        eq(
            powIntInv(uint(-27, -8), n),
            union([int(prev(-Math.pow(27, next(1 / 3))), next(-Math.pow(8, prev(1 / 3))))])
        );

        // Positive touching zero
        eq(powIntInv(uint(0, 27), n), union([int(0, next(Math.pow(27, next(1 / 3))))]));

        // Negative touching zero
        eq(powIntInv(uint(-27, 0), n), union([int(prev(-Math.pow(27, next(1 / 3))), 0)]));

        // Mixed: non degenerate containing zero
        eq(
            powIntInv(uint(-8, 27), n),
            union([int(prev(-Math.pow(8, next(1 / 3))), next(Math.pow(27, next(1 / 3))))])
        );

        // union
        eq(
            powIntInv(union([int(8, 27), int(-27, -8)]), n),
            union([
                int(prev(Math.pow(8, prev(1 / 3))), next(Math.pow(27, next(1 / 3)))),
                int(prev(-Math.pow(27, next(1 / 3))), next(-Math.pow(8, prev(1 / 3)))),
            ])
        );
    });

    it("powIntInv (n=-1)", () => {
        const n = -1;

        // empty and full
        eq(powIntInv(EMPTY, n), EMPTY);
        eq(powIntInv(FULL, n), FULL);
        eq(powIntInv(uint(0, inf), n), uint(0, inf));
        eq(powIntInv(uint(1, inf), n), uint(0, 1));
        eq(powIntInv(uint(-inf, 0), n), uint(-inf, 0));
        eq(powIntInv(uint(-inf, -1), n), uint(-1, 0));

        // Degenerate 0, 1, -1
        eq(powIntInv(uint(0, 0), n), EMPTY);
        eq(powIntInv(uint(1, 1), n), uint(1, 1));
        eq(powIntInv(uint(-1, -1), n), uint(-1, -1));

        // Strictly positive
        eq(powIntInv(uint(25, 49), n), uint(prev(1 / 49), next(1 / 25)));

        // Strictly negative
        eq(powIntInv(uint(-49, -25), n), uint(prev(1 / -25), next(1 / -49)));

        // Positive touching zero
        eq(powIntInv(uint(0, 49), n), uint(prev(1 / 49), inf));

        // Negative touching zero
        eq(powIntInv(uint(-49, 0), n), uint(-inf, next(1 / -49)));

        // Mixed: non degenerate containing zero
        eq(powIntInv(uint(-25, 49), n), union([int(-inf, next(1 / -25)), int(prev(1 / 49), inf)]));
        eq(powIntInv(uint(-49, 25), n), union([int(-inf, next(1 / -49)), int(prev(1 / 25), inf)]));

        // union
        eq(
            powIntInv(union([int(25, 49), int(100, 10000), int(-49, -25)]), n),
            union([
                int(prev(1 / 49), next(1 / 25)),
                int(prev(1 / 10000), next(1 / 100)),
                int(prev(1 / -25), next(1 / -49)),
            ])
        );
    });

    it("powIntInv (n=-2)", () => {
        const n = -2;

        // empty and full
        eq(powIntInv(EMPTY, n), EMPTY);
        eq(powIntInv(FULL, n), FULL);
        eq(powIntInv(uint(0, inf), n), FULL);
        eq(powIntInv(uint(1, inf), n), union([int(-1, 1)]));
        eq(powIntInv(uint(-inf, 0), n), EMPTY);
        eq(powIntInv(uint(-inf, -1), n), EMPTY);

        // Degenerate 0, 1, -1
        eq(powIntInv(uint(0, 0), n), EMPTY);
        eq(powIntInv(uint(1, 1), n), union([int(-1, -1), int(1, 1)]));
        eq(powIntInv(uint(-1, -1), n), EMPTY);

        // Strictly positive
        eq(
            powIntInv(uint(25, 49), n),
            union([
                int(
                    prev(1 / next(Math.pow(49, next(1 / 2)))),
                    next(1 / prev(Math.pow(25, prev(1 / 2))))
                ),
                int(
                    prev(1 / next(-Math.pow(25, prev(1 / 2)))),
                    next(1 / prev(-Math.pow(49, next(1 / 2))))
                ),
            ])
        );

        // Strictly negative
        eq(powIntInv(uint(-49, -25), n), EMPTY);

        // Positive touching zero
        eq(
            powIntInv(uint(0, 49), n),
            union([
                int(-inf, next(1 / prev(-Math.pow(49, next(1 / 2))))),
                int(prev(1 / next(Math.pow(49, next(1 / 2)))), inf),
            ])
        );

        // Negative touching zero
        eq(powIntInv(uint(-49, 0), n), EMPTY);

        // Mixed: non degenerate containing zero
        eq(
            powIntInv(uint(-25, 49), n),
            union([
                int(-inf, next(1 / prev(-Math.pow(49, next(1 / 2))))),
                int(prev(1 / next(Math.pow(49, next(1 / 2)))), inf),
            ])
        );

        // union
        eq(
            powIntInv(union([int(25, 49), int(100, 10000), int(-49, -25)]), n),
            union([
                int(
                    prev(1 / next(Math.pow(49, next(1 / 2)))),
                    next(1 / prev(Math.pow(25, prev(1 / 2))))
                ),
                int(
                    prev(1 / next(-Math.pow(25, prev(1 / 2)))),
                    next(1 / prev(-Math.pow(49, next(1 / 2))))
                ),
                int(
                    prev(1 / next(Math.pow(10000, next(1 / 2)))),
                    next(1 / prev(Math.pow(100, prev(1 / 2))))
                ),
                int(
                    prev(1 / next(-Math.pow(100, prev(1 / 2)))),
                    next(1 / prev(-Math.pow(10000, next(1 / 2))))
                ),
            ])
        );
    });

    it("powIntInv (n=-3)", () => {
        const n = -3;

        // empty and full
        eq(powIntInv(EMPTY, n), EMPTY);
        eq(powIntInv(FULL, n), FULL);
        eq(powIntInv(uint(0, inf), n), uint(0, inf));
        eq(powIntInv(uint(1, inf), n), uint(0, 1));
        eq(powIntInv(uint(-inf, 0), n), uint(-inf, 0));
        eq(powIntInv(uint(-inf, -1), n), uint(-1, 0));

        // Degenerate 0, 1, -1
        eq(powIntInv(uint(0, 0), n), EMPTY);
        eq(powIntInv(uint(1, 1), n), uint(1, 1));
        eq(powIntInv(uint(-1, -1), n), uint(-1, -1));

        // Strictly positive
        eq(
            powIntInv(uint(25, 49), n),
            uint(
                prev(1 / next(Math.pow(49, next(1 / 3)))),
                next(1 / prev(Math.pow(25, prev(1 / 3))))
            )
        );

        // Strictly negative
        eq(
            powIntInv(uint(-49, -25), n),
            uint(
                prev(1 / next(-Math.pow(25, prev(1 / 3)))),
                next(1 / prev(-Math.pow(49, next(1 / 3))))
            )
        );

        // Positive touching zero
        eq(powIntInv(uint(0, 49), n), uint(prev(1 / next(Math.pow(49, next(1 / 3)))), inf));

        // Negative touching zero
        eq(powIntInv(uint(-49, 0), n), uint(-inf, next(1 / prev(-Math.pow(49, next(1 / 3))))));

        // Mixed: non degenerate containing zero
        eq(
            powIntInv(uint(-25, 49), n),
            union([
                int(-inf, next(1 / prev(-Math.pow(25, next(1 / 3))))),
                int(prev(1 / next(Math.pow(49, next(1 / 3)))), inf),
            ])
        );

        // union
        eq(
            powIntInv(union([int(25, 49), int(100, 10000), int(-49, -25)]), n),
            union([
                int(
                    prev(1 / next(Math.pow(49, next(1 / 3)))),
                    next(1 / prev(Math.pow(25, prev(1 / 3))))
                ),
                int(
                    prev(1 / next(Math.pow(10000, next(1 / 3)))),
                    next(1 / prev(Math.pow(100, prev(1 / 3))))
                ),
                int(
                    prev(1 / next(-Math.pow(25, prev(1 / 3)))),
                    next(1 / prev(-Math.pow(49, next(1 / 3))))
                ),
            ])
        );
    });
});
