import { prisma, readClangSyntaxTree, fillDatabase, fillDatabaseRules } from "./Database"
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
    const rules_path = "./src/Smells.json";
    if (values["update-rules"]) {
        await fillDatabaseRules(rules_path)
        return
    }

    return
    const symbol_tree: SymbolTreeJson = readClangSyntaxTree(values.seed as string);
    await fillDatabase(symbol_tree)
    await fillDatabaseRules(rules_path)
}
