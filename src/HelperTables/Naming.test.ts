import { Tests, TestRun } from "./TestRunner";
import { NamingConvention, detectNamingConvention } from "./Naming";

const variableNames: Tests = [
    [{ input: "myVariableName", output: NamingConvention.CAMEL_CASE }],
    [{ input: "MyVariableName", output: NamingConvention.PASCAL_CASE }],
    [{ input: "my_variable_name", output: NamingConvention.SNAKE_CASE }],
    [{ input: "my-variable-name", output: NamingConvention.KEBAB_CASE }],
    [{ input: "UPPERCASE", output: NamingConvention.UPPERCASE }],
    [{ input: "SCREAMING_SNAKE_CASE", output: NamingConvention.SCREAMING_SNAKE_CASE }],
    [{ input: "camel_Snake_Case", output: NamingConvention.CAMEL_SNAKE_CASE }],
    [{ input: "Pascal_Snake_Case", output: NamingConvention.PASCAL_SNAKE_CASE }],
    [{ input: "SCREAMING-KEBAB-CASE", output: NamingConvention.SCREAMING_KEBAB_CASE }],
    [{ input: "Train_Case", output: NamingConvention.PASCAL_SNAKE_CASE }],
    [{ input: "flatcase", output: NamingConvention.FLAT_CASE }],
    [{ input: "myVariable1Name", output: NamingConvention.CAMEL_CASE }],
    [{ input: "MyVariable1Name", output: NamingConvention.PASCAL_CASE }],
    [{ input: "my_variable_1_name", output: NamingConvention.SNAKE_CASE }],
    [{ input: "my-variable-1-name", output: NamingConvention.KEBAB_CASE }],
    [{ input: "UPPERCASE123", output: NamingConvention.UPPERCASE }],
    [{ input: "SCREAMING_SNAKE_CASE_123", output: NamingConvention.SCREAMING_SNAKE_CASE }],
    [{ input: "camel_Snake_Case_123", output: NamingConvention.CAMEL_SNAKE_CASE }],
    [{ input: "Pascal_Snake_Case_123", output: NamingConvention.PASCAL_SNAKE_CASE }],
    [{ input: "SCREAMING-KEBAB-CASE-123", output: NamingConvention.SCREAMING_KEBAB_CASE }],
    [{ input: "Train_Case_123", output: NamingConvention.PASCAL_SNAKE_CASE }],
    [{ input: "myVariableName123", output: NamingConvention.CAMEL_CASE }],
    [{ input: "MyVariableName123", output: NamingConvention.PASCAL_CASE }],
    [{ input: "my_variable_name_123", output: NamingConvention.SNAKE_CASE }],
    [{ input: "my-variable-name-123", output: NamingConvention.KEBAB_CASE }],
    [{ input: "UPPERCASE_123", output: NamingConvention.SCREAMING_SNAKE_CASE }],
    [{ input: "SCREAMING_SNAKE_CASE_123_456", output: NamingConvention.SCREAMING_SNAKE_CASE }],
    [{ input: "camel_Snake_Case_123_456", output: NamingConvention.CAMEL_SNAKE_CASE }],
    [{ input: "Pascal_Snake_Case_123_456", output: NamingConvention.PASCAL_SNAKE_CASE }],
    [{ input: "SCREAMING-KEBAB-CASE-123-456", output: NamingConvention.SCREAMING_KEBAB_CASE }],
    [{ input: "Train_Case_123_456", output: NamingConvention.PASCAL_SNAKE_CASE }],
    [{ input: "wxPoint2DDouble", output: NamingConvention.CAMEL_CASE }],
    [{ input: "wxPoint2DInt", output: NamingConvention.CAMEL_CASE }],
    // Add any additional test cases here.
];

TestRun(variableNames, detectNamingConvention);
