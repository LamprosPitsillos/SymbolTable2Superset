export type Test = {
    input: any;
    output: any;
}
export type Tests = Test[][];
export type TestFunc = (input: any) => any;

const RED = "\x1b[31m"
const GREEN = "\x1b[32m"
const RESET = "\x1b[0m"
const BOLD = "\x1b[1m"

export function TestRun(tests: Tests, testFunction: TestFunc, preTest?:()=>void, postTest?:()=>void) {

    console.time('Overall Duration for All Tests');
    let passed = 0;
    let failed = 0;
    const failed_msg = `${RED}${"=".repeat(30)}FAIL${"=".repeat(30)}${RESET}`;
    const pass_msg = `${GREEN}${"=".repeat(30)}PASS${"=".repeat(30)}${RESET}`;
    function pass() {
        passed += 1;
        console.log(pass_msg);

    }
    function fail(expected: any) {
        failed += 1;
        console.log(`Expected value is '${expected}'`);
        console.log(failed_msg);
    }
    for (const test of tests) {

        preTest?.()
        for (const { input, output } of test) {

            console.time('Dt');
            const result = testFunction(input)
            if (result === output) pass();
            else { console.log(input, result); fail(output); }
            console.timeEnd('Dt');
        }
        postTest?.()
    }

    console.log();
    console.log(`${GREEN}PASSED: ${BOLD}${passed}${RESET}`);
    console.log(`${RED}FAILED: ${BOLD}${failed}${RESET}`);
    console.log();
    console.timeEnd('Overall Duration for All Tests'); // End the overall timer
}
