import { describe, it } from "node:test";
import assert from "node:assert";

import * as nsf from "../src/index.ts";
import {
    realIntervals,
    semiInfiniteIntervals,
    degenerateFiniteIntervals,
} from "./testIntervals.ts";

describe("interval class functions", () => {
    it("real intervals", () => {
        realIntervals.forEach((i) => {
            assert(!i.isFull());
            assert(i.isFinite());
            assert(!i.isDegenerate());

            assert(i.contains(i.lo));
            assert(i.contains(i.hi));

            assert(i.contains(nsf.next(i.lo)));
            assert(i.contains(nsf.prev(i.hi)));
            assert(!i.contains(nsf.prev(i.lo)));
            assert(!i.contains(nsf.next(i.hi)));

            assert(!i.superset(nsf.FULL));
            assert(i.superset(i));
            assert(i.subset(i));
            assert(i.superset(nsf.interval(i.lo, i.hi)));
        });
    });

    it("semi infinite intervals", () => {
        semiInfiniteIntervals.forEach((i) => {
            assert(!i.isFull());
            assert(!i.isFinite());
            assert(!i.isDegenerate());

            assert(i.contains(i.lo));
            assert(i.contains(i.hi));

            assert(i.contains(nsf.next(i.lo)));
            assert(i.contains(nsf.prev(i.hi)));

            assert(!i.superset(nsf.FULL));
            assert(i.superset(i));
            assert(i.subset(i));
            assert(i.superset(nsf.interval(i.lo, i.hi)));
        });
    });

    it("degenerate finite intervals", () => {
        degenerateFiniteIntervals.forEach((i) => {
            assert(!i.isFull());
            assert(i.isFinite());
            assert(i.isDegenerate());

            assert(i.contains(i.lo));
            assert(i.contains(i.hi));

            assert.strictEqual(i.lo, i.hi);

            assert(!i.contains(nsf.prev(i.lo)));
            assert(!i.contains(nsf.next(i.lo)));
            assert(!i.contains(nsf.next(i.hi)));
            assert(!i.contains(nsf.prev(i.hi)));

            assert(!i.superset(nsf.FULL));
            assert(i.superset(i));
            assert(i.subset(i));
        });
    });

    it("bahaves as expected with NaN input", () => {
        assert.throws(() => {
            nsf.interval(NaN);
        });
        assert.throws(() => {
            nsf.interval(NaN, 0);
        });
        assert.throws(() => {
            nsf.interval(0, NaN);
        });
        assert.throws(() => {
            nsf.interval(NaN, NaN);
        });

        realIntervals.forEach((i) => {
            assert.ok(!i.contains(NaN));
        });

        semiInfiniteIntervals.forEach((i) => {
            assert.ok(!i.contains(NaN));
        });

        degenerateFiniteIntervals.forEach((i) => {
            assert.ok(!i.contains(NaN));
        });
    });

    it("full interval", () => {
        const i = nsf.FULL;

        assert(i.isFull());
        assert(!i.isFinite());
        assert(!i.isDegenerate());

        assert(i.contains(i.lo));
        assert(i.contains(i.hi));

        assert(i.contains(nsf.next(i.lo)));
        assert(i.contains(nsf.prev(i.hi)));
        assert(i.contains(nsf.prev(i.lo)));
        assert(i.contains(nsf.next(i.hi)));

        assert(i.superset(nsf.FULL));
        assert(i.superset(i));
        assert(i.subset(i));
        assert(i.superset(nsf.interval(i.lo, i.hi)));
    });
});
