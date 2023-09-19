import { PrismaClient } from '@prisma/client'
import { SymbolTreeJson, Source, Dependency, Structures, StructureEntry } from './SyntaxTree'

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

async function fillDatabaseSources(sources: Source[]) {
    for (const source in sources) {
        await prisma.source.create({
            data: {
                source: source
            },
        })

    }
}
async function fillDatabaseDependancies(dependencies: Dependency[]) {
    for (const dependency of dependencies) {
        await prisma.dependency.create({
            data: {
                from: dependency.from,
                to: dependency.to,
                types: {
                    create: dependency.types
                }

            },
        })

    }
}
async function fillDatabaseStructures(structures: Structures) {
    for (const structure_name in structures) {
        const structure: StructureEntry = structures[structure_name]
        await prisma.structure.create({
            data: {
                signature:structure_name,
                // bases:structure.bases,
                // contain:structure.contains,

                // fields:structure.fields,
                // friend:structure.friends,
                // methods:structure.methods,
                name:structure.name,
                namespace:structure.namespace,
                col:structure.src_info.col,
                line:structure.src_info.line,
                file:structure.src_info.file,
                structure_type:structure.structure_type,
                // template_args:structure.template_args,
                template_parent:structure.template_parent
            },
        })

    }


}
function fillDatabase(symbol_tree: SymbolTreeJson) {
    fillDatabaseDependancies(symbol_tree.dependencies)
    fillDatabaseSources(symbol_tree.sources)
    fillDatabaseStructures(symbol_tree.structures)


}

async function main() {
    const filePath = process.argv[2];
    if (filePath === undefined) {
        console.log("Provide a filePath to the Syntax Tree json file.")
        exit(1)
    }
    const symbol_tree = readClangSyntaxTree(filePath);
    console.log(symbol_tree.dependencies[0].types);

    // fillDatabase(symbol_tree)


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
