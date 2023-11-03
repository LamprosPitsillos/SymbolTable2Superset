import { SymbolTreeJson } from "../SyntaxTree";

import * as fs from 'fs';
import * as readline from 'readline';

export async function line_len_from_ST(ST: SymbolTreeJson): Promise<Record<string, number[]>> {
    let report: Record<string, number[]> = {};
    if (ST.headers) {
        for (const header of ST.headers) {
            report[header] = await processFile(header)
        }
    }
    for (const source of ST.sources) {
        report[source] = await processFile(source)
    }
    return report;
}


export type Line = {
    str: string,
    comment_open: boolean;
    real_len: number;
};

export function un_commented_line_iter(line: Line) {

    let char = '';
    let inString = false;
    for (let char_idx = 0; char_idx < line.str.length; ++char_idx) {
        char = line.str[char_idx];

        switch (char) {
            case '/':
                if (!line.comment_open && !inString) {
                    const next = line.str[char_idx + 1];
                    switch (next) {
                        case '*':
                            line.comment_open = true;
                            char_idx += 1;  // Skip the '*' character
                            break;
                        case '/': return;
                        default:
                            line.real_len += 1;
                    }
                } else if (inString) { line.real_len += 1 }
                break;
            case '*':
                if (!line.comment_open) {
                    line.real_len += 1
                } else if (line.str[char_idx + 1] === '/') {
                    line.comment_open = false;
                    char_idx += 1;  // Skip the '/' character
                }
                break;
            case '"': if (!line.comment_open) {
                inString = !inString;
                line.real_len += 1;
            }
                break;
            default:
                if (!line.comment_open) {
                    line.real_len += 1;
                }
        }
    }

}
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

    let line_comment_idx = line.str.indexOf("//", last_index);

    let comment_open_idx = line.str.indexOf("/*", last_index);
    if (comment_open_idx === -1) {
        line.real_len += (line_comment_idx === -1) ? (line.str.length - last_index) : (line_comment_idx - last_index);
        return line;
    }
    if (line_comment_idx !== -1 && line_comment_idx < comment_open_idx) {
        line.real_len += line_comment_idx - last_index;
        return line
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


async function processFile(fileName: string) {
    const result = [];

    const fileStream = fs.createReadStream(fileName);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let lineNumber = 1;

    const line_wrap: Line = {
        str: "",
        comment_open: false,
        real_len: 0
    };

    // if (!result[fileName]) {
    //     result[fileName] = [];
    // }
    for await (const line of rl) {
        line_wrap.str = line
        un_commented_line_iter(line_wrap); // You need to define your uncomment function


        result.push(line_wrap.real_len);
        line_wrap.real_len = 0;
        lineNumber++;
    }

    return result;
}

// processFile("/home/inferno/UoC/Ptixiaki/CodeAnalysisMeta/Code-Smell-Detector/GraphGenerator/GraphGeneration/GraphGeneration.cpp")
//     .then((result) => {
//         console.log(result);
//     })
//     .catch((error) => {
//         console.error(error);
//     });

