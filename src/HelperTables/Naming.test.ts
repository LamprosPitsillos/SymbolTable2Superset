import { Tests, TestRun } from "./TestRunner";
import { detectNamingConvention } from "./Naming";

const testCases: Tests = [
    [{ input: "myVariableName", output: "Camel Case" }],
    [{ input: "MyVariableName", output: "Pascal Case" }],
    [{ input: "my_variable_name", output: "Snake Case" }],
    [{ input: "my-variable-name", output: "Kebab Case" }],
    [{ input: "UPPERCASE", output: "UPPERCASE" }],
    [{ input: "SCREAMING_SNAKE_CASE", output: "SCREAMING_SNAKE_CASE" }],
    [{ input: "camel_Snake_Case", output: "Camel_Snake_Case" }],
    [{ input: "Pascal_Snake_Case", output: "Pascal_Snake_Case" }],
    [{ input: "SCREAMING-KEBAB-CASE", output: "SCREAMING-KEBAB-CASE" }],
    [{ input: "Train_Case", output: "Pascal_Snake_Case" }],
    [{ input: "flatcase", output: "Flat Case" }],
    [{ input: "myVariable1Name", output: "Camel Case" }],
    [{ input: "MyVariable1Name", output: "Pascal Case" }],
    [{ input: "my_variable_1_name", output: "Snake Case" }],
    [{ input: "my-variable-1-name", output: "Kebab Case" }],
    [{ input: "UPPERCASE123", output: "UPPERCASE" }],
    [{ input: "SCREAMING_SNAKE_CASE_123", output: "SCREAMING_SNAKE_CASE" }],
    [{ input: "camel_Snake_Case_123", output: "Camel_Snake_Case" }],
    [{ input: "Pascal_Snake_Case_123", output: "Pascal_Snake_Case" }],
    [{ input: "SCREAMING-KEBAB-CASE-123", output: "SCREAMING-KEBAB-CASE" }],
    [{ input: "Train_Case_123", output: "Pascal_Snake_Case" }],
    [{ input: "myVariableName123", output: "Camel Case" }],
    [{ input: "MyVariableName123", output: "Pascal Case" }],
    [{ input: "my_variable_name_123", output: "Snake Case" }],
    [{ input: "my-variable-name-123", output: "Kebab Case" }],
    [{ input: "UPPERCASE_123", output: "SCREAMING_SNAKE_CASE" }],
    [{ input: "SCREAMING_SNAKE_CASE_123_456", output: "SCREAMING_SNAKE_CASE" }],
    [{ input: "camel_Snake_Case_123_456", output: "Camel_Snake_Case" }],
    [{ input: "Pascal_Snake_Case_123_456", output: "Pascal_Snake_Case" }],
    [{ input: "SCREAMING-KEBAB-CASE-123-456", output: "SCREAMING-KEBAB-CASE" }],
    [{ input: "Train_Case_123_456", output: "Pascal_Snake_Case" }],
];

TestRun(testCases, detectNamingConvention);
