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
});
