import { describe, it } from "node:test";
import assert from "node:assert";

import * as nsf from "../src/index.ts";

function ordered(U: nsf.Union): boolean {
    if (U.intervals.length <= 1) return true;

    for (let i = 0; i < U.intervals.length - 1; i++) {
        const curr = U.intervals[i];
        const next = U.intervals[i + 1];
        if (curr.hi > next.lo) return false;
    }
    return true;
}

describe("union", () => {
    it("union creation", () => {
        assert.ok(ordered(nsf.union([])));
        assert.ok(ordered(nsf.union([nsf.interval(-Infinity, Infinity)])));
        assert.ok(ordered(nsf.union([nsf.interval(0, 0)])));
        assert.ok(ordered(nsf.union([nsf.interval(1, 2), nsf.interval(4, 10)])));
        assert.ok(ordered(nsf.union([nsf.interval(1, 2), nsf.interval(-10, -5)])));
        assert.ok(ordered(nsf.union([nsf.interval(1, 2), nsf.interval(-5, 5)])));
    });

    it("union contains", () => {
        const a = nsf.union([nsf.interval(0, 10), nsf.interval(50, 60)]);
        assert.ok(!nsf.EMPTY.contains(0));
        assert.ok(a.contains(0));
        assert.ok(a.contains(1));
        assert.ok(a.contains(50));
        assert.ok(a.contains(55));
        assert.ok(a.contains(60));
        assert.ok(!a.contains(61));
        assert.ok(!a.contains(49));
        assert.ok(!a.contains(-1));
        assert.ok(!a.contains(15));
    });

    it("union subset", () => {
        const a = nsf.union([nsf.interval(0, 10), nsf.interval(50, 60)]);
        assert.ok(a.subset(nsf.single(0, 100)));
        assert.ok(a.subset(nsf.FULL));
        assert.ok(a.subset(nsf.union([nsf.interval(-1, 11), nsf.interval(45, 65)])));

        assert.ok(nsf.EMPTY.subset(nsf.FULL));
    });

    it("union superset", () => {
        const a = nsf.union([nsf.interval(0, 10), nsf.interval(50, 60)]);
        assert.ok(a.superset(nsf.single(0, 1)));
        assert.ok(a.superset(nsf.EMPTY));
        assert.ok(a.superset(nsf.union([nsf.interval(2, 3), nsf.interval(5, 6)])));
        assert.ok(nsf.FULL.superset(nsf.EMPTY));
    });
});
