import assert from "assert";
import { SymbolTreeJson } from "../SyntaxTree";
import * as fs from 'fs';

// async function analyse(ST : SymbolTreeJson,max_line_len){
//         let incidents, report = [];
//          if (ST.headers) {
//                 for (const header of ST.headers) {
//                     incidents = await iterate_file(header, max_line_len);
//                     for (const incident of incidents) {
//                         report.push(incident);
//                     }
//                 }
//             }
//         for(const source of ST.sources){
//             incidents = await iterate_file(source, max_line_len);
//             for(const incident of incidents){
//                 report.push(incident);
//             }
//         }
//         return report;
//     }
//

type Line = {
    str: string,
    comment_open: boolean;
    real_len: number;
};

// function un_commented_line_len(line: string,comment_open:boolean): number {
//
// }

function un_commented_line_rec(line: Line, last_index: number = 0): Line {

    if (line.str.length === 0) {
        line.real_len = 0
        return line;
    }

    if (line.str.length === last_index) {
        return line;
    }

    if (line.comment_open) {
        let comment_close_idx = line.str.indexOf("*/", last_index);
        if (comment_close_idx === -1) return line;
        line.comment_open = false;
        return un_commented_line_rec(line, comment_close_idx + 2)
    }

    let comment_open_idx = line.str.indexOf("/*", last_index);
    if (comment_open_idx === -1) {
        line.real_len += line.str.length - last_index;
        return line;
    }

    line.real_len += comment_open_idx - last_index;
    line.comment_open = true;

    let comment_close_idx = line.str.indexOf("*/", last_index);
    if (comment_close_idx === -1) {
        return line;
    }
    line.comment_open = false;

    let ret = un_commented_line_rec(line, comment_close_idx + 2)
    return ret;
}

const cpp_lines = [
    {
        strs: ['hello "/* thehre */" baby /* jjj // ',
            ' hlhflh /* jfjf /* // */ hello /* hhahah get fucked */'], real_len_assert: [14, 7]
    },
    { strs: ['hello /* thehre */ baby /* jjj // '], real_len_assert: [12] },
    { strs: ['hello /* thehre */ baby /* jjj // */'], real_len_assert: [12] },
    { strs: ['hello /* thehre */ baby /* jjj // */ hahahha'], real_len_assert: [20] },
    { strs: ['hello /* thehre */ baby  jjj // '], real_len_assert: [20] },
]



for (const lines of cpp_lines) {

    const line_obj: Line = {
        str: "",
        comment_open: false,
        real_len: 0
    };

    for (let i = 0; i < lines.strs.length; i++) {

        const str = lines.strs[i];
        const real_len_assert = lines.real_len_assert[i];

        line_obj.str = str;
        /* const real_len =  */un_commented_line_rec(line_obj)
        console.log(line_obj)
        console.log(real_len_assert === line_obj.real_len
            ? `\x1b[32mPASS\x1b[0m`  // Green color for PASS
            : `\x1b[31mFAIL (${real_len_assert})\x1b[0m`  // Red color for FAIL
        );
        line_obj.real_len = 0;
    }

}
/* jjjj /* kjj*/
// /* Returns the length of a string (multi-line comments removed) and if comment is left open */
// function un_commented_strlen_rec(str: string|StringInfo, comment_open:boolean):StringInfo{
//     if(str.len === 0){
//         return {len:0, comment_open:comment_open};
//     }
//
//     let idx = 0;
//     if(comment_open){
//         idx = str.indexOf("*/");
//         if(idx === -1) return {len:0, comment_open:true};
//         str = str.slice(idx+2);
//         idx=0;
//         comment_open = false;
//     }
//     
//     idx = str.indexOf("/*");
//     if(idx === -1) return {len:str.length, comment_open: false};
//     
//     let ret = un_commented_strlen(str.slice(idx + 2), true);
//     ret.len += idx;
//     return ret;
//
// }
//
// async function iterate_file(file_path, max_line_len){
//     let msg, src, smell_level, file_report = [];
//     const file_stream = fs.createReadStream(file_path);
//
//     const rl = readline.createInterface({
//         input: file_stream,
//         crlfDelay: Infinity
//     });
//     let line_counter = 0;
//     let in_comment = false;
//     let info;
//     for await(const line of rl){
//         line_counter++;
//         let line_comm_idx = line.indexOf("//");
//         if(line_comm_idx !== -1){
//             info = un_commented_strlen(line.slice(0, line_comm_idx));
//         }
//         else{
//             info = un_commented_strlen(line);
//         }
//         in_comment = info.comment_open;
//         smell_level = Util.get_smell_lvl(max_line_len.range, info.len);
//         if(smell_level > 0){
//             msg = `Line ${line_counter} of ${file_path} has an un-commented length of ${info.len} characters`;
//             src = Util.get_src_obj(file_path, line_counter);
//             file_report.push(Util.get_smell_obj(src, msg, smell_level));
//         }
//     }
//     return file_report;
// }
//

// var str = "d/*ssdaasdasd/*";
// console.log(un_commented_strlen(str));
