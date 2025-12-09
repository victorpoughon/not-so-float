import { describe, it } from "node:test";
import assert from "node:assert";

import * as nsf from "../src/index.ts";
import { sampleInterval, sampleUnion } from "./testIntervals.ts";

function expectTrig(
    fnsf: (U: nsf.Union | nsf.Interval) => nsf.Union,
    freal: (x: number) => number,
    X: nsf.Union,
    expected: nsf.Union | null,
    unit: boolean
) {
    const actual = fnsf(X);

    assert.ok(
        actual.intervals.length === 1,
        `Trig function returned ${actual.intervals.length} disjoint intervals`
    );

    if (expected) {
        assert.deepEqual(actual, expected);
    }

    checkTrig(freal, X, actual, unit);
}

function checkTrig(freal: (x: number) => number, X: nsf.Union, result: nsf.Union, unit: boolean) {
    if (unit) {
        assert.ok(result.lower() >= -1 && result.upper() <= 1);
    }

    // Verify inclusion property
    sampleUnion(X, 5).forEach((x) => {
        const realResult = freal(x);
        assert.ok(
            result.contains(realResult),
            `real output ${realResult} is not in union output ${result} for real sample ${x}`
        );
    });
}

// short names for compact test cases
const int = nsf.single;
const prev = nsf.prev;
const next = nsf.next;
const pi = Math.PI;
const tau = 2 * Math.PI;
const coshalfpi = Math.cos(Math.PI / 2);
const costhirdpi = Math.cos(Math.PI / 3);
const cosfourthpi = Math.cos(Math.PI / 4);

describe("cos", () => {
    const expectCos = (X: nsf.Union, expected: nsf.Union) =>
        expectTrig(nsf.cos, Math.cos, X, expected, true);

    const checkCos = (X: nsf.Union) => expectTrig(nsf.cos, Math.cos, X, null, true);

    it("exact expected values", () => {
        // Degenerate zero
        expectCos(int(0, 0), int(1, 1));

        // Degenerate positive intervals
        expectCos(int(pi, pi), int(-1, next(-1)));
        expectCos(int(pi / 2, pi / 2), int(prev(coshalfpi), next(coshalfpi)));
        expectCos(int(pi / 3, pi / 3), int(prev(costhirdpi), next(costhirdpi)));
        expectCos(int(pi / 4, pi / 4), int(prev(cosfourthpi), next(cosfourthpi)));
        expectCos(
            int((3 * pi) / 2, (3 * pi) / 2),
            int(prev(Math.cos((3 * Math.PI) / 2)), next(Math.cos((3 * Math.PI) / 2)))
        );
        expectCos(int(2 * pi, 2 * pi), int(prev(1), 1));
        expectCos(int(3 * pi, 3 * pi), int(-1, next(-1)));
        expectCos(int(4 * pi, 4 * pi), int(prev(1), 1));

        // Degenerate negative intervals
        expectCos(int(-pi, -pi), int(-1, next(-1)));
        expectCos(int(-pi / 2, -pi / 2), int(prev(coshalfpi), next(coshalfpi)));
        expectCos(int(-pi / 3, -pi / 3), int(prev(costhirdpi), next(costhirdpi)));
        expectCos(int(-pi / 4, -pi / 4), int(prev(cosfourthpi), next(cosfourthpi)));
        expectCos(
            int(-(3 * pi) / 2, -(3 * pi) / 2),
            int(prev(Math.cos((3 * Math.PI) / 2)), next(Math.cos((3 * Math.PI) / 2)))
        );
        expectCos(int(-2 * pi, -2 * pi), int(prev(1), 1));
        expectCos(int(-3 * pi, -3 * pi), int(-1, next(-1)));
        expectCos(int(-4 * pi, -4 * pi), int(prev(1), 1));

        // Result is [-1, 1]
        expectCos(int(0, pi), int(-1, 1));
        expectCos(int(-pi, pi), int(-1, 1));
        expectCos(int(-pi, 0), int(-1, 1));

        // Result is [0, 1]
        expectCos(int(0, pi / 2), int(prev(coshalfpi), 1));
        expectCos(int(-pi / 2, 0), int(prev(coshalfpi), 1));
        expectCos(int(-pi / 2, pi / 2), int(prev(coshalfpi), 1));

        // Result is [-1, 0]
        expectCos(int(-pi, -pi / 2), int(-1, next(coshalfpi)));
        expectCos(int(pi / 2, pi), int(-1, next(coshalfpi)));
        expectCos(int(-3 * pi, -2 * pi - pi / 2), int(-1, next(Math.cos(-2 * pi - pi / 2))));
        expectCos(int(tau + pi / 2, tau + pi), int(-1, next(Math.cos(tau + pi / 2))));

        // Resut is [-0.5, 0.5]
        expectCos(
            int(pi / 3, (2 * pi) / 3),
            int(prev(Math.cos((2 * pi) / 3)), next(Math.cos(pi / 3)))
        );
        expectCos(
            int(-(2 * pi) / 3, -pi / 3),
            int(prev(Math.cos((2 * pi) / 3)), next(Math.cos(pi / 3)))
        );
    });

    it("inclusion property checks", () => {
        const pi = nsf.bounded(Math.PI);

        checkCos(nsf.div(pi, int(2)));
        checkCos(nsf.div(pi, int(3)));
        checkCos(nsf.div(pi, int(4)));
        checkCos(nsf.div(pi, int(5)));
        checkCos(nsf.div(pi, int(6)));
        checkCos(nsf.div(pi, int(7)));
        checkCos(nsf.bounded(Math.PI / 6));
    });
});

