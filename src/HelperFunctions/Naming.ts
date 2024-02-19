import { SymbolTreeJson } from "../SyntaxTree";
/*

https://en.wikipedia.org/wiki/Naming_convention_(programming)#Common_elements

| Formatting    | Name(s)                                                       |
|---------------|--------------------------------------------------             |
| twowords      | flatcase                                                      |
| TWOWORDS      | UPPERCASE, SCREAMINGCAMELCASE                                 |
| twoWords      | camelCase, dromedaryCase                                      |
| TwoWords      | PascalCase, UpperCamelCase, StudlyCase                        |
| two_words     | snake_case, snail_case, pothole_case                          |
| TWO_WORDS     | ALL_CAPS, SCREAMING_SNAKE_CASE,MACRO_CASE, CONSTANT_CASE      |
| two_Words     | camel_Snake_Case                                              |
| Two_Words     | Pascal_Snake_Case, Title_Case                                 |
| two-words     | kebab-case, dash-case, lisp-case, spinal-case                 |
| TWO-WORDS     | TRAIN-CASE, COBOL-CASE, SCREAMING-KEBAB-CASE                  |
| Two-Words     | Train-Case,HTTP-Header-Case                                   |
| _two_words    | INTERNAL                                                      |

*/

const flatCaseRegex = /^[a-z][a-z0-9]*$/;
const upperCaseRegex = /^[A-Z][A-Z0-9]*$/;
const camelCaseRegex = /^[a-z][a-z0-9]+(?:[A-Z][A-Za-z0-9]+)*$/;
const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]+(?:[A-Z][A-Za-z0-9]+)*$/;
const snakeCaseRegex = /^[a-z][a-z0-9]+(?:_[a-z0-9]+)*$/;
const screamingSnakeCaseRegex = /^[A-Z][A-Z_0-9]+$/;
const camelSnakeCaseRegex = /^[a-z][a-z0-9]+(?:_[A-Z0-9][A-Za-z0-9]+)*$/;
const pascalSnakeCaseRegex = /^[A-Z][a-zA-Z0-9]+(?:_[A-Z0-9][A-Za-z0-9]+)*$/;
const kebabCaseRegex = /^[a-z][a-z0-9]+(?:-[a-z0-9]+)*$/;
const screamingKebabCaseRegex = /^[A-Z][A-Z0-9]+(?:-[A-Z0-9]+)*$/;
const trainCaseRegex = /^[A-Z][a-zA-Z0-9]+(?:_[A-Z0-9][a-zA-Z0-9]+)*$/;

export enum NamingConvention {
    FLAT_CASE = "FLAT_CASE",
    PASCAL_CASE = "PASCAL_CASE",
    SNAKE_CASE = "SNAKE_CASE",
    KEBAB_CASE = "KEBAB_CASE",
    UPPERCASE = "UPPERCASE",
    SCREAMING_SNAKE_CASE = "SCREAMING_SNAKE_CASE",
    CAMEL_SNAKE_CASE = "CAMEL_SNAKE_CASE",
    PASCAL_SNAKE_CASE = "PASCAL_SNAKE_CASE",
    SCREAMING_KEBAB_CASE = "SCREAMING_KEBAB_CASE",
    TRAIN_CASE = "TRAIN_CASE",
    CAMEL_CASE = "CAMEL_CASE",
    INTERNAL = "INTERNAL",
    UNKNOWN = "UNKNOWN",
    ANONYMOUS = "ANONYMOUS"
}

export function detectNamingConvention(name: string): string | null {
    if (name.startsWith("operator") || name[0] === '~') {
        return null
    }
    if (flatCaseRegex.test(name)) {
        return NamingConvention.FLAT_CASE;
    } else if (upperCaseRegex.test(name)) {
        return NamingConvention.UPPERCASE;
    } else if (pascalCaseRegex.test(name)) {
        return NamingConvention.PASCAL_CASE;
    } else if (snakeCaseRegex.test(name)) {
        return NamingConvention.SNAKE_CASE;
    } else if (kebabCaseRegex.test(name)) {
        return NamingConvention.KEBAB_CASE;
    } else if (screamingSnakeCaseRegex.test(name)) {
        return NamingConvention.SCREAMING_SNAKE_CASE;
    } else if (camelSnakeCaseRegex.test(name)) {
        return NamingConvention.CAMEL_SNAKE_CASE;
    } else if (pascalSnakeCaseRegex.test(name)) {
        return NamingConvention.PASCAL_SNAKE_CASE;
    } else if (screamingKebabCaseRegex.test(name)) {
        return NamingConvention.SCREAMING_KEBAB_CASE;
    } else if (trainCaseRegex.test(name)) {
        return NamingConvention.TRAIN_CASE;
    } else if (camelCaseRegex.test(name)) {
        return NamingConvention.CAMEL_CASE;
    } else if (name[0] === '_') {
        return NamingConvention.INTERNAL;
    } else if (name === "") {
        return NamingConvention.ANONYMOUS;
    }
    return NamingConvention.UNKNOWN;
}

export function name_analyse(ST: SymbolTreeJson) {

    for (const structure_id in ST.structures) {
        const structure = ST.structures[structure_id];
        console.log(`${structure.name} -> ${detectNamingConvention(structure.name)}`);
        for (const method_id in structure.methods) {
            const method = structure.methods[method_id];

            for (const arg_id in method.args) {
            }

            for (const def_id in method.definitions) {
            }

        }
        for (const field_id in structure.fields) {
        }
    }
}
