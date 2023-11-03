const Util = require("../Utility.js");
const assert = require('assert');

module.exports = {
    callback: async function(ST, args){
        assert(args.use_id_len_as_score === false); // TODO
        let msg, src, smell_level, non_matching, report = [];

        const struct_regex = RegExp(args[args.class_names.dict][args.class_names.val], "g");
        const method_regex = RegExp(args[args.method_names.dict][args.method_names.val], "g");
        const var_regex = RegExp(args[args.var_names.dict][args.var_names.val], "g");

        // const struct_regex = RegExp(args.class_names[args.class_names.val], "g");
        // const method_regex = RegExp(args.dict1[args.method_names.val], "g");
        // const var_regex = RegExp(args.dict1[args.var_names.val], "g");


        for(const structure_id in ST.structures){
            const structure = ST.structures[structure_id];

            non_matching = regex_non_matching_chars(Util.get_clean_identifier(structure_id), struct_regex);
            smell_level = Util.get_smell_lvl(args.max_chars_ignored.range, non_matching);
            if(smell_level > 0){
                msg = `Structure: "${structure_id}" has an id deviating from standard naming convention by ${non_matching} characters.`;
                src = Util.get_src_obj(structure.src_info.file, structure.src_info.line, structure.src_info.col, structure_id);
                report.push(Util.get_smell_obj(src, msg, smell_level));
            }

            
            for(const method_id in structure.methods){
                const method = structure.methods[method_id];
                let clean_method_id = Util.get_clean_identifier(method_id);
                if(!Util.is_standard_class_func(clean_method_id, structure_id)){
                    non_matching = regex_non_matching_chars(clean_method_id, method_regex);
                    smell_level = Util.get_smell_lvl(args.max_chars_ignored.range, non_matching);
                    if(smell_level > 0){
                        msg = `Method: "${method_id}" has an id deviating from standard naming convention by ${non_matching} characters.`;
                        src = Util.get_src_obj(method.src_info.file, method.src_info.line, method.src_info.col, structure_id, method_id);
                        report.push(Util.get_smell_obj(src, msg, smell_level));
                    }
                }

                for(const arg_id in method.args){
                    non_matching = regex_non_matching_chars(arg_id, var_regex);
                    smell_level = Util.get_smell_lvl(args.max_chars_ignored.range, non_matching);
                    if(smell_level > 0){
                        msg = `Argument: "${arg_id}" of "${method_id}" has an id deviating from standard naming convention by ${non_matching} characters.`;
                        src = Util.get_src_obj(method.src_info.file, method.src_info.line, method.src_info.col, structure_id, method_id);
                        report.push(Util.get_smell_obj(src, msg, smell_level));
                    }
                }

                for(const def_id in method.definitions){
                    non_matching = regex_non_matching_chars(def_id, var_regex);
                    smell_level = Util.get_smell_lvl(args.max_chars_ignored.range, non_matching);
                    if(smell_level > 0){
                        msg = `Definition: "${def_id}" of "${method_id}" has an id deviating from standard naming convention by ${non_matching} characters.`;
                        src = Util.get_src_obj(method.src_info.file, method.src_info.line, method.src_info.col, structure_id, method_id);
                        report.push(Util.get_smell_obj(src, msg, smell_level));
                    }
                }
            }

            for(const field_id in structure.fields){
                non_matching = regex_non_matching_chars(Util.get_clean_identifier(field_id), var_regex);
                smell_level = Util.get_smell_lvl(args.max_chars_ignored.range, non_matching);
                if(smell_level > 0){
                    msg = `Field: "${field_id}" of "${structure_id}" has an id deviating from standard naming convention by ${non_matching} characters.`;
                    src = Util.get_src_obj(structure.src_info.file, structure.src_info.line, structure.src_info.col, structure_id);
                    report.push(Util.get_smell_obj(src, msg, smell_level));
                }
            }
        }
        return report;
    }
}

/**
 *  
 * @returns the amount of chars missing in the best match.
 */
function regex_non_matching_chars(str, regex){
    const matches = str.match(regex);
    if(matches === null) 
        return str.length;
    let longest_match_len = 0;

    for(const match of matches){
        if(match.length > longest_match_len) 
            longest_match_len = match.length;
    }

    return str.length - longest_match_len;
}
