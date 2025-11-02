export const defaultNumbers = (x: number) => x.toString();

export class Interval {
    constructor(readonly lo: number, readonly hi: number) {}

    public isFull(): boolean {
        return this.lo === -Infinity && this.hi === Infinity;
    }

    public isFinite(): boolean {
        return isFinite(this.lo) && isFinite(this.hi);
    }

    public isDegenerate(): boolean {
        return this.lo === this.hi;
    }

    public contains(value: number): boolean {
        return this.lo <= value && value <= this.hi;
    }

    public superset(other: Interval): boolean {
        return this.contains(other.lo) && this.contains(other.hi);
    }

    public subset(other: Interval): boolean {
        return other.superset(this);
    }

    public width() : number {
        return this.hi - this.lo;
    }

    public toString(numbers: (x: number) => string = defaultNumbers): string {
        return `[${numbers(this.lo)}, ${numbers(this.hi)}]`;
    }

    public print(): void {
        console.log(this.toString());
    }
}

function typeCheckIntervalBound(v: any) {
    if (typeof v !== "number") {
        throw TypeError(`Interval bounds must be a number, got ${typeof v}`);
    }
    if (isNaN(v)) {
        throw TypeError(`Interval bounds must not be NaN`);
    }
}

// Construct an interval
// If two bounds are given, create [a, b]
// If a single bound is given, create [v, v], a singleton interval [v, v] which
// contains only one float, also sometimes called a "degenerate" interval
// Bounds may be infinite but must obey a <= b
export function interval(a: number, b?: number): Interval {
    if (typeof b === "undefined") {
        b = a;
    }
    typeCheckIntervalBound(a);
    typeCheckIntervalBound(b);

    if (a > b) {
        throw TypeError("Interval bound must be such that lo <= hi");
    }
    if (a === Infinity) {
        throw TypeError("Interval lower bound cannot be Infinity");
    }
    if (b === -Infinity) {
        throw TypeError("Interval lower bound cannot be -Infinity");
    }

    return new Interval(a, b);
}

export function typeCheckIsInterval(x: any): x is Interval {
    if (!(x instanceof Interval)) {
        throw TypeError(`Argument must be an interval (got type ${typeof x})`);
    }
    return true;
}

export const IFULL = new Interval(-Infinity, Infinity);