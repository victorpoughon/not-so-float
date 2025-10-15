import { describe, it } from "node:test";
import assert from "node:assert";

import * as nsf from "../src/index.ts";

// Shortcuts for more compact notation
const int = nsf.inter;
const inf = Infinity;

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
        expectDisjoint(int(1, 2), int(3, 4));
        expectOverlap(int(1, 2), int(2, 3));
        expectOverlap(int(1, 3), int(2, 4));
        expectOverlap(int(1, 3), int(2, 3));
        expectOverlap(int(1, 4), int(2, 3));
        expectOverlap(int(1, 3), int(1, 2));
        expectOverlap(int(1, 2), int(1, 2));
    });

    it("one semi infinite, one real", () => {
        expectDisjoint(int(-inf, 0), int(1, 2));
        expectOverlap(int(-inf, 1), int(1, 2));
        expectOverlap(int(-inf, 1.5), int(1, 2));
        expectOverlap(int(-inf, 2), int(1, 2));
        expectOverlap(int(-inf, 3), int(1, 2));

        expectDisjoint(int(0, inf), int(-2, -1));
        expectOverlap(int(-1, inf), int(-2, -1));
        expectOverlap(int(-1.5, inf), int(-2, -1));
        expectOverlap(int(-2, inf), int(-2, -1));
        expectOverlap(int(-3, inf), int(-2, -1));
    });

    it("two semi infinite", () => {
        expectOverlap(int(-inf, 0), int(-inf, 100));
        expectOverlap(int(0, inf), int(100, inf));
        expectDisjoint(int(-inf, -1), int(1, inf));
        expectOverlap(int(-inf, 0), int(0, inf));
        expectOverlap(int(-inf, 1), int(-1, inf));
    });

    it("FULL and another", () => {
        expectOverlap(int(-inf, 0), nsf.FULL);
        expectOverlap(int(0, inf), nsf.FULL);

        expectOverlap(int(1, 2), int(0, inf));
        expectOverlap(int(-2, -1), int(-inf, 0));

        expectDisjoint(int(-2, -1), int(0, inf));
        expectDisjoint(int(1, 2), int(-inf, 0));

        expectOverlap(int(1, 2), nsf.FULL);
        expectOverlap(nsf.FULL, nsf.FULL);
    });
});

describe("intersection of intervals", () => {
    it("two real intervals", () => {
        // disjoint
        assert.deepEqual(nsf.iintersection(int(1, 2), int(3, 4)), null);

        // overlap
        assert.deepEqual(nsf.iintersection(int(1, 2), int(2, 3)), int(2, 2));
        assert.deepEqual(nsf.iintersection(int(1, 3), int(2, 4)), int(2, 3));
        assert.deepEqual(nsf.iintersection(int(1, 3), int(2, 3)), int(2, 3));
        assert.deepEqual(nsf.iintersection(int(1, 4), int(2, 3)), int(2, 3));
        assert.deepEqual(nsf.iintersection(int(1, 3), int(1, 2)), int(1, 2));
        assert.deepEqual(nsf.iintersection(int(1, 2), int(1, 2)), int(1, 2));
    });

    it("one semi infinite, one real", () => {
        // disjoint
        assert.deepEqual(nsf.iintersection(int(-inf, 0), int(1, 2)), null);
        assert.deepEqual(nsf.iintersection(int(0, inf), int(-2, -1)), null);

        // overlap
        assert.deepEqual(nsf.iintersection(int(-inf, 1), int(1, 2)), int(1, 1));
        assert.deepEqual(nsf.iintersection(int(-inf, 1.5), int(1, 2)), int(1, 1.5));
        assert.deepEqual(nsf.iintersection(int(-inf, 2), int(1, 2)), int(1, 2));
        assert.deepEqual(nsf.iintersection(int(-inf, 3), int(1, 2)), int(1, 2));
        assert.deepEqual(nsf.iintersection(int(-1, inf), int(-2, -1)), int(-1, -1));
        assert.deepEqual(nsf.iintersection(int(-1.5, inf), int(-2, -1)), int(-1.5, -1));
        assert.deepEqual(nsf.iintersection(int(-2, inf), int(-2, -1)), int(-2, -1));
        assert.deepEqual(nsf.iintersection(int(-3, inf), int(-2, -1)), int(-2, -1));
        assert.deepEqual(nsf.iintersection(int(1, 2), int(0, inf)), int(1, 2));
        assert.deepEqual(nsf.iintersection(int(-2, -1), int(-inf, 0)), int(-2, -1));
    });

    it("two semi infinite", () => {
        assert.deepEqual(nsf.iintersection(int(-inf, -1), int(1, inf)), null);

        assert.deepEqual(nsf.iintersection(int(-inf, 0), int(-inf, 100)), int(-inf, 0));
        assert.deepEqual(nsf.iintersection(int(0, inf), int(100, inf)), int(100, inf));
        assert.deepEqual(nsf.iintersection(int(-inf, 0), int(0, inf)), int(0, 0));
        assert.deepEqual(nsf.iintersection(int(-inf, 1), int(-1, inf)), int(-1, 1));
    });

    it("FULL and another", () => {
        // semi infinite
        assert.deepEqual(nsf.iintersection(int(-inf, 0), nsf.FULL), int(-inf, 0));
        assert.deepEqual(nsf.iintersection(int(0, inf), nsf.FULL), int(0, inf));

        // real
        assert.deepEqual(nsf.iintersection(int(1, 2), nsf.FULL), int(1, 2));

        // full
        assert.deepEqual(nsf.iintersection(nsf.FULL, nsf.FULL), nsf.FULL);
    });
});
