import * as nsf from "../src/index";

let a = 0.1;
let x = nsf.single(0.1);
const sixteen = nsf.single(16);

for (let i = 0; i < 20; i++) {
    a = 16 * a - 1.5;
    x = nsf.sub(nsf.mul(sixteen, x), nsf.single(1.5));
    console.log(a, x.toString());
}
