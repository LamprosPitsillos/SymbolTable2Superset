import { Prisma, PrismaClient } from '@prisma/client'
import { inspect } from 'util';
import { values } from "./CLI"
import { SymbolTreeJson, Source, Dependency, Structures, StructureEntry, Field, Field_flat, Method, Method_flat, Arg, Arg_flat, Definition, Definition_flat, Header } from './SyntaxTree'
import * as fs from 'fs';
import { detectNamingConvention } from './HelperTables/Naming';

export const prisma = new PrismaClient({
    errorFormat: 'pretty',
})

export function readClangSyntaxTree(filePath: string): SymbolTreeJson {
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

export async function fillDatabase(symbol_tree: SymbolTreeJson) {
    await fillDatabaseSources(symbol_tree.sources)
    await fillDatabaseHeaders(symbol_tree.headers)
    await fillDatabaseDependancies(symbol_tree.dependencies)
    await fillDatabaseStructures(symbol_tree.structures)

}

async function fillDatabaseSources(sources: Source[]) {
    const total = sources.length

    const verbose = values.verbose
    const dry = values["dry-run"]
    const name = `SOURCES${dry ? "-DRY" : ""}`

    for (let index = 0; index < total; index++) {
        const source = sources[index]
        const payload = {
            source: source
        };

        if (verbose) {
            console.log(inspect(payload, { depth: Infinity }));
        } else {
            showLoadingBar(0, name, index, total)
        }

        if (dry) {
            continue;
        }

        await prisma.source.create({
            data: payload,
        })

    }
    console.log();

}

async function fillDatabaseHeaders(headers: Header[] | undefined) {


    const verbose = values.verbose;
    const dry = values["dry-run"];
    const name = `HEADERS${dry ? "-DRY" : ""}`;

    if (headers === undefined) {

        console.log(`${name.padEnd(25)} No headers for ST generated...`)
        return;
    }
    const total = headers.length;

    for (let index = 0; index < total; index++) {
        const header = headers[index]
        const payload = {
            header: header
        };

        if (verbose) {
            console.log(inspect(payload, { depth: Infinity }));
        } else {
            showLoadingBar(0, name, index, total)
        }

        if (dry) {
            continue;
        }

        await prisma.header.create({
            data: payload,
        })

    }
    console.log();

}
async function fillDatabaseDependancies(dependencies: Dependency[]) {
    const total = dependencies.length

    const verbose = values.verbose
    const dry = values["dry-run"]
    const name = `DEPENDANCIES${dry ? "-DRY" : ""}`

    for (let index = 0; index < total; index++) {
        const dependency = dependencies[index]

        const payload = {
            dependency_from: dependency.from,
            dependency_to: dependency.to,
            types: {
                create: dependency.types
            }

        };

        if (verbose) {
            console.log(inspect(payload, { depth: Infinity }));
        } else {
            showLoadingBar(0, name, index, total)
        }



        if (dry) {
            continue;
        }

        await prisma.dependency.create({
            data: payload,
        })

    }
    console.log();

}

async function fillDatabaseStructures(structures: Structures) {


    const total = Object.keys(structures).length;
    const verbose = values.verbose
    const dry = values["dry-run"]
    const name = `STRUCTURES${dry ? "-DRY" : ""}`

    for (const [index, structure_name] of Object.keys(structures).entries()) {

        const structure: StructureEntry = structures[structure_name]
        const payload = {
            structure_signature: structure_name,
            structure_bases: embed("bases_name", structure.bases),
            structure_contain: embed("contain_name", structure.contains),
            structure_fields: embed_fields(structure),
            structure_friend: embed("friend_name", structure.friends),
            structure_methods: embed_methods(structure),
            structure_nested_parent: structure.nested_parent,
            structure_name: structure.name,
            structure_name_convention: detectNamingConvention(structure.name),
            structure_namespace: structure.namespace,
            structure_col: structure.src_info.col,
            structure_line: structure.src_info.line,
            structure_file: structure.src_info.file,
            structure_type: structure.structure_type,
            structure_template_args: embed("struct_template_arg", structure.template_args),
            structure_template_parent: structure.template_parent
        };

        if (verbose) {
            console.log(inspect(payload, { depth: Infinity }));
        } else {
            showLoadingBar(0, name, index, total)
        }

        if (dry) {
            continue;
        }


        await prisma.structure.create({
            data: payload,
        })


    }

    console.log();


}

function showLoadingBar(depth: number, name: string, index: number, total: number) {
    const percentage = ((index + 1) / total) * 100;
    const barLength = 55;
    const completedLength = Math.round((percentage / 100) * barLength);
    const remainingLength = barLength - completedLength;

    process.stdout.write('\r' + (name.padEnd(25)) + `${Math.round(percentage).toString().padStart(4)}%-[${'='.repeat(completedLength)}${'.'.repeat(remainingLength)}]`)


}

async function dropDatabase() {
    const tables = ["Dependency", "Structure", "Source"];

    for (const table of tables) {
        const drop = Prisma.sql`DROP TABLE IF EXISTS ${table}`
        await prisma.$executeRaw(drop);
    }

    // Any code you want to run after all tables are dropped
}


function embed_fields(structure: StructureEntry) {
    let object_fields = []
    for (const field_name in structure.fields) {
        const field: Field = structure.fields[field_name]
        if (field !== null) {

            const _field: Field_flat = {
                field_full_name: field_name,
                field_access: field.access,
                field_full_type: field.full_type,
                field_name: field.name,
                field_name_convention: detectNamingConvention(field.name),
                field_type: field.type,
                field_col: field.src_info.col,
                field_file: field.src_info.file,
                field_line: field.src_info.line,
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

            let _arg: Arg_flat = {
                arg_full_type: arg.full_type,
                arg_col: arg.src_info.col,
                arg_line: arg.src_info.line,
                arg_file: arg.src_info.file,
                arg_type: arg.type,
                arg_name: arg.name,
                arg_name_convention: detectNamingConvention(arg.name),
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
                definition_name: definition_name,
                definition_name_convention: detectNamingConvention(definition_name),
                definition_full_type: definition.full_type,
                definition_col: definition.src_info.col,
                definition_line: definition.src_info.line,
                definition_file: definition.src_info.file,
                definition_type: definition.type,
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
    if (structure.methods === null) return {}

    let object_methods = []

    const total = Object.keys(structure.methods).length;

    for (const [index, method_name] of Object.keys(structure.methods).entries()) {
        const method: Method = structure.methods[method_name]
        if (method !== null) {

            const _method = {
                method_access: method.access,
                method_args: embed_args(method.args),
                method_branches: method.branches,
                method_col: method.src_info.col,
                method_definitions: embed_definitions(method.definitions),
                method_file: method.src_info.file,
                method_line: method.src_info.line,
                method_lines: method.lines,
                method_literals: method.literals,
                method_loops: method.loops,
                method_max_scope: method.max_scope,
                method_type: method.method_type,
                method_name: method.name,
                method_name_convention: detectNamingConvention(method.name),
                method_ret_type: method.ret_type,
                method_signature: method_name,
                method_statements: method.statements,
                method_template_args: embed("arg", method.template_args),
                method_virtual: method.virtual,
            }
            object_methods.push(_method)
        }

    }

    // console.log("METHODS DONE");
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
