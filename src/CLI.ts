import { ParseArgsConfig, parseArgs } from 'util';
import { exit } from 'process';
import { isatty } from 'tty';

const parse_config: ParseArgsConfig = {
    options: {
        'verbose': {
            type: 'boolean',
            short: 'v',
            default: false,
        },
        'update-rules': {
            type: 'boolean',
            short: 'u',
            default: false,
        },
        'seed': {
            type: 'string',
            short: 's',
        },
        'dry-run': {
            type: 'boolean',
            short: 'd',
            default: false
        },
        'help': {
            type: 'boolean',
            short: 'h',
            default: false
        }
    }
};

const isColorSupported = (): boolean => {
    return process.stdout.isTTY;
};

export enum AnsiColors {
    Black = 0,
    Red = 1,
    Green = 2,
    Yellow = 3,
    Blue = 4,
    Magenta = 5,
    Cyan = 6,
    White = 7,
    BrightBlack = 8,
    BrightRed = 9,
    BrightGreen = 10,
    BrightYellow = 11,
    BrightBlue = 12,
    BrightMagenta = 13,
    BrightCyan = 14,
    BrightWhite = 15,
}


// ANSI escape code for formatting text
const formatText = (text: string, formatCode: string): string => isColorSupported() ? `\x1b[${formatCode}m${text}\x1b[0m` : text ;

// Functions for different text formats
export const textColor = (text: string, color: AnsiColors): string => formatText(text, `38;5;${color}`);
export const italic = (text: string): string => formatText(text, '3');
export const bold = (text: string): string => formatText(text, '1');

// Function to add color to text

function help() {
    console.log(String.raw`


 ██████╗ ██████╗ ██████╗ ███████╗██████╗ ██╗
██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔══██╗██║
██║     ██║   ██║██║  ██║█████╗  ██████╔╝██║
██║     ██║   ██║██║  ██║██╔══╝  ██╔══██╗██║
╚██████╗╚██████╔╝██████╔╝███████╗██████╔╝██║
 ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═════╝ ╚═╝ ${italic(" A tool by Lampros Pitsillos")}

${bold("Help")}:

${bold("Arguments")}:

${bold("--help/-h")}
    See this help message.

${bold("--seed/-s")}:                                                                   ${italic("{ type: string }")}
    The Json file where the C++ SymbolTree has been stored.

${bold("--update-rules/-u")}:                                          ${italic("{ type: boolean, default: false }")}
    Update the rules according to the Smells.json file provided in root of path.

${bold("--verbose/-v")}:                                                  ${italic("{ type: boolean, default: false }")}
    Output everything as it is sent to the DB.

${bold("--dry-run/-d")}:                                                  ${italic("{ type: boolean, default: false }")}
    No data will be send to the database thus no changes will happen
        ( Used primarily for testing ).
`);
}

function assertArgs() {
    try {
        const { values } = parseArgs(parse_config);

        if (values.help) {
            help()
            exit(0)
        }

        if (values.seed === undefined && !values["update-rules"]) {
            throw Error("Provide a filePath to the Syntax Tree json file via ` -s | --seed `.")
        }
        return values
    } catch (error) {
        if (error instanceof Error) {
            console.error(`\n${textColor(bold("Error::"), AnsiColors.Red)} ${bold(error.message)}`)
            console.error("Try typing `--help/-h` to see a help message for the tool.")

        }
        exit(1)

    }
}
export const values = assertArgs()
