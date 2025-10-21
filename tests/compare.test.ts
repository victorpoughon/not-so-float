import { describe, it } from "node:test";
import assert from "node:assert";

// Public API
import * as nsf from "../src/index.ts";

// Internals
import { iintersection } from "../src/compare.ts";
import { IFULL } from "../src/interval.ts";

// Shortcuts for more compact notation
const int = nsf.interval;
const inf = Infinity;

describe("overlap and disjoint intervals", () => {
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
        expectOverlap(int(-inf, 0), IFULL);
        expectOverlap(int(0, inf), IFULL);

        expectOverlap(int(1, 2), int(0, inf));
        expectOverlap(int(-2, -1), int(-inf, 0));

        expectDisjoint(int(-2, -1), int(0, inf));
        expectDisjoint(int(1, 2), int(-inf, 0));

        expectOverlap(int(1, 2), IFULL);
        expectOverlap(IFULL, IFULL);
    });
});

describe("intersection of intervals", () => {
    it("two real intervals", () => {
        // disjoint
        assert.deepEqual(iintersection(int(1, 2), int(3, 4)), null);

        // overlap
        assert.deepEqual(iintersection(int(1, 2), int(2, 3)), int(2, 2));
        assert.deepEqual(iintersection(int(1, 3), int(2, 4)), int(2, 3));
        assert.deepEqual(iintersection(int(1, 3), int(2, 3)), int(2, 3));
        assert.deepEqual(iintersection(int(1, 4), int(2, 3)), int(2, 3));
        assert.deepEqual(iintersection(int(1, 3), int(1, 2)), int(1, 2));
        assert.deepEqual(iintersection(int(1, 2), int(1, 2)), int(1, 2));
        assert.deepEqual(iintersection(int(1, 2), int(2, 3)), int(2, 2));
    });

    it("one semi infinite, one real", () => {
        // disjoint
        assert.deepEqual(iintersection(int(-inf, 0), int(1, 2)), null);
        assert.deepEqual(iintersection(int(0, inf), int(-2, -1)), null);

        // overlap
        assert.deepEqual(iintersection(int(-inf, 1), int(1, 2)), int(1, 1));
        assert.deepEqual(iintersection(int(-inf, 1.5), int(1, 2)), int(1, 1.5));
        assert.deepEqual(iintersection(int(-inf, 2), int(1, 2)), int(1, 2));
        assert.deepEqual(iintersection(int(-inf, 3), int(1, 2)), int(1, 2));
        assert.deepEqual(iintersection(int(-1, inf), int(-2, -1)), int(-1, -1));
        assert.deepEqual(iintersection(int(-1.5, inf), int(-2, -1)), int(-1.5, -1));
        assert.deepEqual(iintersection(int(-2, inf), int(-2, -1)), int(-2, -1));
        assert.deepEqual(iintersection(int(-3, inf), int(-2, -1)), int(-2, -1));
        assert.deepEqual(iintersection(int(1, 2), int(0, inf)), int(1, 2));
        assert.deepEqual(iintersection(int(-2, -1), int(-inf, 0)), int(-2, -1));
    });

    it("two semi infinite", () => {
        assert.deepEqual(iintersection(int(-inf, -1), int(1, inf)), null);

        assert.deepEqual(iintersection(int(-inf, 0), int(-inf, 100)), int(-inf, 0));
        assert.deepEqual(iintersection(int(0, inf), int(100, inf)), int(100, inf));
        assert.deepEqual(iintersection(int(-inf, 0), int(0, inf)), int(0, 0));
        assert.deepEqual(iintersection(int(-inf, 1), int(-1, inf)), int(-1, 1));
    });

    it("FULL and another", () => {
        // semi infinite
        assert.deepEqual(iintersection(int(-inf, 0), IFULL), int(-inf, 0));
        assert.deepEqual(iintersection(int(0, inf), IFULL), int(0, inf));

        // real
        assert.deepEqual(iintersection(int(1, 2), IFULL), int(1, 2));

        // full
        assert.deepEqual(iintersection(IFULL, IFULL), IFULL);
    });
});

describe("intersection of unions", () => {
    it("two real unions", () => {
        const A = nsf.union([int(3, 8), int(12, 13), int(15, 16), int(17, 18)]);

        const B = nsf.union([
            int(0, 1),
            int(2, 4),
            int(5, 6),
            int(7, 9),
            int(10, 11),
            int(14, 19),
            int(20, 21),
        ]);

        assert.deepEqual(
            nsf.intersection(A, B),
            nsf.union([int(3, 4), int(5, 6), int(7, 8), int(15, 16), int(17, 18)])
        );

        assert.ok(nsf.overlap(A, B));
        assert.ok(nsf.overlap(B, A));
        assert.ok(!nsf.disjoint(A, B));
        assert.ok(!nsf.disjoint(B, A));
    });

    it("semi-infinite unions", () => {
        const A = nsf.union([int(-inf, 0), int(10, 11), int(10000, 10001)]);
        const B = nsf.union([int(-10, -5), int(11, 12), int(15, inf)]);

        assert.deepEqual(
            nsf.intersection(A, B),
            nsf.union([int(-10, -5), int(11, 11), int(10000, 10001)])
        );

        assert.ok(nsf.overlap(A, B));
        assert.ok(nsf.overlap(B, A));
        assert.ok(!nsf.disjoint(A, B));
        assert.ok(!nsf.disjoint(B, A));
    });

    it("infinite or empty unions", () => {
        const full = IFULL;
        const empty = nsf.EMPTY;
        const A = nsf.union([int(-inf, 0), int(10, 11), int(10000, 10001)]);

        // Real and empty
        assert.deepEqual(nsf.intersection(A, empty), empty);
        assert.deepEqual(nsf.intersection(empty, A), empty);
        assert.ok(nsf.disjoint(A, empty));
        assert.ok(nsf.disjoint(empty, A));
        assert.ok(!nsf.overlap(A, empty));
        assert.ok(!nsf.overlap(empty, A));

        // Real and full
        assert.deepEqual(nsf.intersection(A, full), A);
        assert.deepEqual(nsf.intersection(A, full), A);
        assert.ok(!nsf.disjoint(A, full));
        assert.ok(!nsf.disjoint(full, A));
        assert.ok(nsf.overlap(A, full));
        assert.ok(nsf.overlap(full, A));
    });
});

describe("complement of a union", () => {
    it("real union", () => {
        assert.deepEqual(
            nsf.complement(nsf.union([int(3, 8)])),
            nsf.union([int(-inf, 3), int(8, inf)])
        );

        assert.deepEqual(nsf.complement(nsf.union([int(0, 0)])), nsf.union([IFULL]));
        assert.deepEqual(nsf.complement(nsf.union([int(0, 0), int(1, 1)])), nsf.union([IFULL]));

        assert.deepEqual(
            nsf.complement(nsf.union([int(3, 8), int(12, 13), int(15, 16), int(17, 18)])),
            nsf.union([int(-inf, 3), int(8, 12), int(13, 15), int(16, 17), int(18, inf)])
        );

        assert.deepEqual(
            nsf.complement(
                nsf.union([int(-inf, 3), int(8, 12), int(13, 15), int(16, 17), int(18, inf)])
            ),
            nsf.union([int(3, 8), int(12, 13), int(15, 16), int(17, 18)])
        );
    });

    it("empty or full", () => {
        assert.deepEqual(nsf.complement(nsf.union([IFULL])), nsf.EMPTY);
        assert.deepEqual(nsf.complement(nsf.EMPTY), nsf.union([IFULL]));
    });
});