describe("sin", () => {
    const expectSin = (X: nsf.Union, expected: nsf.Union) =>
        expectTrig(nsf.sin, Math.sin, X, expected, true);

    const checkSin = (X: nsf.Union) => expectTrig(nsf.sin, Math.sin, X, null, true);

    it("exact expected values", () => {
        // Degenerate zero
        expectSin(int(0, 0), int(0, 0));

        // Degenerate positive intervals
        expectSin(int(pi, pi), int(prev(Math.sin(pi)), next(Math.sin(pi))));
        expectSin(int(pi / 2, pi / 2), int(prev(Math.sin(pi / 2)), 1));
        expectSin(int(pi / 3, pi / 3), int(prev(Math.sin(pi / 3)), next(Math.sin(pi / 3))));
        expectSin(int(pi / 4, pi / 4), int(prev(Math.sin(pi / 4)), next(Math.sin(pi / 4))));
        expectSin(int((3 * pi) / 2, (3 * pi) / 2), int(-1, next(Math.sin((3 * pi) / 2))));
        expectSin(int(2 * pi, 2 * pi), int(prev(Math.sin(2 * pi)), next(Math.sin(2 * pi))));
        expectSin(int(3 * pi, 3 * pi), int(prev(Math.sin(3 * pi)), next(Math.sin(3 * pi))));
        expectSin(int(4 * pi, 4 * pi), int(prev(Math.sin(4 * pi)), next(Math.sin(4 * pi))));

        // Degenerate negative intervals
        expectSin(int(-pi, -pi), int(prev(Math.sin(-pi)), next(Math.sin(-pi))));
        expectSin(int(-pi / 2, -pi / 2), int(-1, next(Math.sin(-pi / 2))));
        expectSin(int(-pi / 3, -pi / 3), int(prev(Math.sin(-pi / 3)), next(Math.sin(-pi / 3))));
        expectSin(int(-pi / 4, -pi / 4), int(prev(Math.sin(-pi / 4)), next(Math.sin(-pi / 4))));
        expectSin(int(-(3 * pi) / 2, -(3 * pi) / 2), int(prev(Math.sin(-(3 * pi) / 2)), 1));
        expectSin(int(-2 * pi, -2 * pi), int(prev(Math.sin(-2 * pi)), next(Math.sin(-2 * pi))));
        expectSin(int(-3 * pi, -3 * pi), int(prev(Math.sin(-3 * pi)), next(Math.sin(-3 * pi))));
        expectSin(int(-4 * pi, -4 * pi), int(prev(Math.sin(-4 * pi)), next(Math.sin(-4 * pi))));

        // Result is [-1, 1]
        expectSin(int(-pi / 2, pi / 2), int(-1, 1));
        expectSin(int(-pi, pi), int(-1, 1));
        expectSin(int(pi / 2, (3 * pi) / 2), int(-1, 1));

        // Result is [0, 1]
        expectSin(int(0, pi), int(0, 1));
        expectSin(int(pi / 2, pi), int(prev(Math.sin(pi)), 1));
        expectSin(int(0, pi / 2), int(0, 1));

        // Result is [-1, 0]
        expectSin(int(-pi, -pi / 2), int(-1, next(Math.sin(-pi))));
        expectSin(int(-pi / 2, 0), int(-1, 0));
        expectSin(int(-pi, 0), int(-1, 0));
        expectSin(int(pi, (3 * pi) / 2), int(-1, next(Math.sin(pi))));

        // Resut is [-0.5, 0.5]
        expectSin(int(-pi / 3, pi / 3), int(prev(Math.sin(-pi / 3)), next(Math.sin(pi / 3))));
        expectSin(
            int((2 * pi) / 3, (4 * pi) / 3),
            int(prev(Math.sin((4 * pi) / 3)), next(Math.sin((2 * pi) / 3)))
        );
    });

    it("inclusion property checks", () => {
        const pi = nsf.bounded(Math.PI);

        checkSin(nsf.div(pi, int(2)));
        checkSin(nsf.div(pi, int(3)));
        checkSin(nsf.div(pi, int(4)));
        checkSin(nsf.div(pi, int(5)));
        checkSin(nsf.div(pi, int(6)));
        checkSin(nsf.div(pi, int(7)));
        checkSin(nsf.bounded(Math.PI / 6));
    });
});

