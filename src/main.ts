import { prisma, readClangSyntaxTree, fillDatabase } from "./Database"
import { line_len_from_ST } from './HelperTables/Lines'
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
    console.time()
    line_len_from_ST(symbol_tree)
        .then((report) => {
            console.log(report);
        })
        .catch((error) => {
            console.error(error);
        });

    console.timeEnd()

    // await fillDatabase(symbol_tree)

}

