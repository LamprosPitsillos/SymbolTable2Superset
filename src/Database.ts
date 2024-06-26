import { Prisma, PrismaClient, HeaderLine, Structure } from '@prisma/client'
import { inspect } from 'util';
import { values } from "./CLI"
import { Rule_db, getRules, getSmells } from './Rules';

import {
    SymbolTableJson,
    Source, Dependency,
    Structures, StructureEntry,
    Field, Field_flat,
    Method,
    Arg, Arg_flat,
    Definition, Definition_flat,
    Header
} from './SymbolTable'
import { readFileSync, PathLike } from 'fs';
import { detectNamingConvention } from './HelperFunctions/Naming';
import { processFile } from './HelperFunctions/Lines';
import { get_dependency_circles } from './HelperFunctions/Circuits';


export const prisma = new PrismaClient({
    errorFormat: 'pretty',
})

export function readClangSymbolTable(filePath: PathLike): SymbolTableJson {
    try {
        const jsonContent = readFileSync(filePath, 'ascii');
        const symbolTable = JSON.parse(jsonContent);
        return symbolTable;
    } catch (error) {

        let msg = "Error while reading Clang symbol table: "
        if (error instanceof Error) {
            msg += error.message
        }

        throw new Error(msg);
    }
}

export async function fillDatabase(symbol_table: SymbolTableJson) {
    await fillDatabaseSources(symbol_table.sources)
    await fillDatabaseHeaders(symbol_table.headers)
    await fillDatabaseDependancies(symbol_table.dependencies)
    await fillDatabaseStructures(symbol_table.structures, symbol_table.dependencies)
    await fillDatabaseDependancyCircles(symbol_table.dependencies)


}

export async function fillDatabaseDependancyCircles(dependencies: Dependency[]) {
    let circles = get_dependency_circles(dependencies)

    const total = circles.length

    const verbose = values.verbose
    const dry = values["dry-run"]
    const name = `CIRCLES${dry ? "-DRY" : ""}`

    for (let index = 0; index < total; index++) {
        const circle = circles[index]
        for (let node_index = 0; node_index < circle.length; node_index++) {

            const payload = {
                dependency_circle: index,
                dependency_struct_name: circle[node_index],
                dependency_struct_next: circle[node_index + 1] ?? circle[0],
            }

            showLoadingBar(0, name, index, total)

            if (verbose) {
                console.log(inspect(payload, { depth: Infinity }));
            }

            if (dry) {
                continue;
            }

            await prisma.dependencyCircle.create({
                data: payload,
            })
        }

    }
    console.log();


}
export async function fillDatabaseRules(rules_file: PathLike) {

    const verbose = values.verbose
    const dry = values["dry-run"]
    const name = `RULES${dry ? "-DRY" : ""}`


    const smells = await getSmells(rules_file)

    if (smells === undefined) { throw Error }
    const rules = getRules(smells)
    const total = rules.length
    const done = total + total / 90;
    const payload: Rule_db[] = [];

    for (let index = 0; index < total; index++) {
        const rule = rules[index]
        payload.push({
            rule_name: rule.name,
            rule_min: rule.min,
            rule_max: rule.max,
            rule_enum: rule.enum,
            rule_bool: rule.bool
        });
        await prisma.rule.upsert({
            where: { rule_name: rule.name },
            update: {
                rule_min: rule.min,
                rule_max: rule.max,
                rule_enum: rule.enum,
                rule_bool: rule.bool
            },
            create: {
                rule_name: rule.name,
                rule_min: rule.min,
                rule_max: rule.max,
                rule_enum: rule.enum,
                rule_bool: rule.bool
            },
        })
        showLoadingBar(0, name, index, done)
    }

    if (verbose) {
        console.log(inspect(payload, { depth: Infinity }));
    }

    if (dry) {
        console.log();
        return;
    }

    showLoadingBar(0, name, done - 1, done)
    console.log();

}


async function fillDatabaseSources(sources: Source[]) {
    const total = sources.length

    const verbose = values.verbose
    const dry = values["dry-run"]
    const name = `SOURCES${dry ? "-DRY" : ""}`

    for (let index = 0; index < total; index++) {
        const source = sources[index]
        const lines = await processFile(source)

        const payload = {
            source: source,
            // line: { create: [{ line_num: 10, line_len: 10 }] }
            // line: { create: [{ line_num: 10, line_len: 10 }] }
            line: { create: embed_many({ line_len: lines, line_num: Array.from({ length: lines.length }, (_, index) => index + 1) }) as { line_len: number, line_num: number }[] }
            // {
            //     // create: embed_many({ "line_len": lines, "line_num": lines })
            //
            // }
        };

        showLoadingBar(0, name, index, total)

        if (verbose) {
            console.log(inspect(payload, { depth: Infinity }));
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

        const lines = await processFile(header)

        const payload = {
            header: header,
            line: { create: embed_many({ line_len: lines, line_num: Array.from({ length: lines.length }, (_, index) => index + 1) }) as { line_len: number, line_num: number }[] }
        };

        if (verbose) console.log(inspect(payload, { depth: Infinity })); else
            showLoadingBar(0, name, index, total)

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
        } else
            showLoadingBar(0, name, index, total)



        if (dry) {
            continue;
        }

        await prisma.dependency.create({
            data: payload,
        })

    }
    console.log();

}

async function fillDatabaseStructures(structures: Structures, dependencies: Dependency[]) {


    const total = Object.keys(structures).length;

    const verbose = values.verbose
    const dry = values["dry-run"]
    const name = `STRUCTURES${dry ? "-DRY" : ""}`

    const base_structs = new Set()
    for (const dependency of dependencies) {
        if (dependency.types["Inherit"]) {
            base_structs.add(dependency.from)
        }
    }

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

        const is_base = base_structs.has(payload.structure_signature)
        if (verbose) {
            console.log(inspect(payload, { depth: Infinity }));
            console.log(is_base ? "= Is BASE =" : "")
        } else
            showLoadingBar(0, name, index, total)

        if (dry) {
            continue;
        }


        const struct = await prisma.structure.create({
            data: payload,
        })

        if (is_base) await prisma.baseStructure.create({ data: { base_structure_id: struct.structure_id } })


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

    for (const [_, method_name] of Object.keys(structure.methods).entries()) {
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
/*
* From { line_len : number[], line_num : number[] }
* To   { line_len : number, line_num : number }[]
*/
function embed_many<T>(data: Record<string, T[]>): Record<string, T>[] {
    const entries = Object.entries(data)
    const entries_len = entries.length
    const embedable = []

    // Check if all arrays are of the same length
    const arrays_len = entries[0][1].length
    for (let idx = 1; idx < entries_len; idx++) {
        if (entries[idx][1].length !== arrays_len) throw Error("Array len miss-much.");
    }

    for (let idx = 0; idx < arrays_len; idx++) {
        let row: Record<string, any> = {}
        for (const key of Object.keys(data)) {
            row[key] = data[key][idx]
        }
        embedable.push(row)

    }
    return embedable
}
