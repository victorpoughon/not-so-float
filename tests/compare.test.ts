import { describe, it } from "node:test";
import assert from "node:assert";

import * as nsf from "../src/index.ts";

describe("overlap and disjoint", () => {
    const expectOverlap = (a: nsf.Interval, b: nsf.Interval) => {
        assert.ok(
            nsf.overlap(a, b) && nsf.overlap(b, a) && !nsf.disjoint(a, b) && !nsf.disjoint(b, a)
        );
    };

    const expectDisjoint = (a: nsf.Interval, b: nsf.Interval) => {
        assert.ok(
            !nsf.overlap(a, b) && !nsf.overlap(b, a) && nsf.disjoint(a, b) && nsf.disjoint(b, a)
        );
    };

    it("two real intervals", () => {
        expectDisjoint(nsf.interval(1, 2), nsf.interval(3, 4));
        expectOverlap(nsf.interval(1, 2), nsf.interval(2, 3));
        expectOverlap(nsf.interval(1, 3), nsf.interval(2, 4));
        expectOverlap(nsf.interval(1, 3), nsf.interval(2, 3));
        expectOverlap(nsf.interval(1, 4), nsf.interval(2, 3));
        expectOverlap(nsf.interval(1, 3), nsf.interval(1, 2));
        expectOverlap(nsf.interval(1, 2), nsf.interval(1, 2));

        expectOverlap(nsf.interval(1, 2), nsf.FULL);
    });

    it("one semi infinite, one real", () => {
        expectDisjoint(nsf.interval(-Infinity, 0), nsf.interval(1, 2));
        expectOverlap(nsf.interval(-Infinity, 1), nsf.interval(1, 2));
        expectOverlap(nsf.interval(-Infinity, 1.5), nsf.interval(1, 2));
        expectOverlap(nsf.interval(-Infinity, 2), nsf.interval(1, 2));
        expectOverlap(nsf.interval(-Infinity, 3), nsf.interval(1, 2));

        expectDisjoint(nsf.interval(0, Infinity), nsf.interval(-2, -1));
        expectOverlap(nsf.interval(-1, Infinity), nsf.interval(-2, -1));
        expectOverlap(nsf.interval(-1.5, Infinity), nsf.interval(-2, -1));
        expectOverlap(nsf.interval(-2, Infinity), nsf.interval(-2, -1));
        expectOverlap(nsf.interval(-3, Infinity), nsf.interval(-2, -1));

        expectOverlap(nsf.interval(-Infinity, 0), nsf.FULL);
        expectOverlap(nsf.interval(0, Infinity), nsf.FULL);
    });

    it("two semi infinite", () => {
        expectOverlap(nsf.interval(-Infinity, 0), nsf.interval(-Infinity, 100));
        expectOverlap(nsf.interval(0, Infinity), nsf.interval(100, Infinity));
        expectDisjoint(nsf.interval(-Infinity, -1), nsf.interval(1, Infinity));
        expectOverlap(nsf.interval(-Infinity, 0), nsf.interval(0, Infinity));
        expectOverlap(nsf.interval(-Infinity, 1), nsf.interval(-1, Infinity));
    });

    it("special cases", () => {
        expectOverlap(nsf.FULL, nsf.FULL);
    });
});
