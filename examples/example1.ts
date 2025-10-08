import * as nsf from "../src/index";

let a = 0.1;
let x = nsf.union([nsf.interval(0.1)]);
const sixteen = nsf.union([nsf.inter(16)]);

for (let i = 0; i < 20; i++) {
    a = 16 * a - 1.5;
    x = nsf.usub(nsf.umul(sixteen, x), nsf.union([nsf.inter(1.5)]));
    console.log(a, x.toString());
}
