import { PrismaClient } from '@prisma/client'
import { SymbolTreeJson } from './SyntaxTree'

const prisma = new PrismaClient()

import * as fs from 'fs';
import { exit } from 'process';

/**
 * Pretty prints a JSON file containing a Clang syntax tree.
 *
 * @param {string} filePath - The path to the JSON file.
 * @returns {string} - The pretty-printed JSON as a string.
 * @throws {Error} If the file cannot be read or if the JSON is invalid.
 */
function readClangSyntaxTree(filePath: string): SymbolTreeJson {
    try {
        const jsonContent = fs.readFileSync(filePath, 'ascii');
        const syntaxTree = JSON.parse(jsonContent);
        return syntaxTree;
    } catch (error) {

        let msg = "Error while reading Clang syntax tree: "
        if (error instanceof Error) {
            msg += error.message
        }

        throw new Error(msg);
    }
}

// Example usage:
try {
    // const filePath = './STjsons/test_objects_used_by_methods.json';
    const filePath = process.argv[2];
    // const filePath = path(process.argv[2]);
    console.log(filePath)
    if (filePath === undefined) {
        console.log("Provide a filePath to the Syntax Tree json file.")
        exit(1)
    }

    const STJSON = readClangSyntaxTree(filePath);
    console.log("===========================================");
    for (const struct in STJSON.structures) {
        const element = STJSON.structures[struct];
        console.log(struct);

        console.log(element.name);


    }

} catch (error) {
    throw error;
}

async function main() {
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
