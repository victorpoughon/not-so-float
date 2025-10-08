function produceTestCases(
    intervals: [[string, string], string][],
    comment: (a: string, b: string) => string,
    placeholder: string,
    commutative: boolean
) {
    console.log("");
    intervals.forEach(([[a, b], xtype], i) => {
        intervals.slice(commutative ? i : 0).forEach(([[c, d], ytype]) => {
            console.log(
                `eq(int(${a}, ${b}), int(${c}, ${d}), ${placeholder}) // ${comment(xtype, ytype)}`
            );
        });
    });
    console.log("");
}

//////////////////////////

const ninf = "-inf";
const pinf = "+inf";

(() => {
    const intervals: [[string, string], string][] = [
        [["0", "20"], "P0"],
        [["0", pinf], "P0+"],
        [["1", "2"], "P1"],
        [["10", pinf], "P1+"],
        [["-50", "50"], "M"],
        [[ninf, "50"], "M-"],
        [["-50", pinf], "M+"],
        [["-30", "0"], "N0"],
        [[ninf, "0"], "N0-"],
        [["-5", "-4"], "N1"],
        [[ninf, "-20"], "N1-"],
        [[ninf, pinf], "FULL"],
        [["0", "0"], "Z"],
    ];

    // add
    produceTestCases(intervals, (a, b) => `${a} + ${b}`, "int(prev(NaN), next(NaN))", true);

    // sub
    produceTestCases(intervals, (a, b) => `${a} - ${b}`, "int(prev(NaN), next(NaN))", false);

    // mul
    produceTestCases(intervals, (a, b) => `${a} * ${b}`, "int(prev(NaN), next(NaN))", true);

    // div
    produceTestCases(intervals, (a, b) => `${a} / ${b}`, "[int(prev(NaN), next(NaN))]", false);
})();
