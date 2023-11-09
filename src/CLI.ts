import { ParseArgsConfig, parseArgs } from 'util';
import { exit } from 'process';

const parse_config: ParseArgsConfig = {
    options: {
        'verbose': {
            type: 'boolean',
            short: 'v',
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

        }
    }
};

function assertArgs() {
    try {
        const { values } = parseArgs(parse_config);
        // console.log(values);

        if (values.seed === undefined) {
            throw Error("Provide a filePath to the Syntax Tree json file via ` -s | --seed `.")
        }
        return values
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error:: ${error.message}`)
            console.log(String.raw`
 ██████╗ ██████╗ ██████╗ ███████╗██████╗ ██╗
██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔══██╗██║
██║     ██║   ██║██║  ██║█████╗  ██████╔╝██║
██║     ██║   ██║██║  ██║██╔══╝  ██╔══██╗██║
╚██████╗╚██████╔╝██████╔╝███████╗██████╔╝██║
 ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═════╝ ╚═╝ A tool by Lampros Pitsillos

Help:

Arguments :

--seed/-s    :                                                                   { type: string }
    The Json file where the C++ SymbolTree has been stored.

--verbose/-v :                                                  { type: boolean, default: false }
    Output everything as it is sent to the DB.

--dry-run/-d :                                                  { type: boolean, default: false }
    No data will be send to the database thus no changes will happen 
        ( Used primarily for testing ).
`);

        }
        exit(1)

    }
}
export const values = assertArgs()
