import * as nsf from "../src/index";

const X = nsf.union([nsf.interval(-10, -1), nsf.interval(100, 120)]);
const Y = nsf.union([nsf.interval(-10, 2)]);
const Q = nsf.div(X, Y);

console.log(`(${X.toString()}) / ${Y.toString()} = ${Q.toString()}`);
