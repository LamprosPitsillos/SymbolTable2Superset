import { PrismaClient } from '@prisma/client'
import { SymbolTreeJson, Source, Dependency, Structures, StructureEntry, Field, Field_flat, Method, Method_flat, Arg, Arg_flat, Definition, Definition_flat } from './SyntaxTree'

const prisma = new PrismaClient()

import * as fs from 'fs';
import { exit } from 'process';
import { inspect } from 'util';

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
    console.log("SOURCES=========================================================================")
    for (const source in sources) {
        console.log({
                source: source
            });
        continue;
        
        await prisma.source.create({
            data: {
                source: source
            },
        })

    }
}
async function fillDatabaseDependancies(dependencies: Dependency[]) {
    console.log("DEPENDANCIES====================================================================")
    for (const dependency of dependencies) {
        console.log(inspect({
                from: dependency.from,
                to: dependency.to,
                types: {
                    create: dependency.types
                }

            },{depth:Infinity}));
        
        continue;
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
function embed_fields(structure: StructureEntry) {
    let object_fields = []
    for (const field_name in structure.fields) {
        const field: Field = structure.fields[field_name]
        if (field !== null) {

            const _field: Field_flat = {
                full_name: field_name,
                access: field.access,
                full_type: field.full_type,
                name: field.name,
                type: field.type,
                col: field.src_info.col,
                file: field.src_info.file,
                line: field.src_info.line,
            }
            object_fields.push(_field)
        }

    }
    if (object_fields.length === 0)
        return {}
    else
        return { create: object_fields }

}
function embed_args(method_args: Record<string, Arg> | null) {
    let object_args = []
    for (const arg_name in method_args) {
        const arg: Arg = method_args[arg_name]
        if (arg !== null) {

            const _arg: Arg_flat = {
                name: arg_name,
                full_type: arg.full_type,
                col: arg.src_info.col,
                line: arg.src_info.line,
                file: arg.src_info.file,
                type: arg.type,
            }
            object_args.push(_arg)
        }
    }
    if (object_args.length === 0)
        return {}
    else
        return { create: object_args }

}
function embed_definitions(method_definitions: Record<string, Definition> | null) {
    let object_definitions = []
    for (const definition_name in method_definitions) {
        const definition: Definition = method_definitions[definition_name]
        if (definition !== null) {

            const _definition: Definition_flat = {
                name: definition_name,
                full_type: definition.full_type,
                col: definition.src_info.col,
                line: definition.src_info.line,
                file: definition.src_info.file,
                type: definition.type,
            }
            object_definitions.push(_definition)
        }
    }
    if (object_definitions.length === 0)
        return {}
    else
        return { create: object_definitions }

}
function embed_methods(structure: StructureEntry) {
    let object_methods = []
    for (const method_name in structure.methods) {
        const method: Method = structure.methods[method_name]
        if (method !== null) {

            const _method = {
                access: method.access,
                args: embed_args(method.args),
                branches: method.branches,
                col: method.src_info.col,
                definitions: embed_definitions(method.definitions),
                file: method.src_info.file,
                line: method.src_info.line,
                lines: method.lines,
                literals: method.literals,
                loops: method.loops,
                max_scope: method.max_scope,
                method_type: method.method_type,
                name: method.name,
                ret_type: method.ret_type,
                signature:method_name,
                statements: method.statements,
                template_args: embed("arg", method.template_args),
                virtual: method.virtual,
            }
            object_methods.push(_method)
        }

    }
    if (object_methods.length === 0)
        return {}
    else
        return { create: object_methods }
}

function embed<T>(key: string, array: T[] | null) {
    let object_list = {}
    if (array !== null)
        object_list = { create: array.map(value => ({ [key]: value })) }
    return object_list
}

async function fillDatabaseStructures(structures: Structures) {


    console.log("STRUCTURES======================================================================")
    for (const structure_name in structures) {

        const structure: StructureEntry = structures[structure_name]
        console.log(inspect( {
                signature: structure_name,
                bases: embed("name", structure.bases),
                contain: embed("name", structure.contains),
                fields: embed_fields(structure),
                friend: embed("name", structure.friends),
                methods: embed_methods(structure),
                name: structure.name,
                namespace: structure.namespace,
                col: structure.src_info.col,
                line: structure.src_info.line,
                file: structure.src_info.file,
                structure_type: structure.structure_type,
                template_args: embed("arg", structure.template_args),
                template_parent: structure.template_parent
            },{depth:Infinity} ));
        
        continue;
        

        await prisma.structure.create({
            data: {
                signature: structure_name,
                bases: embed("name", structure.bases),
                contain: embed("name", structure.contains),
                fields: embed_fields(structure),
                friend: embed("name", structure.friends),
                methods: embed_methods(structure),
                name: structure.name,
                namespace: structure.namespace,
                col: structure.src_info.col,
                line: structure.src_info.line,
                file: structure.src_info.file,
                structure_type: structure.structure_type,
                template_args: embed("arg", structure.template_args),
                template_parent: structure.template_parent
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
    // console.log(symbol_tree.dependencies[0].types);

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
