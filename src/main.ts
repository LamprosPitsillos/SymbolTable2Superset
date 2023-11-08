import { prisma, readClangSyntaxTree, fillDatabase, fillDatabaseRules } from "./Database"
import { line_len_from_ST } from './HelperTables/Lines'
import { name_analyse } from "./HelperTables/Naming";
import { SymbolTreeJson } from "./SyntaxTree";
import { values } from "./CLI"


main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })


async function main() {
    const symbol_tree: SymbolTreeJson = readClangSyntaxTree(values.seed as string);
    // console.log(await line_len_from_ST(symbol_tree));
    // name_analyse(symbol_tree);
    fillDatabaseRules("./src/Smells.json")

    // await fillDatabase(symbol_tree)

}

