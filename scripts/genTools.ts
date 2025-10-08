export type ICat = [string, string][];

export type CatPair = [[string, string], [string, string]][];

export function genCatCommutativePairsSame(catA: ICat) {
    let ret: CatPair = [];
    catA.forEach(([a, b], i) => {
        catA.slice(i).forEach(([c, d]) => {
            ret.push([
                [a, b],
                [c, d],
            ]);
        });
    });
    return ret;
}

export function genCatCommutativePairsDiff(catA: ICat, catB: ICat) {
    let ret: CatPair = [];
    catA.forEach(([a, b]) => {
        catB.forEach(([c, d]) => {
            ret.push([
                [a, b],
                [c, d],
            ]);
        });
    });
    return ret;
}

export function genCatNonCommutativePairsSame(catA: ICat) {
    let ret: CatPair = [];
    catA.forEach(([a, b], i) => {
        catA.forEach(([c, d]) => {
            ret.push([
                [a, b],
                [c, d],
            ]);
        });
    });
    return ret;
}

export function genCatNonCommutativePairsDiff(catA: ICat, catB: ICat) {
    let ret: CatPair = [];
    catA.forEach(([a, b]) => {
        catB.forEach(([c, d]) => {
            ret.push([
                [a, b],
                [c, d],
            ]);
            ret.push([
                [c, d],
                [a, b],
            ]);
        });
    });
    return ret;
}

export function renderMDPair(cp: CatPair) {
    cp.forEach(([[a, b], [c, d]]) => {
        const aStr = a.toString();
        const bStr = b.toString();
        const cStr = c.toString().replace("a", "c");
        const dStr = d.toString().replace("b", "d");

        console.log(`| ($${aStr}$, $${bStr}$) | ($${cStr}$, $${dStr}$) | |`);
    });
}

export function produceMDTable(categories: [string, ICat][], opSymbol: string) {
    const tableHeader = `|     A      |     B      |          A ${opSymbol} B           |
| ---------------------: | ---------------------: | ----: |`;

    categories.forEach(([nameA, catA], iA) => {
        categories.slice(iA).forEach(([nameB, catB]) => {
            console.log(`*${nameA} ${opSymbol} ${nameB}:*`);
            console.log("");
            console.log(tableHeader);
            const L =
                nameA === nameB
                    ? genCatCommutativePairsSame(catA)
                    : genCatCommutativePairsDiff(catA, catB);
            renderMDPair(L);
            console.log("");
        });
    });
}

export function renderTestCasePair(cp: CatPair, nsfFunction: string) {
    cp.forEach(([[a, b], [c, d]]) => {
        const aStr = a.toString();
        const bStr = b.toString();
        const cStr = c.toString().replace("a", "c");
        const dStr = d.toString().replace("b", "d");

        console.log(
            `equal(${nsfFunction}(int(${aStr}, ${bStr}), int(${cStr}, ${dStr})), int(NaN, NaN));`
        );
    });
}

export function produceTestCases(
    categories: [string, ICat][],
    nsfFunction: string,
    commute: boolean // true if the function is commutative
) {
    console.log(`it("${nsfFunction}", () => {`);
    categories.forEach(([nameA, catA], iA) => {
        categories.slice(iA).forEach(([nameB, catB]) => {
            console.log(`// ${nsfFunction}(): <${nameA}> and <${nameB}>`);

            let L;
            if (commute && nameA === nameB) {
                L = genCatCommutativePairsSame(catA);
            } else if (commute && nameA !== nameB) {
                L = genCatCommutativePairsDiff(catA, catB);
            } else if (!commute && nameA === nameB) {
                L = genCatNonCommutativePairsSame(catA);
            } else {
                L = genCatNonCommutativePairsDiff(catA, catB);
            }
            renderTestCasePair(L, nsfFunction);
            console.log("");
        });
    });
    console.log("});");
}
