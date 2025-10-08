import * as nsf from "../src/index";

const X = nsf.union([nsf.inter(-10, -1), nsf.inter(100, 120)]);
const Y = nsf.union([nsf.inter(-10, 2)]);
const Q = nsf.udiv(X, Y);

console.log(`(${X.toString()}) / ${Y.toString()} = ${Q.toString()}`);
