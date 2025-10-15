# Not So Float

![NPM Version](https://img.shields.io/npm/v/not-so-float)
![NPM License](https://img.shields.io/npm/l/not-so-float)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/victorpoughon/not-so-float/node.js.yml)

**Not So Float** is a pure TypeScript library that implements **Interval Union
Arithmetic** over IEEE 754 double precision floats (JS numbers).

> [!TIP]
> Try [the interval
> calculator](https://victorpoughon.github.io/interval-calculator/) for an
> interactive demo of interval union arithmetic.

```typescript
import * as nsf from "not-so-float";

const X = nsf.union([nsf.inter(-10, -1), nsf.inter(100, 120)]);
const Y = nsf.union([nsf.inter(-10, 2)]);
const Q = nsf.udiv(X, Y);

console.log(`(${X.toString()}) / ${Y.toString()} = ${Q.toString()}`);
```

```
([-10, -1] U [100, 120]) / [-10, 2] = [-Infinity, -0.49999999999999994] U [0.09999999999999999, Infinity]
```

References:

-   [Hickey, T., Ju, Q. and Van Emden, M.H., 2001. Interval arithmetic: From principles to implementation. Journal of the ACM (JACM), 48(5), pp.1038-1068.](https://fab.cba.mit.edu/classes/S62.12/docs/Hickey_interval.pdf)
-   [Schichl, H., Domes, F., Montanher, T. and Kofler, K., 2017. Interval unions. BIT Numerical Mathematics, 57(2), pp.531-556.](https://www.ime.usp.br/~montanhe/unions.pdf)

Design goals:

-   No dependencies
-   Functional (stateless) API
-   Strong focus on simplicity and clarity of implementation
-   No signed zero convention, `-0 === 0` should still be true in the context of interval bounds
-   No empty interval, but empty unions
-   Support division by intervals containing zero without compromise

> [!TIP]
> If you like this open-source project consider [sponsoring me](https://github.com/sponsors/victorpoughon) on GitHub, thank you ❤️

## Installation

`not-so-float` build version is available [on npm](https://www.npmjs.com/package/not-so-float):

```sh
npm install not-so-float
```

## Outward Rounding

The main interest of interval arithmetic is the inclusion property. Any interval
operation result is always guaranteed to contain all possible results obtained
from the underlying real operation. However floating point operations are
inexact. So we must use _outward rounding_ when computing interval bounds to
maintain the inclusion property.

Unfortunately JS doesn't allow controling the IEEE 754 rounding mode, and rounds
to the nearest representable float, like most programming languages. This is a
computer science tragedy of the first order, because IEEE 754 actually specifies
rounding modes that would allow clean implementations of interval arithmetic
natively. Instead, we implement two functions: `next()` and `prev()` using typed
arrays bit manipulation. These functions return the next and previous
representable floating point value, exactly like the C function
[`nextafter()`](https://en.cppreference.com/w/c/numeric/math/nextafter).

```typescript
function next(x: number): number;
function prev(x: number): number;
```

By making sure every interval bound operation rounds outward, we can maintain
the inclusion property even with numerical precision errors inherent to floating
point.

## Interval

An interval is a pair of IEEE 754 double precision numbers called the lower (lo)
and upper (hi) bounds:

$$
[\text{ lo}, \text{ hi }]
$$

The only restriction is that bounds must always be less or equal: $\text{lo}
\leq \text{hi}$. The lower bound may be negative infinity, the upper bound may
be positive infinity. This table describes the set of real numbers that an
interval represents:

<div align="center">

|    lo     |    hi     | Interval Type | Represents<br> any $x \in \mathbb{R}$ such that |
| :-------: | :-------: | :-----------: | :---------------------------------------------: |
|    $a$    |    $b$    |     Real      |                $a \leq x \leq$ b                |
| $-\infty$ |    $b$    | Semi-Infinite |                   $x \leq b$                    |
|    $a$    | $+\infty$ | Semi-Infinite |                   $a  \leq x$                   |
| $-\infty$ | $+\infty$ |   Infinite    |               $x \in \mathbb{R}$                |

</div>

Where $a$ and $b$ are real IEEE 754 values (not infinite).  
The special case when both bounds are equal is called a _degenerate_ interval.

To construct an interval, use the `nsf.inter()` function:

```typescript
nsf.inter(a: number, b: number) : Interval
```

For example:

```typescript
> I = nsf.inter(0, 6)
Interval { lo: 0, hi: 6 }
```

The interval class member functions:

```typescript
class Interval {
    isFull(): boolean;
    isFinite(): boolean;
    isDegenerate(): boolean;
    contains(value: number): boolean;
    superset(other: Interval): boolean;
    subset(other: Interval): boolean;
    toString(numbers?: (x: number) => string): string;
    print(): void;
}
```

## Union

A union is an ordered disjoint set of intervals:

$$
[a, b] \cup [c, d] \ldots \cup [e, f]
$$

To construct a union, use the `nsf.union()` function:

```typescript
nsf.union(intervals: Interval[]) : Union
```

Union class member functions:

```typescript
class Union {
    forEach(callback: (x: Interval, index: number) => void): void;
    toString(numbers?: (x: number) => string): string;
    print(): void;
}
```

For example:

```typescript
> const U = nsf.union([nsf.inter(1, 2), nsf.inter(4, 6)])
> U.toString()
'[1, 2] U [4, 6]'
> U.intervals
[ Interval { lo: 1, hi: 2 }, Interval { lo: 4, hi: 6 } ]
```

## Compare

Compare intervals and unions with the following utility functions:

```typescript
function overlap(A: Interval | Union, B: Interval | Union): boolean;
function disjoint(A: Interval | Union, B: Interval | Union): boolean;
```

## Arithmetic

<div align="center">

|                                   Operation | API function       |
| ------------------------------------------: | :----------------- |
|                                    Addition | `nsf.add(A, B)`    |
|                              Unary negation | `nsf.neg(A)`       |
|                                 Subtraction | `nsf.sub(A, B)`    |
|                              Multiplication | `nsf.mul(A, B)`    |
|                                    Division | `nsf.div(A, B)`    |
|        Exponentiation<br>(integer exponent) | `nsf.powInt(A, n)` |
| Exponentiation<br>(interval/union exponent) | `nsf.pow(A, B)`    |

</div>

> [!IMPORTANT]
> Note that **every operation returns a union**. This is for consistency, because
> while some operations (add, sub, mul) between intervals can return a single
> interval, others (division, exponentiation, log, sqrt) can return zero, one or
> two disjoint intervals even with interval inputs.

## Unary Functions

<div align="center">

|         Operation | API function  |
| ----------------: | :------------ |
|    Absolute value | `nsf.abs(A)`  |
| Natural logarithm | `nsf.log(A)`  |
|       Exponential | `nsf.exp(A)`  |
|       Square root | `nsf.sqrt(A)` |
|            Cosine | `nsf.cos(A)`  |
|              Sine | `nsf.sin(A)`  |
|           Tangent | `nsf.tan(A)`  |

</div>

## Binary Functions

<div align="center">

| Operation | API function    |
| --------: | :-------------- |
|   Minimum | `nsf.min(A, B)` |
|   Maximum | `nsf.max(A, B)` |

</div>

## Future improvements

* Support multiple rounding modes
* Add shortcut function for `nsf.union(nsf.inter([x]))`
* Change FULL constant to Union