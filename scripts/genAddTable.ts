import { ICat, produceMDTable, produceTestCases } from "./genTools.ts";

const ninf = "-\\infty";
const pinf = "+\\infty";

const real: ICat = [["a", "b"]];

const inf: ICat = [
    [ninf, "b"],
    ["a", pinf],
    [ninf, pinf],
];

const categories: [string, ICat][] = [
    ["Real", real],
    ["Infinite", inf],
];

// Generate nsf.add() markdown table
produceMDTable(categories, "+");
