import { ParseArgsConfig, parseArgs } from 'util';
import { exit } from 'process';
import { log } from 'console';

type OptionType = {
    type: string;
    short: string;
    desc: string;
    default?: boolean | string;
};

type ParseArgs = {
    options: {
        [key: string]: OptionType;
    };
};

const parse_config: ParseArgs = {
    options: {
        'verbose': {
            type: 'boolean',
            short: 'v',
            desc: "Show the data that is being pushed to database.",
            default: false,
        },
        'update-rules': {
            type: 'boolean',
            short: 'u',
            desc: "Update the rules according to the Smells.json file provided in root of path.",
            default: false,
        },
        'seed': {
            type: 'string',
            desc: "The Json file where the C++ SymbolTree has been stored.",
            short: 's',
        },
        'dry-run': {
            type: 'boolean',
            short: 'd',
            desc: "No data will be send to the database thus no changes will happen ( Used primarily for testing ).",
            default: false
        },
        'help': {
            type: 'boolean',
            short: 'h',
            desc: "See this help message.",
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
const formatText = (text: string, formatCode: string): string => isColorSupported() ? `\x1b[${formatCode}m${text}\x1b[0m` : text;

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
`)
    const terminalWidth = process.stdout.columns || 80; // Get terminal width or default to 80 columns
    // const terminalWidth = 40; // Get terminal width or default to 80 columns
    let helpMessage = '';
    for (const optionName in parse_config.options) {
        const option = parse_config.options[optionName];
        const cmd = `${bold(`-${option.short}/--${optionName}`)}`;
        const desc = `${option.desc ? `${option.desc}` : ''}`;

        const type = `${italic(`{ type: ${option.type}${option.default !== undefined ? `, default: ${option.default}` : ''} }`)}`;

        const line = `${cmd}: ${' '.repeat(terminalWidth - cmd.length - type.length - 2)}${type}\n  ${desc}\n\n`;

        helpMessage += line;
    }
    console.log(helpMessage)
    //
    // `
    // ${bold("--help/-h")}
    //     See this help message.
    //
    // ${bold("--seed/-s")}:                                                                   ${italic("{ type: string }")}
    //     The Json file where the C++ SymbolTree has been stored.
    //
    // ${bold("--update-rules/-u")}:                                          ${italic("{ type: boolean, default: false }")}
    //     Update the rules according to the Smells.json file provided in root of path.
    //
    // ${bold("--verbose/-v")}:                                                  ${italic("{ type: boolean, default: false }")}
    //     Output everything as it is sent to the DB.
    //
    // ${bold("--dry-run/-d")}:                                                  ${italic("{ type: boolean, default: false }")}
    //     No data will be send to the database thus no changes will happen
    //         ( Used primarily for testing ).
    // `);

}

function assertArgs() {
    try {
        const { values } = parseArgs(parse_config as ParseArgsConfig);

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
