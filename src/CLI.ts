import { ParseArgsConfig,parseArgs } from 'util';
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

function assertArgs (){
    const { values } = parseArgs(parse_config);
    if (values.seed === undefined) {
        console.log("Provide a filePath to the Syntax Tree json file via ` -s | --seed `.")
        exit(1)
    }
    return values
}
export const values  = assertArgs()
