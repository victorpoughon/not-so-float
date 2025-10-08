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
        assert.ok(ordered(nsf.union([nsf.inter(-Infinity, Infinity)])));
        assert.ok(ordered(nsf.union([nsf.inter(0, 0)])));
        assert.ok(ordered(nsf.union([nsf.inter(1, 2), nsf.inter(4, 10)])));
        assert.ok(ordered(nsf.union([nsf.inter(1, 2), nsf.inter(-10, -5)])));
        assert.ok(ordered(nsf.union([nsf.inter(1, 2), nsf.inter(-5, 5)])));
    });
});
