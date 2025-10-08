import { ICat, produceMDTable, produceTestCases } from "./genTools.ts";

const ninf = "-inf";
const pinf = "+inf";

(() => {
    const real: ICat = [
        ["1", "2"],
        ["60", "100"],
    ];

    const inf: ICat = [
        [ninf, "0"],
        ["0", pinf],
        [ninf, pinf],
    ];

    const categories: [string, ICat][] = [
        ["Real", real],
        ["Infinite", inf],
    ];

    // Generate add/sub test cases
    // produceTestCases(categories, "add", true);
    // produceTestCases(categories, "sub", false);
})();

(() => {
    const real: ICat = [
        ["1", "2"],
        ["-2", "-1"],
        ["-20", "10"],
        ["0", "5"],
        ["0", "0"],
    ];

    const inf: ICat = [
        [ninf, "-100"],
        [ninf, "0"],
        ["100", pinf],
        [ninf, pinf],
    ];

    const categories: [string, ICat][] = [
        ["Real", real],
        ["Infinite", inf],
    ];

    // Generate mul test cases
    // produceTestCases(categories, "mul", true);
})();
