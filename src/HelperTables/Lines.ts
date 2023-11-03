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

    for await (const line of rl) {
        line_wrap.str = line
        un_commented_line_iter(line_wrap); // You need to define your uncomment function


        result.push(line_wrap.real_len);
        line_wrap.real_len = 0;
        lineNumber++;
    }

    return result;
}
