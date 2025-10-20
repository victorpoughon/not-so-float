import { describe, it } from "node:test";
import { strictEqual, deepEqual, ok } from "node:assert";

import { Interval, interval, iadd, isub, imul, idiv, prev, next, union } from "../src/index.ts";

import { sampleInterval } from "./testIntervals.ts";

// Short names to make test cases easier to read
const int = interval;
const inf = Infinity;

describe("arithmetic tests", () => {
    it("add", () => {
        const eq = (X: Interval, Y: Interval, expected: Interval) => {
            // Verify result is expected
            deepEqual(iadd(X, Y), union([expected]));
            deepEqual(iadd(Y, X), union([expected]));

            // Verify the inclusion property
            sampleInterval(X, 5).forEach((x) => {
                sampleInterval(Y, 5).forEach((y) => {
                    const realResult = x + y;
                    ok(
                        expected.contains(realResult),
                        `${x} + ${y} = ${realResult} is not in output of nsf.add(X, Y) = ${expected} for inputs X = ${X} Y = ${Y}`
                    );
                });
            });
        };

        eq(int(0, 20), int(0, 20), int(0, next(40))); // P0 + P0
        eq(int(0, 20), int(0, +inf), int(0, +inf)); // P0 + P0+
        eq(int(0, 20), int(1, 2), int(1, next(22))); // P0 + P1
        eq(int(0, 20), int(10, +inf), int(10, +inf)); // P0 + P1+
        eq(int(0, 20), int(-50, 50), int(-50, next(70))); // P0 + M
        eq(int(0, 20), int(-inf, 50), int(-inf, next(70))); // P0 + M-
        eq(int(0, 20), int(-50, +inf), int(-50, +inf)); // P0 + M+
        eq(int(0, 20), int(-30, 0), int(-30, 20)); // P0 + N0
        eq(int(0, 20), int(-inf, 0), int(-inf, 20)); // P0 + N0-
        eq(int(0, 20), int(-5, -4), int(-5, next(16))); // P0 + N1
        eq(int(0, 20), int(-inf, -20), int(-inf, next(0))); // P0 + N1-
        eq(int(0, 20), int(-inf, +inf), int(-inf, +inf)); // P0 + FULL
        eq(int(0, 20), int(0, 0), int(0, 20)); // P0 + Z
        eq(int(0, +inf), int(0, +inf), int(0, +inf)); // P0+ + P0+
        eq(int(0, +inf), int(1, 2), int(1, +inf)); // P0+ + P1
        eq(int(0, +inf), int(10, +inf), int(10, +inf)); // P0+ + P1+
        eq(int(0, +inf), int(-50, 50), int(-50, +inf)); // P0+ + M
        eq(int(0, +inf), int(-inf, 50), int(-inf, +inf)); // P0+ + M-
        eq(int(0, +inf), int(-50, +inf), int(-50, +inf)); // P0+ + M+
        eq(int(0, +inf), int(-30, 0), int(-30, +inf)); // P0+ + N0
        eq(int(0, +inf), int(-inf, 0), int(-inf, +inf)); // P0+ + N0-
        eq(int(0, +inf), int(-5, -4), int(-5, +inf)); // P0+ + N1
        eq(int(0, +inf), int(-inf, -20), int(-inf, +inf)); // P0+ + N1-
        eq(int(0, +inf), int(-inf, +inf), int(-inf, +inf)); // P0+ + FULL
        eq(int(0, +inf), int(0, 0), int(0, +inf)); // P0+ + Z
        eq(int(1, 2), int(1, 2), int(prev(2), next(4))); // P1 + P1
        eq(int(1, 2), int(10, +inf), int(prev(11), +inf)); // P1 + P1+
        eq(int(1, 2), int(-50, 50), int(prev(-49), next(52))); // P1 + M
        eq(int(1, 2), int(-inf, 50), int(-inf, next(52))); // P1 + M-
        eq(int(1, 2), int(-50, +inf), int(prev(-49), +inf)); // P1 + M+
        eq(int(1, 2), int(-30, 0), int(prev(-29), 2)); // P1 + N0
        eq(int(1, 2), int(-inf, 0), int(-inf, 2)); // P1 + N0-
        eq(int(1, 2), int(-5, -4), int(prev(-4), next(-2))); // P1 + N1
        eq(int(1, 2), int(-inf, -20), int(-inf, next(-18))); // P1 + N1-
        eq(int(1, 2), int(-inf, +inf), int(-inf, +inf)); // P1 + FULL
        eq(int(1, 2), int(0, 0), int(1, 2)); // P1 + Z
        eq(int(10, +inf), int(10, +inf), int(prev(20), +inf)); // P1+ + P1+
        eq(int(10, +inf), int(-50, 50), int(prev(-40), +inf)); // P1+ + M
        eq(int(10, +inf), int(-inf, 50), int(-inf, +inf)); // P1+ + M-
        eq(int(10, +inf), int(-50, +inf), int(prev(-40), +inf)); // P1+ + M+
        eq(int(10, +inf), int(-30, 0), int(prev(-20), +inf)); // P1+ + N0
        eq(int(10, +inf), int(-inf, 0), int(-inf, +inf)); // P1+ + N0-
        eq(int(10, +inf), int(-5, -4), int(prev(5), +inf)); // P1+ + N1
        eq(int(10, +inf), int(-inf, -20), int(-inf, +inf)); // P1+ + N1-
        eq(int(10, +inf), int(-inf, +inf), int(-inf, +inf)); // P1+ + FULL
        eq(int(10, +inf), int(0, 0), int(10, +inf)); // P1+ + Z
        eq(int(-50, 50), int(-50, 50), int(prev(-100), next(100))); // M + M
        eq(int(-50, 50), int(-inf, 50), int(-inf, next(100))); // M + M-
        eq(int(-50, 50), int(-50, +inf), int(prev(-100), +inf)); // M + M+
        eq(int(-50, 50), int(-30, 0), int(prev(-80), 50)); // M + N0
        eq(int(-50, 50), int(-inf, 0), int(-inf, 50)); // M + N0-
        eq(int(-50, 50), int(-5, -4), int(prev(-55), next(46))); // M + N1
        eq(int(-50, 50), int(-inf, -20), int(-inf, next(30))); // M + N1-
        eq(int(-50, 50), int(-inf, +inf), int(-inf, +inf)); // M + FULL
        eq(int(-50, 50), int(0, 0), int(-50, 50)); // M + Z
        eq(int(-inf, 50), int(-inf, 50), int(-inf, next(100))); // M- + M-
        eq(int(-inf, 50), int(-50, +inf), int(-inf, +inf)); // M- + M+
        eq(int(-inf, 50), int(-30, 0), int(-inf, 50)); // M- + N0
        eq(int(-inf, 50), int(-inf, 0), int(-inf, 50)); // M- + N0-
        eq(int(-inf, 50), int(-5, -4), int(-inf, next(46))); // M- + N1
        eq(int(-inf, 50), int(-inf, -20), int(-inf, next(30))); // M- + N1-
        eq(int(-inf, 50), int(-inf, +inf), int(-inf, +inf)); // M- + FULL
        eq(int(-inf, 50), int(0, 0), int(-inf, 50)); // M- + Z
        eq(int(-50, +inf), int(-50, +inf), int(prev(-100), +inf)); // M+ + M+
        eq(int(-50, +inf), int(-30, 0), int(prev(-80), +inf)); // M+ + N0
        eq(int(-50, +inf), int(-inf, 0), int(-inf, +inf)); // M+ + N0-
        eq(int(-50, +inf), int(-5, -4), int(prev(-55), +inf)); // M+ + N1
        eq(int(-50, +inf), int(-inf, -20), int(-inf, +inf)); // M+ + N1-
        eq(int(-50, +inf), int(-inf, +inf), int(-inf, +inf)); // M+ + FULL
        eq(int(-50, +inf), int(0, 0), int(-50, +inf)); // M+ + Z
        eq(int(-30, 0), int(-30, 0), int(prev(-60), 0)); // N0 + N0
        eq(int(-30, 0), int(-inf, 0), int(-inf, 0)); // N0 + N0-
        eq(int(-30, 0), int(-5, -4), int(prev(-35), -4)); // N0 + N1
        eq(int(-30, 0), int(-inf, -20), int(-inf, -20)); // N0 + N1-
        eq(int(-30, 0), int(-inf, +inf), int(-inf, +inf)); // N0 + FULL
        eq(int(-30, 0), int(0, 0), int(-30, 0)); // N0 + Z
        eq(int(-inf, 0), int(-inf, 0), int(-inf, 0)); // N0- + N0-
        eq(int(-inf, 0), int(-5, -4), int(-inf, -4)); // N0- + N1
        eq(int(-inf, 0), int(-inf, -20), int(-inf, -20)); // N0- + N1-
        eq(int(-inf, 0), int(-inf, +inf), int(-inf, +inf)); // N0- + FULL
        eq(int(-inf, 0), int(0, 0), int(-inf, 0)); // N0- + Z
        eq(int(-5, -4), int(-5, -4), int(prev(-10), next(-8))); // N1 + N1
        eq(int(-5, -4), int(-inf, -20), int(-inf, next(-24))); // N1 + N1-
        eq(int(-5, -4), int(-inf, +inf), int(-inf, +inf)); // N1 + FULL
        eq(int(-5, -4), int(0, 0), int(-5, -4)); // N1 + Z
        eq(int(-inf, -20), int(-inf, -20), int(-inf, next(-40))); // N1- + N1-
        eq(int(-inf, -20), int(-inf, +inf), int(-inf, +inf)); // N1- + FULL
        eq(int(-inf, -20), int(0, 0), int(-inf, -20)); // N1- + Z
        eq(int(-inf, +inf), int(-inf, +inf), int(-inf, +inf)); // FULL + FULL
        eq(int(-inf, +inf), int(0, 0), int(-inf, +inf)); // FULL + Z
        eq(int(0, 0), int(0, 0), int(0, 0)); // Z + Z
    });

    it("sub", () => {
        const eq = (X: Interval, Y: Interval, expected: Interval) => {
            // Verify result is expected
            deepEqual(isub(X, Y), union([expected]));

            // Verify the inclusion property
            sampleInterval(X, 5).forEach((x) => {
                sampleInterval(Y, 5).forEach((y) => {
                    const realResult = x - y;
                    ok(
                        expected.contains(realResult),
                        `${x} - ${y} = ${realResult} is not in output of nsf.sub(X, Y) = ${expected} for inputs X = ${X} Y = ${Y}`
                    );
                });
            });
        };

        eq(int(0, 20), int(0, 20), int(-20, 20)); // P0 - P0
        eq(int(0, 20), int(0, +inf), int(-inf, 20)); // P0 - P0+
        eq(int(0, 20), int(1, 2), int(-2, next(19))); // P0 - P1
        eq(int(0, 20), int(10, +inf), int(-inf, next(10))); // P0 - P1+
        eq(int(0, 20), int(-50, 50), int(-50, next(70))); // P0 - M
        eq(int(0, 20), int(-inf, 50), int(-50, inf)); // P0 - M-
        eq(int(0, 20), int(-50, +inf), int(-inf, next(70))); // P0 - M+
        eq(int(0, 20), int(-30, 0), int(0, next(50))); // P0 - N0
        eq(int(0, 20), int(-inf, 0), int(0, inf)); // P0 - N0-
        eq(int(0, 20), int(-5, -4), int(4, next(25))); // P0 - N1
        eq(int(0, 20), int(-inf, -20), int(20, inf)); // P0 - N1-
        eq(int(0, 20), int(-inf, +inf), int(-inf, inf)); // P0 - FULL
        eq(int(0, 20), int(0, 0), int(0, 20)); // P0 - Z
        eq(int(0, +inf), int(0, 20), int(-20, inf)); // P0+ - P0
        eq(int(0, +inf), int(0, +inf), int(-inf, inf)); // P0+ - P0+
        eq(int(0, +inf), int(1, 2), int(-2, inf)); // P0+ - P1
        eq(int(0, +inf), int(10, +inf), int(-inf, inf)); // P0+ - P1+
        eq(int(0, +inf), int(-50, 50), int(-50, inf)); // P0+ - M
        eq(int(0, +inf), int(-inf, 50), int(-50, inf)); // P0+ - M-
        eq(int(0, +inf), int(-50, +inf), int(-inf, inf)); // P0+ - M+
        eq(int(0, +inf), int(-30, 0), int(0, inf)); // P0+ - N0
        eq(int(0, +inf), int(-inf, 0), int(0, inf)); // P0+ - N0-
        eq(int(0, +inf), int(-5, -4), int(4, inf)); // P0+ - N1
        eq(int(0, +inf), int(-inf, -20), int(20, inf)); // P0+ - N1-
        eq(int(0, +inf), int(-inf, +inf), int(-inf, inf)); // P0+ - FULL
        eq(int(0, +inf), int(0, 0), int(0, inf)); // P0+ - Z
        eq(int(1, 2), int(0, 20), int(prev(-19), 2)); // P1 - P0
        eq(int(1, 2), int(0, +inf), int(-inf, 2)); // P1 - P0+
        eq(int(1, 2), int(1, 2), int(prev(-1), next(1))); // P1 - P1
        eq(int(1, 2), int(10, +inf), int(-inf, next(-8))); // P1 - P1+
        eq(int(1, 2), int(-50, 50), int(prev(-49), next(52))); // P1 - M
        eq(int(1, 2), int(-inf, 50), int(prev(-49), inf)); // P1 - M-
        eq(int(1, 2), int(-50, +inf), int(-inf, next(52))); // P1 - M+
        eq(int(1, 2), int(-30, 0), int(1, next(32))); // P1 - N0
        eq(int(1, 2), int(-inf, 0), int(1, inf)); // P1 - N0-
        eq(int(1, 2), int(-5, -4), int(prev(5), next(7))); // P1 - N1
        eq(int(1, 2), int(-inf, -20), int(prev(21), inf)); // P1 - N1-
        eq(int(1, 2), int(-inf, +inf), int(-inf, inf)); // P1 - FULL
        eq(int(1, 2), int(0, 0), int(1, 2)); // P1 - Z
        eq(int(10, +inf), int(0, 20), int(prev(-10), inf)); // P1+ - P0
        eq(int(10, +inf), int(0, +inf), int(-inf, inf)); // P1+ - P0+
        eq(int(10, +inf), int(1, 2), int(prev(8), inf)); // P1+ - P1
        eq(int(10, +inf), int(10, +inf), int(-inf, inf)); // P1+ - P1+
        eq(int(10, +inf), int(-50, 50), int(prev(-40), inf)); // P1+ - M
        eq(int(10, +inf), int(-inf, 50), int(prev(-40), inf)); // P1+ - M-
        eq(int(10, +inf), int(-50, +inf), int(-inf, inf)); // P1+ - M+
        eq(int(10, +inf), int(-30, 0), int(10, inf)); // P1+ - N0
        eq(int(10, +inf), int(-inf, 0), int(10, inf)); // P1+ - N0-
        eq(int(10, +inf), int(-5, -4), int(prev(14), inf)); // P1+ - N1
        eq(int(10, +inf), int(-inf, -20), int(prev(30), inf)); // P1+ - N1-
        eq(int(10, +inf), int(-inf, +inf), int(-inf, inf)); // P1+ - FULL
        eq(int(10, +inf), int(0, 0), int(10, inf)); // P1+ - Z
        eq(int(-50, 50), int(0, 20), int(prev(-70), 50)); // M - P0
        eq(int(-50, 50), int(0, +inf), int(-inf, 50)); // M - P0+
        eq(int(-50, 50), int(1, 2), int(prev(-52), next(49))); // M - P1
        eq(int(-50, 50), int(10, +inf), int(-inf, next(40))); // M - P1+
        eq(int(-50, 50), int(-50, 50), int(prev(-100), next(100))); // M - M
        eq(int(-50, 50), int(-inf, 50), int(prev(-100), inf)); // M - M-
        eq(int(-50, 50), int(-50, +inf), int(-inf, next(100))); // M - M+
        eq(int(-50, 50), int(-30, 0), int(-50, next(80))); // M - N0
        eq(int(-50, 50), int(-inf, 0), int(-50, inf)); // M - N0-
        eq(int(-50, 50), int(-5, -4), int(prev(-46), next(55))); // M - N1
        eq(int(-50, 50), int(-inf, -20), int(prev(-30), inf)); // M - N1-
        eq(int(-50, 50), int(-inf, +inf), int(-inf, inf)); // M - FULL
        eq(int(-50, 50), int(0, 0), int(-50, 50)); // M - Z
        eq(int(-inf, 50), int(0, 20), int(-inf, 50)); // M- - P0
        eq(int(-inf, 50), int(0, +inf), int(-inf, 50)); // M- - P0+
        eq(int(-inf, 50), int(1, 2), int(-inf, next(49))); // M- - P1
        eq(int(-inf, 50), int(10, +inf), int(-inf, next(40))); // M- - P1+
        eq(int(-inf, 50), int(-50, 50), int(-inf, next(100))); // M- - M
        eq(int(-inf, 50), int(-inf, 50), int(-inf, inf)); // M- - M-
        eq(int(-inf, 50), int(-50, +inf), int(-inf, next(100))); // M- - M+
        eq(int(-inf, 50), int(-30, 0), int(-inf, next(80))); // M- - N0
        eq(int(-inf, 50), int(-inf, 0), int(-inf, inf)); // M- - N0-
        eq(int(-inf, 50), int(-5, -4), int(-inf, next(55))); // M- - N1
        eq(int(-inf, 50), int(-inf, -20), int(-inf, inf)); // M- - N1-
        eq(int(-inf, 50), int(-inf, +inf), int(-inf, inf)); // M- - FULL
        eq(int(-inf, 50), int(0, 0), int(-inf, 50)); // M- - Z
        eq(int(-50, +inf), int(0, 20), int(prev(-70), inf)); // M+ - P0
        eq(int(-50, +inf), int(0, +inf), int(-inf, inf)); // M+ - P0+
        eq(int(-50, +inf), int(1, 2), int(prev(-52), inf)); // M+ - P1
        eq(int(-50, +inf), int(10, +inf), int(-inf, inf)); // M+ - P1+
        eq(int(-50, +inf), int(-50, 50), int(prev(-100), inf)); // M+ - M
        eq(int(-50, +inf), int(-inf, 50), int(prev(-100), inf)); // M+ - M-
        eq(int(-50, +inf), int(-50, +inf), int(-inf, inf)); // M+ - M+
        eq(int(-50, +inf), int(-30, 0), int(-50, inf)); // M+ - N0
        eq(int(-50, +inf), int(-inf, 0), int(-50, inf)); // M+ - N0-
        eq(int(-50, +inf), int(-5, -4), int(prev(-46), inf)); // M+ - N1
        eq(int(-50, +inf), int(-inf, -20), int(prev(-30), inf)); // M+ - N1-
        eq(int(-50, +inf), int(-inf, +inf), int(-inf, inf)); // M+ - FULL
        eq(int(-50, +inf), int(0, 0), int(-50, inf)); // M+ - Z
        eq(int(-30, 0), int(0, 20), int(prev(-50), 0)); // N0 - P0
        eq(int(-30, 0), int(0, +inf), int(-inf, 0)); // N0 - P0+
        eq(int(-30, 0), int(1, 2), int(prev(-32), -1)); // N0 - P1
        eq(int(-30, 0), int(10, +inf), int(-inf, -10)); // N0 - P1+
        eq(int(-30, 0), int(-50, 50), int(prev(-80), 50)); // N0 - M
        eq(int(-30, 0), int(-inf, 50), int(prev(-80), inf)); // N0 - M-
        eq(int(-30, 0), int(-50, +inf), int(-inf, 50)); // N0 - M+
        eq(int(-30, 0), int(-30, 0), int(-30, 30)); // N0 - N0
        eq(int(-30, 0), int(-inf, 0), int(-30, inf)); // N0 - N0-
        eq(int(-30, 0), int(-5, -4), int(prev(-26), 5)); // N0 - N1
        eq(int(-30, 0), int(-inf, -20), int(prev(-10), inf)); // N0 - N1-
        eq(int(-30, 0), int(-inf, +inf), int(-inf, inf)); // N0 - FULL
        eq(int(-30, 0), int(0, 0), int(-30, 0)); // N0 - Z
        eq(int(-inf, 0), int(0, 20), int(-inf, 0)); // N0- - P0
        eq(int(-inf, 0), int(0, +inf), int(-inf, 0)); // N0- - P0+
        eq(int(-inf, 0), int(1, 2), int(-inf, -1)); // N0- - P1
        eq(int(-inf, 0), int(10, +inf), int(-inf, -10)); // N0- - P1+
        eq(int(-inf, 0), int(-50, 50), int(-inf, 50)); // N0- - M
        eq(int(-inf, 0), int(-inf, 50), int(-inf, inf)); // N0- - M-
        eq(int(-inf, 0), int(-50, +inf), int(-inf, 50)); // N0- - M+
        eq(int(-inf, 0), int(-30, 0), int(-inf, 30)); // N0- - N0
        eq(int(-inf, 0), int(-inf, 0), int(-inf, inf)); // N0- - N0-
        eq(int(-inf, 0), int(-5, -4), int(-inf, 5)); // N0- - N1
        eq(int(-inf, 0), int(-inf, -20), int(-inf, inf)); // N0- - N1-
        eq(int(-inf, 0), int(-inf, +inf), int(-inf, inf)); // N0- - FULL
        eq(int(-inf, 0), int(0, 0), int(-inf, 0)); // N0- - Z
        eq(int(-5, -4), int(0, 20), int(prev(-25), -4)); // N1 - P0
        eq(int(-5, -4), int(0, +inf), int(-inf, -4)); // N1 - P0+
        eq(int(-5, -4), int(1, 2), int(prev(-7), next(-5))); // N1 - P1
        eq(int(-5, -4), int(10, +inf), int(-inf, next(-14))); // N1 - P1+
        eq(int(-5, -4), int(-50, 50), int(prev(-55), next(46))); // N1 - M
        eq(int(-5, -4), int(-inf, 50), int(prev(-55), inf)); // N1 - M-
        eq(int(-5, -4), int(-50, +inf), int(-inf, next(46))); // N1 - M+
        eq(int(-5, -4), int(-30, 0), int(-5, next(26))); // N1 - N0
        eq(int(-5, -4), int(-inf, 0), int(-5, inf)); // N1 - N0-
        eq(int(-5, -4), int(-5, -4), int(prev(-1), next(1))); // N1 - N1
        eq(int(-5, -4), int(-inf, -20), int(prev(15), inf)); // N1 - N1-
        eq(int(-5, -4), int(-inf, +inf), int(-inf, inf)); // N1 - FULL
        eq(int(-5, -4), int(0, 0), int(-5, -4)); // N1 - Z
        eq(int(-inf, -20), int(0, 20), int(-inf, -20)); // N1- - P0
        eq(int(-inf, -20), int(0, +inf), int(-inf, -20)); // N1- - P0+
        eq(int(-inf, -20), int(1, 2), int(-inf, next(-21))); // N1- - P1
        eq(int(-inf, -20), int(10, +inf), int(-inf, next(-30))); // N1- - P1+
        eq(int(-inf, -20), int(-50, 50), int(-inf, next(30))); // N1- - M
        eq(int(-inf, -20), int(-inf, 50), int(-inf, inf)); // N1- - M-
        eq(int(-inf, -20), int(-50, +inf), int(-inf, next(30))); // N1- - M+
        eq(int(-inf, -20), int(-30, 0), int(-inf, next(10))); // N1- - N0
        eq(int(-inf, -20), int(-inf, 0), int(-inf, inf)); // N1- - N0-
        eq(int(-inf, -20), int(-5, -4), int(-inf, next(-15))); // N1- - N1
        eq(int(-inf, -20), int(-inf, -20), int(-inf, inf)); // N1- - N1-
        eq(int(-inf, -20), int(-inf, +inf), int(-inf, inf)); // N1- - FULL
        eq(int(-inf, -20), int(0, 0), int(-inf, -20)); // N1- - Z
        eq(int(-inf, +inf), int(0, 20), int(-inf, inf)); // FULL - P0
        eq(int(-inf, +inf), int(0, +inf), int(-inf, inf)); // FULL - P0+
        eq(int(-inf, +inf), int(1, 2), int(-inf, inf)); // FULL - P1
        eq(int(-inf, +inf), int(10, +inf), int(-inf, inf)); // FULL - P1+
        eq(int(-inf, +inf), int(-50, 50), int(-inf, inf)); // FULL - M
        eq(int(-inf, +inf), int(-inf, 50), int(-inf, inf)); // FULL - M-
        eq(int(-inf, +inf), int(-50, +inf), int(-inf, inf)); // FULL - M+
        eq(int(-inf, +inf), int(-30, 0), int(-inf, inf)); // FULL - N0
        eq(int(-inf, +inf), int(-inf, 0), int(-inf, inf)); // FULL - N0-
        eq(int(-inf, +inf), int(-5, -4), int(-inf, inf)); // FULL - N1
        eq(int(-inf, +inf), int(-inf, -20), int(-inf, inf)); // FULL - N1-
        eq(int(-inf, +inf), int(-inf, +inf), int(-inf, inf)); // FULL - FULL
        eq(int(-inf, +inf), int(0, 0), int(-inf, inf)); // FULL - Z
        eq(int(0, 0), int(0, 20), int(-20, 0)); // Z - P0
        eq(int(0, 0), int(0, +inf), int(-inf, 0)); // Z - P0+
        eq(int(0, 0), int(1, 2), int(-2, -1)); // Z - P1
        eq(int(0, 0), int(10, +inf), int(-inf, -10)); // Z - P1+
        eq(int(0, 0), int(-50, 50), int(-50, 50)); // Z - M
        eq(int(0, 0), int(-inf, 50), int(-50, inf)); // Z - M-
        eq(int(0, 0), int(-50, +inf), int(-inf, 50)); // Z - M+
        eq(int(0, 0), int(-30, 0), int(0, 30)); // Z - N0
        eq(int(0, 0), int(-inf, 0), int(0, inf)); // Z - N0-
        eq(int(0, 0), int(-5, -4), int(4, 5)); // Z - N1
        eq(int(0, 0), int(-inf, -20), int(20, inf)); // Z - N1-
        eq(int(0, 0), int(-inf, +inf), int(-inf, inf)); // Z - FULL
        eq(int(0, 0), int(0, 0), int(0, 0)); // Z - Z
    });

    it("mul", () => {
        const eq = (X: Interval, Y: Interval, expected: Interval) => {
            // Verify result is expected
            deepEqual(imul(X, Y), union([expected]));
            deepEqual(imul(Y, X), union([expected]));

            // Verify the inclusion property
            sampleInterval(X, 5).forEach((x) => {
                sampleInterval(Y, 5).forEach((y) => {
                    const realResult = x * y;
                    ok(
                        expected.contains(realResult),
                        `${x} * ${y} = ${realResult} is not in output of nsf.mul(X, Y) = ${expected} for inputs X = ${X} Y = ${Y}`
                    );
                });
            });
        };

        eq(int(0, 20), int(0, 20), int(0, next(400))); // P0 * P0
        eq(int(0, 20), int(0, +inf), int(0, +inf)); // P0 * P0+
        eq(int(0, 20), int(1, 2), int(0, next(40))); // P0 * P1
        eq(int(0, 20), int(10, +inf), int(0, +inf)); // P0 * P1+
        eq(int(0, 20), int(-50, 50), int(prev(-1000), next(1000))); // P0 * M
        eq(int(0, 20), int(-inf, 50), int(-inf, next(1000))); // P0 * M-
        eq(int(0, 20), int(-50, +inf), int(prev(-1000), +inf)); // P0 * M+
        eq(int(0, 20), int(-30, 0), int(prev(-600), 0)); // P0 * N0
        eq(int(0, 20), int(-inf, 0), int(-inf, 0)); // P0 * N0-
        eq(int(0, 20), int(-5, -4), int(prev(-100), 0)); // P0 * N1
        eq(int(0, 20), int(-inf, -20), int(-inf, 0)); // P0 * N1-
        eq(int(0, 20), int(-inf, +inf), int(-inf, +inf)); // P0 * FULL
        eq(int(0, 20), int(0, 0), int(0, 0)); // P0 * Z
        eq(int(0, +inf), int(0, +inf), int(0, +inf)); // P0+ * P0+
        eq(int(0, +inf), int(1, 2), int(0, +inf)); // P0+ * P1
        eq(int(0, +inf), int(10, +inf), int(0, +inf)); // P0+ * P1+
        eq(int(0, +inf), int(-50, 50), int(-inf, +inf)); // P0+ * M
        eq(int(0, +inf), int(-inf, 50), int(-inf, +inf)); // P0+ * M-
        eq(int(0, +inf), int(-50, +inf), int(-inf, +inf)); // P0+ * M+
        eq(int(0, +inf), int(-30, 0), int(-inf, 0)); // P0+ * N0
        eq(int(0, +inf), int(-inf, 0), int(-inf, 0)); // P0+ * N0-
        eq(int(0, +inf), int(-5, -4), int(-inf, 0)); // P0+ * N1
        eq(int(0, +inf), int(-inf, -20), int(-inf, 0)); // P0+ * N1-
        eq(int(0, +inf), int(-inf, +inf), int(-inf, +inf)); // P0+ * FULL
        eq(int(0, +inf), int(0, 0), int(0, 0)); // P0+ * Z
        eq(int(1, 2), int(1, 2), int(prev(1), next(4))); // P1 * P1
        eq(int(1, 2), int(10, +inf), int(prev(10), +inf)); // P1 * P1+
        eq(int(1, 2), int(-50, 50), int(prev(-100), next(100))); // P1 * M
        eq(int(1, 2), int(-inf, 50), int(-inf, next(100))); // P1 * M-
        eq(int(1, 2), int(-50, +inf), int(prev(-100), +inf)); // P1 * M+
        eq(int(1, 2), int(-30, 0), int(prev(-60), 0)); // P1 * N0
        eq(int(1, 2), int(-inf, 0), int(-inf, 0)); // P1 * N0-
        eq(int(1, 2), int(-5, -4), int(prev(-10), next(-4))); // P1 * N1
        eq(int(1, 2), int(-inf, -20), int(-inf, next(-20))); // P1 * N1-
        eq(int(1, 2), int(-inf, +inf), int(-inf, +inf)); // P1 * FULL
        eq(int(1, 2), int(0, 0), int(0, 0)); // P1 * Z
        eq(int(10, +inf), int(10, +inf), int(prev(100), +inf)); // P1+ * P1+
        eq(int(10, +inf), int(-50, 50), int(-inf, +inf)); // P1+ * M
        eq(int(10, +inf), int(-inf, 50), int(-inf, +inf)); // P1+ * M-
        eq(int(10, +inf), int(-50, +inf), int(-inf, +inf)); // P1+ * M+
        eq(int(10, +inf), int(-30, 0), int(-inf, 0)); // P1+ * N0
        eq(int(10, +inf), int(-inf, 0), int(-inf, 0)); // P1+ * N0-
        eq(int(10, +inf), int(-5, -4), int(-inf, next(-40))); // P1+ * N1
        eq(int(10, +inf), int(-inf, -20), int(-inf, next(-200))); // P1+ * N1-
        eq(int(10, +inf), int(-inf, +inf), int(-inf, +inf)); // P1+ * FULL
        eq(int(10, +inf), int(0, 0), int(0, 0)); // P1+ * Z
        eq(int(-50, 50), int(-50, 50), int(prev(-2500), next(2500))); // M * M
        eq(int(-50, 50), int(-inf, 50), int(-inf, +inf)); // M * M-
        eq(int(-50, 50), int(-50, +inf), int(-inf, +inf)); // M * M+
        eq(int(-50, 50), int(-30, 0), int(prev(-1500), next(1500))); // M * N0
        eq(int(-50, 50), int(-inf, 0), int(-inf, +inf)); // M * N0-
        eq(int(-50, 50), int(-5, -4), int(prev(-250), next(250))); // M * N1
        eq(int(-50, 50), int(-inf, -20), int(-inf, +inf)); // M * N1-
        eq(int(-50, 50), int(-inf, +inf), int(-inf, +inf)); // M * FULL
        eq(int(-50, 50), int(0, 0), int(0, 0)); // M * Z
        eq(int(-inf, 50), int(-inf, 50), int(-inf, +inf)); // M- * M-
        eq(int(-inf, 50), int(-50, +inf), int(-inf, +inf)); // M- * M+
        eq(int(-inf, 50), int(-30, 0), int(prev(-1500), +inf)); // M- * N0
        eq(int(-inf, 50), int(-inf, 0), int(-inf, +inf)); // M- * N0-
        eq(int(-inf, 50), int(-5, -4), int(prev(-250), +inf)); // M- * N1
        eq(int(-inf, 50), int(-inf, -20), int(-inf, +inf)); // M- * N1-
        eq(int(-inf, 50), int(-inf, +inf), int(-inf, +inf)); // M- * FULL
        eq(int(-inf, 50), int(0, 0), int(0, 0)); // M- * Z
        eq(int(-50, +inf), int(-50, +inf), int(-inf, +inf)); // M+ * M+
        eq(int(-50, +inf), int(-30, 0), int(-inf, next(1500))); // M+ * N0
        eq(int(-50, +inf), int(-inf, 0), int(-inf, +inf)); // M+ * N0-
        eq(int(-50, +inf), int(-5, -4), int(-inf, next(250))); // M+ * N1
        eq(int(-50, +inf), int(-inf, -20), int(-inf, +inf)); // M+ * N1-
        eq(int(-50, +inf), int(-inf, +inf), int(-inf, +inf)); // M+ * FULL
        eq(int(-50, +inf), int(0, 0), int(0, 0)); // M+ * Z
        eq(int(-30, 0), int(-30, 0), int(0, next(900))); // N0 * N0
        eq(int(-30, 0), int(-inf, 0), int(0, +inf)); // N0 * N0-
        eq(int(-30, 0), int(-5, -4), int(0, next(150))); // N0 * N1
        eq(int(-30, 0), int(-inf, -20), int(0, +inf)); // N0 * N1-
        eq(int(-30, 0), int(-inf, +inf), int(-inf, +inf)); // N0 * FULL
        eq(int(-30, 0), int(0, 0), int(0, 0)); // N0 * Z
        eq(int(-inf, 0), int(-inf, 0), int(0, +inf)); // N0- * N0-
        eq(int(-inf, 0), int(-5, -4), int(0, +inf)); // N0- * N1
        eq(int(-inf, 0), int(-inf, -20), int(0, +inf)); // N0- * N1-
        eq(int(-inf, 0), int(-inf, +inf), int(-inf, +inf)); // N0- * FULL
        eq(int(-inf, 0), int(0, 0), int(0, 0)); // N0- * Z
        eq(int(-5, -4), int(-5, -4), int(prev(16), next(25))); // N1 * N1
        eq(int(-5, -4), int(-inf, -20), int(prev(80), +inf)); // N1 * N1-
        eq(int(-5, -4), int(-inf, +inf), int(-inf, +inf)); // N1 * FULL
        eq(int(-5, -4), int(0, 0), int(0, 0)); // N1 * Z
        eq(int(-inf, -20), int(-inf, -20), int(prev(400), +inf)); // N1- * N1-
        eq(int(-inf, -20), int(-inf, +inf), int(-inf, +inf)); // N1- * FULL
        eq(int(-inf, -20), int(0, 0), int(0, 0)); // N1- * Z
        eq(int(-inf, +inf), int(-inf, +inf), int(-inf, +inf)); // FULL * FULL
        eq(int(-inf, +inf), int(0, 0), int(0, 0)); // FULL * Z
        eq(int(0, 0), int(0, 0), int(0, 0)); // Z * Z
    });

    const eq = (X: Interval, Y: Interval, expected: Interval[]) => {
        // Verify result is expected
        deepEqual(idiv(X, Y), union(expected));

        // Verify inclusion property
        sampleInterval(X, 5).forEach((x) => {
            sampleInterval(Y, 5).forEach((y) => {
                if (y !== 0) {
                    const realResult = x / y;
                    ok(expected.length <= 2);
                    ok(
                        expected.some((i) => i.contains(realResult)),
                        `${x} / ${y} = ${realResult} is not in output of nsf.div(X, Y) = ${expected} for inputs X = ${X} Y = ${Y}`
                    );
                }
            });
        });
    };

    it("div", () => {
        eq(int(0, 20), int(0, 20), [int(0, inf)]); // P0 / P0
        eq(int(0, 20), int(0, +inf), [int(0, inf)]); // P0 / P0+
        eq(int(0, 20), int(1, 2), [int(0, 20)]); // P0 / P1
        eq(int(0, 20), int(10, +inf), [int(0, next(20 / 10))]); // P0 / P1+
        eq(int(0, 20), int(-50, 50), [int(-inf, inf)]); // P0 / M
        eq(int(0, 20), int(-inf, 50), [int(-inf, inf)]); // P0 / M-
        eq(int(0, 20), int(-50, +inf), [int(-inf, inf)]); // P0 / M+
        eq(int(0, 20), int(-30, 0), [int(-inf, 0)]); // P0 / N0
        eq(int(0, 20), int(-inf, 0), [int(-inf, 0)]); // P0 / N0-
        eq(int(0, 20), int(-5, -4), [int(prev(20 / -4), 0)]); // P0 / N1
        eq(int(0, 20), int(-inf, -20), [int(prev(20 / -20), 0)]); // P0 / N1-
        eq(int(0, 20), int(-inf, +inf), [int(-inf, inf)]); // P0 / FULL
        eq(int(0, 20), int(0, 0), []); // P0 / Z
        eq(int(0, +inf), int(0, 20), [int(0, inf)]); // P0+ / P0
        eq(int(0, +inf), int(0, +inf), [int(0, inf)]); // P0+ / P0+
        eq(int(0, +inf), int(1, 2), [int(0, inf)]); // P0+ / P1
        eq(int(0, +inf), int(10, +inf), [int(0, inf)]); // P0+ / P1+
        eq(int(0, +inf), int(-50, 50), [int(-inf, inf)]); // P0+ / M
        eq(int(0, +inf), int(-inf, 50), [int(-inf, inf)]); // P0+ / M-
        eq(int(0, +inf), int(-50, +inf), [int(-inf, inf)]); // P0+ / M+
        eq(int(0, +inf), int(-30, 0), [int(-inf, 0)]); // P0+ / N0
        eq(int(0, +inf), int(-inf, 0), [int(-inf, 0)]); // P0+ / N0-
        eq(int(0, +inf), int(-5, -4), [int(-inf, 0)]); // P0+ / N1
        eq(int(0, +inf), int(-inf, -20), [int(-inf, 0)]); // P0+ / N1-
        eq(int(0, +inf), int(-inf, +inf), [int(-inf, inf)]); // P0+ / FULL
        eq(int(0, +inf), int(0, 0), []); // P0+ / Z
        eq(int(1, 2), int(0, 20), [int(prev(1 / 20), inf)]); // P1 / P0
        eq(int(1, 2), int(0, +inf), [int(0, inf)]); // P1 / P0+
        eq(int(1, 2), int(1, 2), [int(prev(1 / 2), 2)]); // P1 / P1
        eq(int(1, 2), int(10, +inf), [int(0, next(2 / 10))]); // P1 / P1+
        eq(int(1, 2), int(-50, 50), [int(-inf, next(1 / -50)), int(prev(1 / 50), inf)]); // P1 / M
        eq(int(1, 2), int(-inf, 50), [int(-inf, 0), int(prev(1 / 50), inf)]); // P1 / M-
        eq(int(1, 2), int(-50, +inf), [int(-inf, next(1 / -50)), int(0, inf)]); // P1 / M+
        eq(int(1, 2), int(-30, 0), [int(-inf, next(1 / -30))]); // P1 / N0
        eq(int(1, 2), int(-inf, 0), [int(-inf, 0)]); // P1 / N0-
        eq(int(1, 2), int(-5, -4), [int(prev(2 / -4), next(1 / -5))]); // P1 / N1
        eq(int(1, 2), int(-inf, -20), [int(prev(2 / -20), 0)]); // P1 / N1-
        eq(int(1, 2), int(-inf, +inf), [int(-inf, inf)]); // P1 / FULL
        eq(int(1, 2), int(0, 0), []); // P1 / Z
        eq(int(10, +inf), int(0, 20), [int(prev(10 / 20), inf)]); // P1+ / P0
        eq(int(10, +inf), int(0, +inf), [int(0, inf)]); // P1+ / P0+
        eq(int(10, +inf), int(1, 2), [int(prev(10 / 2), inf)]); // P1+ / P1
        eq(int(10, +inf), int(10, +inf), [int(0, inf)]); // P1+ / P1+
        eq(int(10, +inf), int(-50, 50), [int(-inf, next(10 / -50)), int(prev(10 / 50), inf)]); // P1+ / M
        eq(int(10, +inf), int(-inf, 50), [int(-inf, 0), int(prev(10 / 50), inf)]); // P1+ / M-
        eq(int(10, +inf), int(-50, +inf), [int(-inf, next(10 / -50)), int(0, inf)]); // P1+ / M+
        eq(int(10, +inf), int(-30, 0), [int(-inf, next(10 / -30))]); // P1+ / N0
        eq(int(10, +inf), int(-inf, 0), [int(-inf, 0)]); // P1+ / N0-
        eq(int(10, +inf), int(-5, -4), [int(-inf, next(10 / -5))]); // P1+ / N1
        eq(int(10, +inf), int(-inf, -20), [int(-inf, 0)]); // P1+ / N1-
        eq(int(10, +inf), int(-inf, +inf), [int(-inf, inf)]); // P1+ / FULL
        eq(int(10, +inf), int(0, 0), []); // P1+ / Z
        eq(int(-50, 50), int(0, 20), [int(-inf, inf)]); // M / P0
        eq(int(-50, 50), int(0, +inf), [int(-inf, inf)]); // M / P0+
        eq(int(-50, 50), int(1, 2), [int(-50, 50)]); // M / P1
        eq(int(-50, 50), int(10, +inf), [int(prev(-50 / 10), next(50 / 10))]); // M / P1+
        eq(int(-50, 50), int(-50, 50), [int(-inf, inf)]); // M / M
        eq(int(-50, 50), int(-inf, 50), [int(-inf, inf)]); // M / M-
        eq(int(-50, 50), int(-50, +inf), [int(-inf, inf)]); // M / M+
        eq(int(-50, 50), int(-30, 0), [int(-inf, inf)]); // M / N0
        eq(int(-50, 50), int(-inf, 0), [int(-inf, inf)]); // M / N0-
        eq(int(-50, 50), int(-5, -4), [int(prev(50 / -4), next(-50 / -4))]); // M / N1
        eq(int(-50, 50), int(-inf, -20), [int(prev(50 / -20), next(-50 / -20))]); // M / N1-
        eq(int(-50, 50), int(-inf, +inf), [int(-inf, inf)]); // M / FULL
        eq(int(-50, 50), int(0, 0), []); // M / Z
        eq(int(-inf, 50), int(0, 20), [int(-inf, inf)]); // M- / P0
        eq(int(-inf, 50), int(0, +inf), [int(-inf, inf)]); // M- / P0+
        eq(int(-inf, 50), int(1, 2), [int(-inf, 50)]); // M- / P1
        eq(int(-inf, 50), int(10, +inf), [int(-inf, next(50 / 10))]); // M- / P1+
        eq(int(-inf, 50), int(-50, 50), [int(-inf, inf)]); // M- / M
        eq(int(-inf, 50), int(-inf, 50), [int(-inf, inf)]); // M- / M-
        eq(int(-inf, 50), int(-50, +inf), [int(-inf, inf)]); // M- / M+
        eq(int(-inf, 50), int(-30, 0), [int(-inf, inf)]); // M- / N0
        eq(int(-inf, 50), int(-inf, 0), [int(-inf, inf)]); // M- / N0-
        eq(int(-inf, 50), int(-5, -4), [int(prev(50 / -4), inf)]); // M- / N1
        eq(int(-inf, 50), int(-inf, -20), [int(prev(50 / -20), inf)]); // M- / N1-
        eq(int(-inf, 50), int(-inf, +inf), [int(-inf, inf)]); // M- / FULL
        eq(int(-inf, 50), int(0, 0), []); // M- / Z
        eq(int(-50, +inf), int(0, 20), [int(-inf, inf)]); // M+ / P0
        eq(int(-50, +inf), int(0, +inf), [int(-inf, inf)]); // M+ / P0+
        eq(int(-50, +inf), int(1, 2), [int(-50, inf)]); // M+ / P1
        eq(int(-50, +inf), int(10, +inf), [int(prev(-50 / 10), inf)]); // M+ / P1+
        eq(int(-50, +inf), int(-50, 50), [int(-inf, inf)]); // M+ / M
        eq(int(-50, +inf), int(-inf, 50), [int(-inf, inf)]); // M+ / M-
        eq(int(-50, +inf), int(-50, +inf), [int(-inf, inf)]); // M+ / M+
        eq(int(-50, +inf), int(-30, 0), [int(-inf, inf)]); // M+ / N0
        eq(int(-50, +inf), int(-inf, 0), [int(-inf, inf)]); // M+ / N0-
        eq(int(-50, +inf), int(-5, -4), [int(-inf, next(-50 / -4))]); // M+ / N1
        eq(int(-50, +inf), int(-inf, -20), [int(-inf, next(-50 / -20))]); // M+ / N1-
        eq(int(-50, +inf), int(-inf, +inf), [int(-inf, inf)]); // M+ / FULL
        eq(int(-50, +inf), int(0, 0), []); // M+ / Z
        eq(int(-30, 0), int(0, 20), [int(-inf, 0)]); // N0 / P0
        eq(int(-30, 0), int(0, +inf), [int(-inf, 0)]); // N0 / P0+
        eq(int(-30, 0), int(1, 2), [int(-30, 0)]); // N0 / P1
        eq(int(-30, 0), int(10, +inf), [int(prev(-30 / 10), 0)]); // N0 / P1+
        eq(int(-30, 0), int(-50, 50), [int(-inf, inf)]); // N0 / M
        eq(int(-30, 0), int(-inf, 50), [int(-inf, inf)]); // N0 / M-
        eq(int(-30, 0), int(-50, +inf), [int(-inf, inf)]); // N0 / M+
        eq(int(-30, 0), int(-30, 0), [int(0, inf)]); // N0 / N0
        eq(int(-30, 0), int(-inf, 0), [int(0, inf)]); // N0 / N0-
        eq(int(-30, 0), int(-5, -4), [int(0, next(-30 / -4))]); // N0 / N1
        eq(int(-30, 0), int(-inf, -20), [int(0, next(-30 / -20))]); // N0 / N1-
        eq(int(-30, 0), int(-inf, +inf), [int(-inf, inf)]); // N0 / FULL
        eq(int(-30, 0), int(0, 0), []); // N0 / Z
        eq(int(-inf, 0), int(0, 20), [int(-inf, 0)]); // N0- / P0
        eq(int(-inf, 0), int(0, +inf), [int(-inf, 0)]); // N0- / P0+
        eq(int(-inf, 0), int(1, 2), [int(-inf, 0)]); // N0- / P1
        eq(int(-inf, 0), int(10, +inf), [int(-inf, 0)]); // N0- / P1+
        eq(int(-inf, 0), int(-50, 50), [int(-inf, inf)]); // N0- / M
        eq(int(-inf, 0), int(-inf, 50), [int(-inf, inf)]); // N0- / M-
        eq(int(-inf, 0), int(-50, +inf), [int(-inf, inf)]); // N0- / M+
        eq(int(-inf, 0), int(-30, 0), [int(0, inf)]); // N0- / N0
        eq(int(-inf, 0), int(-inf, 0), [int(0, inf)]); // N0- / N0-
        eq(int(-inf, 0), int(-5, -4), [int(0, inf)]); // N0- / N1
        eq(int(-inf, 0), int(-inf, -20), [int(0, inf)]); // N0- / N1-
        eq(int(-inf, 0), int(-inf, +inf), [int(-inf, inf)]); // N0- / FULL
        eq(int(-inf, 0), int(0, 0), []); // N0- / Z
        eq(int(-5, -4), int(0, 20), [int(-inf, next(-4 / 20))]); // N1 / P0
        eq(int(-5, -4), int(0, +inf), [int(-inf, 0)]); // N1 / P0+
        eq(int(-5, -4), int(1, 2), [int(-5, next(-4 / 2))]); // N1 / P1
        eq(int(-5, -4), int(10, +inf), [int(prev(-5 / 10), 0)]); // N1 / P1+
        eq(int(-5, -4), int(-50, 50), [int(-inf, next(-4 / 50)), int(prev(-4 / -50), inf)]); // N1 / M
        eq(int(-5, -4), int(-inf, 50), [int(-inf, next(-4 / 50)), int(0, inf)]); // N1 / M-
        eq(int(-5, -4), int(-50, +inf), [int(-inf, 0), int(prev(-4 / -50), inf)]); // N1 / M+
        eq(int(-5, -4), int(-30, 0), [int(prev(-4 / -30), inf)]); // N1 / N0
        eq(int(-5, -4), int(-inf, 0), [int(0, inf)]); // N1 / N0-
        eq(int(-5, -4), int(-5, -4), [int(prev(-4 / -5), next(-5 / -4))]); // N1 / N1
        eq(int(-5, -4), int(-inf, -20), [int(0, next(-5 / -20))]); // N1 / N1-
        eq(int(-5, -4), int(-inf, +inf), [int(-inf, inf)]); // N1 / FULL
        eq(int(-5, -4), int(0, 0), []); // N1 / Z
        eq(int(-inf, -20), int(0, 20), [int(-inf, next(-20 / 20))]); // N1- / P0
        eq(int(-inf, -20), int(0, +inf), [int(-inf, 0)]); // N1- / P0+
        eq(int(-inf, -20), int(1, 2), [int(-inf, next(-20 / 2))]); // N1- / P1
        eq(int(-inf, -20), int(10, +inf), [int(-inf, 0)]); // N1- / P1+
        eq(int(-inf, -20), int(-50, 50), [int(-inf, next(-20 / 50)), int(prev(-20 / -50), inf)]); // N1- / M
        eq(int(-inf, -20), int(-inf, 50), [int(-inf, next(-20 / 50)), int(0, inf)]); // N1- / M-
        eq(int(-inf, -20), int(-50, +inf), [int(-inf, 0), int(prev(-20 / -50), inf)]); // N1- / M+
        eq(int(-inf, -20), int(-30, 0), [int(prev(-20 / -30), inf)]); // N1- / N0
        eq(int(-inf, -20), int(-inf, 0), [int(0, inf)]); // N1- / N0-
        eq(int(-inf, -20), int(-5, -4), [int(prev(-20 / -5), inf)]); // N1- / N1
        eq(int(-inf, -20), int(-inf, -20), [int(0, inf)]); // N1- / N1-
        eq(int(-inf, -20), int(-inf, +inf), [int(-inf, inf)]); // N1- / FULL
        eq(int(-inf, -20), int(0, 0), []); // N1- / Z
        eq(int(-inf, +inf), int(0, 20), [int(-inf, inf)]); // FULL / P0
        eq(int(-inf, +inf), int(0, +inf), [int(-inf, inf)]); // FULL / P0+
        eq(int(-inf, +inf), int(1, 2), [int(-inf, inf)]); // FULL / P1
        eq(int(-inf, +inf), int(10, +inf), [int(-inf, inf)]); // FULL / P1+
        eq(int(-inf, +inf), int(-50, 50), [int(-inf, inf)]); // FULL / M
        eq(int(-inf, +inf), int(-inf, 50), [int(-inf, inf)]); // FULL / M-
        eq(int(-inf, +inf), int(-50, +inf), [int(-inf, inf)]); // FULL / M+
        eq(int(-inf, +inf), int(-30, 0), [int(-inf, inf)]); // FULL / N0
        eq(int(-inf, +inf), int(-inf, 0), [int(-inf, inf)]); // FULL / N0-
        eq(int(-inf, +inf), int(-5, -4), [int(-inf, inf)]); // FULL / N1
        eq(int(-inf, +inf), int(-inf, -20), [int(-inf, inf)]); // FULL / N1-
        eq(int(-inf, +inf), int(-inf, +inf), [int(-inf, inf)]); // FULL / FULL
        eq(int(-inf, +inf), int(0, 0), []); // FULL / Z
        eq(int(0, 0), int(0, 20), [int(0, 0)]); // Z / P0
        eq(int(0, 0), int(0, +inf), [int(0, 0)]); // Z / P0+
        eq(int(0, 0), int(1, 2), [int(0, 0)]); // Z / P1
        eq(int(0, 0), int(10, +inf), [int(0, 0)]); // Z / P1+
        eq(int(0, 0), int(-50, 50), [int(0, 0)]); // Z / M
        eq(int(0, 0), int(-inf, 50), [int(0, 0)]); // Z / M-
        eq(int(0, 0), int(-50, +inf), [int(0, 0)]); // Z / M+
        eq(int(0, 0), int(-30, 0), [int(0, 0)]); // Z / N0
        eq(int(0, 0), int(-inf, 0), [int(0, 0)]); // Z / N0-
        eq(int(0, 0), int(-5, -4), [int(0, 0)]); // Z / N1
        eq(int(0, 0), int(-inf, -20), [int(0, 0)]); // Z / N1-
        eq(int(0, 0), int(-inf, +inf), [int(0, 0)]); // Z / FULL
        eq(int(0, 0), int(0, 0), []); // Z / Z
    });
});
