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

export function detectNamingConvention(name: string): string|null {
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

//         assert(args.use_id_len_as_score === false); // TODO
//         let msg, src, smell_level, non_matching, report = [];
//
//         const struct_regex = RegExp(args[args.class_names.dict][args.class_names.val], "g");
//         const method_regex = RegExp(args[args.method_names.dict][args.method_names.val], "g");
//         const var_regex = RegExp(args[args.var_names.dict][args.var_names.val], "g");
//
//         // const struct_regex = RegExp(args.class_names[args.class_names.val], "g");
//         // const method_regex = RegExp(args.dict1[args.method_names.val], "g");
//         // const var_regex = RegExp(args.dict1[args.var_names.val], "g");
//
//
//         for(const structure_id in ST.structures){
//             const structure = ST.structures[structure_id];
//
//             non_matching = regex_non_matching_chars(Util.get_clean_identifier(structure_id), struct_regex);
//             smell_level = Util.get_smell_lvl(args.max_chars_ignored.range, non_matching);
//             if(smell_level > 0){
//                 msg = `Structure: "${structure_id}" has an id deviating from standard naming convention by ${non_matching} characters.`;
//                 src = Util.get_src_obj(structure.src_info.file, structure.src_info.line, structure.src_info.col, structure_id);
//                 report.push(Util.get_smell_obj(src, msg, smell_level));
//             }
//
//
//             for(const method_id in structure.methods){
//                 const method = structure.methods[method_id];
//                 let clean_method_id = Util.get_clean_identifier(method_id);
//                 if(!Util.is_standard_class_func(clean_method_id, structure_id)){
//                     non_matching = regex_non_matching_chars(clean_method_id, method_regex);
//                     smell_level = Util.get_smell_lvl(args.max_chars_ignored.range, non_matching);
//                     if(smell_level > 0){
//                         msg = `Method: "${method_id}" has an id deviating from standard naming convention by ${non_matching} characters.`;
//                         src = Util.get_src_obj(method.src_info.file, method.src_info.line, method.src_info.col, structure_id, method_id);
//                         report.push(Util.get_smell_obj(src, msg, smell_level));
//                     }
//                 }
//
//                 for(const arg_id in method.args){
//                     non_matching = regex_non_matching_chars(arg_id, var_regex);
//                     smell_level = Util.get_smell_lvl(args.max_chars_ignored.range, non_matching);
//                     if(smell_level > 0){
//                         msg = `Argument: "${arg_id}" of "${method_id}" has an id deviating from standard naming convention by ${non_matching} characters.`;
//                         src = Util.get_src_obj(method.src_info.file, method.src_info.line, method.src_info.col, structure_id, method_id);
//                         report.push(Util.get_smell_obj(src, msg, smell_level));
//                     }
//                 }
//
//                 for(const def_id in method.definitions){
//                     non_matching = regex_non_matching_chars(def_id, var_regex);
//                     smell_level = Util.get_smell_lvl(args.max_chars_ignored.range, non_matching);
//                     if(smell_level > 0){
//                         msg = `Definition: "${def_id}" of "${method_id}" has an id deviating from standard naming convention by ${non_matching} characters.`;
//                         src = Util.get_src_obj(method.src_info.file, method.src_info.line, method.src_info.col, structure_id, method_id);
//                         report.push(Util.get_smell_obj(src, msg, smell_level));
//                     }
//                 }
//             }
//
//             for(const field_id in structure.fields){
//                 non_matching = regex_non_matching_chars(Util.get_clean_identifier(field_id), var_regex);
//                 smell_level = Util.get_smell_lvl(args.max_chars_ignored.range, non_matching);
//                 if(smell_level > 0){
//                     msg = `Field: "${field_id}" of "${structure_id}" has an id deviating from standard naming convention by ${non_matching} characters.`;
//                     src = Util.get_src_obj(structure.src_info.file, structure.src_info.line, structure.src_info.col, structure_id);
//                     report.push(Util.get_smell_obj(src, msg, smell_level));
//                 }
//             }
//         }
//         return report;
//     }



// const Util = require("../Utility.js");
// const assert = require('assert');
//
// module.exports = {
//     callback: async function(ST, args){
//         assert(args.use_id_len_as_score === false); // TODO
//         let msg, src, smell_level, non_matching, report = [];
//
//         const struct_regex = RegExp(args[args.class_names.dict][args.class_names.val], "g");
//         const method_regex = RegExp(args[args.method_names.dict][args.method_names.val], "g");
//         const var_regex = RegExp(args[args.var_names.dict][args.var_names.val], "g");
//
//         // const struct_regex = RegExp(args.class_names[args.class_names.val], "g");
//         // const method_regex = RegExp(args.dict1[args.method_names.val], "g");
//         // const var_regex = RegExp(args.dict1[args.var_names.val], "g");
//
//
//         for(const structure_id in ST.structures){
//             const structure = ST.structures[structure_id];
//
//             non_matching = regex_non_matching_chars(Util.get_clean_identifier(structure_id), struct_regex);
//             smell_level = Util.get_smell_lvl(args.max_chars_ignored.range, non_matching);
//             if(smell_level > 0){
//                 msg = `Structure: "${structure_id}" has an id deviating from standard naming convention by ${non_matching} characters.`;
//                 src = Util.get_src_obj(structure.src_info.file, structure.src_info.line, structure.src_info.col, structure_id);
//                 report.push(Util.get_smell_obj(src, msg, smell_level));
//             }
//
//
//             for(const method_id in structure.methods){
//                 const method = structure.methods[method_id];
//                 let clean_method_id = Util.get_clean_identifier(method_id);
//                 if(!Util.is_standard_class_func(clean_method_id, structure_id)){
//                     non_matching = regex_non_matching_chars(clean_method_id, method_regex);
//                     smell_level = Util.get_smell_lvl(args.max_chars_ignored.range, non_matching);
//                     if(smell_level > 0){
//                         msg = `Method: "${method_id}" has an id deviating from standard naming convention by ${non_matching} characters.`;
//                         src = Util.get_src_obj(method.src_info.file, method.src_info.line, method.src_info.col, structure_id, method_id);
//                         report.push(Util.get_smell_obj(src, msg, smell_level));
//                     }
//                 }
//
//                 for(const arg_id in method.args){
//                     non_matching = regex_non_matching_chars(arg_id, var_regex);
//                     smell_level = Util.get_smell_lvl(args.max_chars_ignored.range, non_matching);
//                     if(smell_level > 0){
//                         msg = `Argument: "${arg_id}" of "${method_id}" has an id deviating from standard naming convention by ${non_matching} characters.`;
//                         src = Util.get_src_obj(method.src_info.file, method.src_info.line, method.src_info.col, structure_id, method_id);
//                         report.push(Util.get_smell_obj(src, msg, smell_level));
//                     }
//                 }
//
//                 for(const def_id in method.definitions){
//                     non_matching = regex_non_matching_chars(def_id, var_regex);
//                     smell_level = Util.get_smell_lvl(args.max_chars_ignored.range, non_matching);
//                     if(smell_level > 0){
//                         msg = `Definition: "${def_id}" of "${method_id}" has an id deviating from standard naming convention by ${non_matching} characters.`;
//                         src = Util.get_src_obj(method.src_info.file, method.src_info.line, method.src_info.col, structure_id, method_id);
//                         report.push(Util.get_smell_obj(src, msg, smell_level));
//                     }
//                 }
//             }
//
//             for(const field_id in structure.fields){
//                 non_matching = regex_non_matching_chars(Util.get_clean_identifier(field_id), var_regex);
//                 smell_level = Util.get_smell_lvl(args.max_chars_ignored.range, non_matching);
//                 if(smell_level > 0){
//                     msg = `Field: "${field_id}" of "${structure_id}" has an id deviating from standard naming convention by ${non_matching} characters.`;
//                     src = Util.get_src_obj(structure.src_info.file, structure.src_info.line, structure.src_info.col, structure_id);
//                     report.push(Util.get_smell_obj(src, msg, smell_level));
//                 }
//             }
//         }
//         return report;
//     }
// }
//
// /**
//  *
//  * @returns the amount of chars missing in the best match.
//  */
// function regex_non_matching_chars(str, regex){
//     const matches = str.match(regex);
//     if(matches === null)
//         return str.length;
//     let longest_match_len = 0;
//
//     for(const match of matches){
//         if(match.length > longest_match_len)
//             longest_match_len = match.length;
//     }
//
//     return str.length - longest_match_len;
// }