describe("tan", () => {
    const expectTan = (X: nsf.Union, expected: nsf.Union) =>
        expectTrig(nsf.tan, Math.tan, X, expected, false);

    const checkTan = (X: nsf.Union) => expectTrig(nsf.tan, Math.tan, X, null, false);

    it("exact expected values", () => {
        expectTan(int(0, 0), int(0, 0));
        expectTan(
            int(pi / 3, pi / 3),
            int(
                prev(prev(Math.sin(pi / 3)) / next(Math.cos(pi / 3))),
                next(next(Math.sin(pi / 3)) / prev(Math.cos(pi / 3)))
            )
        );
    });

    it("inclusion property checks", () => {
        const pi = nsf.bounded(Math.PI);

        checkTan(nsf.div(pi, int(3)));
        checkTan(nsf.div(pi, int(4)));
        checkTan(nsf.div(pi, int(5)));
        checkTan(nsf.div(pi, int(6)));
        checkTan(nsf.div(pi, int(7)));
        checkTan(nsf.bounded(Math.PI / 6));
    });
});

describe("acos", () => {
    assert.deepStrictEqual(
        nsf.acos(nsf.single(0)),
        nsf.single(prev(Math.acos(0)), next(Math.acos(0)))
    );

    assert.deepStrictEqual(
        nsf.acos(nsf.single(-0.1)),
        nsf.single(prev(Math.acos(-0.1)), next(Math.acos(-0.1)))
    );

    assert.deepStrictEqual(
        nsf.acos(nsf.single(0.2)),
        nsf.single(prev(Math.acos(0.2)), next(Math.acos(0.2)))
    );

    assert.deepStrictEqual(
        nsf.acos(nsf.single(0.2, 0.5)),
        nsf.single(prev(Math.acos(0.5)), next(Math.acos(0.2)))
    );

    assert.deepStrictEqual(
        nsf.acos(nsf.single(-0.2, 0.5)),
        nsf.single(prev(Math.acos(0.5)), next(Math.acos(-0.2)))
    );

    assert.deepStrictEqual(nsf.acos(nsf.single(-1.1, 1.1)), nsf.single(0, next(Math.acos(-1))));

    assert.deepStrictEqual(
        nsf.acos(nsf.single(-1.1, -0.5)),
        nsf.single(prev(Math.acos(-0.5)), next(Math.acos(-1)))
    );

    assert.deepStrictEqual(nsf.acos(nsf.single(0.5, 1.5)), nsf.single(0, next(Math.acos(0.5))));

    assert.deepStrictEqual(nsf.acos(nsf.single(-1.2, -1.1)), nsf.EMPTY);
    assert.deepStrictEqual(nsf.acos(nsf.single(1.1, 1.2)), nsf.EMPTY);
    assert.deepStrictEqual(nsf.acos(nsf.EMPTY), nsf.EMPTY);
});

