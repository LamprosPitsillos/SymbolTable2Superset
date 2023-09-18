import { PrismaClient } from '@prisma/client'
import { SymbolTreeJson,Source,Dependency,Structures } from './SyntaxTree'

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

function fillDatabaseSources(sources:Source[]) {

    
}
function fillDatabaseDependancies(dependencies:Dependency[]) {

    
}
function fillDatabaseStructures(structures:Structures[]) {

    
}
async function fillDatabase(symbol_tree:SymbolTreeJson) {
    // fillDatabaseDependancies()
    // fillDatabaseSources()
    // fillDatabaseStructures()

  //   await prisma.user.create({
  //   data: {
  //     name: 'Alice',
  //     email: 'alice@prisma.io',
  //     posts: {
  //       create: { title: 'Hello World' },
  //     },
  //     profile: {
  //       create: { bio: 'I like turtles' },
  //     },
  //   },
  // })

}

async function main() {
    const filePath = process.argv[2];
    if (filePath === undefined) {
        console.log("Provide a filePath to the Syntax Tree json file.")
        exit(1)
    }
    const symbol_tree = readClangSyntaxTree(filePath);
    fillDatabase(symbol_tree)


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