describe("asin", () => {
    assert.deepStrictEqual(nsf.asin(nsf.single(0)), nsf.single(0, 0));

    assert.deepStrictEqual(
        nsf.asin(nsf.single(-0.1)),
        nsf.single(prev(Math.asin(-0.1)), next(Math.asin(-0.1)))
    );

    assert.deepStrictEqual(
        nsf.asin(nsf.single(0.2)),
        nsf.single(prev(Math.asin(0.2)), next(Math.asin(0.2)))
    );

    assert.deepStrictEqual(nsf.asin(nsf.single(0, 1)), nsf.single(0, next(Math.asin(1))));
    assert.deepStrictEqual(nsf.asin(nsf.single(-1, 0)), nsf.single(prev(Math.asin(-1)), 0));

    assert.deepStrictEqual(
        nsf.asin(nsf.single(0.2, 0.5)),
        nsf.single(prev(Math.asin(0.2)), next(Math.asin(0.5)))
    );

    assert.deepStrictEqual(
        nsf.asin(nsf.single(-0.2, 0.5)),
        nsf.single(prev(Math.asin(-0.2)), next(Math.asin(0.5)))
    );

    assert.deepStrictEqual(
        nsf.asin(nsf.single(-1.1, 1.1)),
        nsf.single(prev(Math.asin(-1)), next(Math.asin(1)))
    );

    assert.deepStrictEqual(
        nsf.asin(nsf.single(-1.1, -0.5)),
        nsf.single(prev(Math.asin(-1)), next(Math.asin(-0.5)))
    );

    assert.deepStrictEqual(
        nsf.asin(nsf.single(0.5, 1.5)),
        nsf.single(prev(Math.asin(0.5)), next(Math.asin(1)))
    );

    assert.deepStrictEqual(nsf.asin(nsf.single(-1.2, -1.1)), nsf.EMPTY);
    assert.deepStrictEqual(nsf.asin(nsf.single(1.1, 1.2)), nsf.EMPTY);
    assert.deepStrictEqual(nsf.asin(nsf.EMPTY), nsf.EMPTY);
});

describe("atan", () => {
    assert.deepStrictEqual(nsf.atan(nsf.single(0)), nsf.single(0));

    assert.deepStrictEqual(
        nsf.atan(nsf.single(-0.1)),
        nsf.single(prev(Math.atan(-0.1)), next(Math.atan(-0.1)))
    );

    assert.deepStrictEqual(
        nsf.atan(nsf.single(0.2)),
        nsf.single(prev(Math.atan(0.2)), next(Math.atan(0.2)))
    );

    assert.deepStrictEqual(
        nsf.atan(nsf.single(0.2, 0.5)),
        nsf.single(prev(Math.atan(0.2)), next(Math.atan(0.5)))
    );

    assert.deepStrictEqual(
        nsf.atan(nsf.single(-0.2, 0.5)),
        nsf.single(prev(Math.atan(-0.2)), next(Math.atan(0.5)))
    );

    assert.deepStrictEqual(
        nsf.atan(nsf.single(-1.1, 1.1)),
        nsf.single(prev(Math.atan(-1.1)), next(Math.atan(1.1)))
    );

    assert.deepStrictEqual(
        nsf.atan(nsf.single(-1.1, -0.5)),
        nsf.single(prev(Math.atan(-1.1)), next(Math.atan(-0.5)))
    );

    assert.deepStrictEqual(
        nsf.atan(nsf.single(0.5, 1.5)),
        nsf.single(prev(Math.atan(0.5)), next(Math.atan(1.5)))
    );

    assert.deepStrictEqual(nsf.atan(nsf.FULL), nsf.single(prev(-Math.PI / 2), next(Math.PI / 2)));
    assert.deepStrictEqual(nsf.atan(nsf.EMPTY), nsf.EMPTY);
});
