import { prisma, readClangSymbolTable, fillDatabase, fillDatabaseRules } from "./Database"
import { SymbolTableJson } from "./SymbolTable";
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
    if (values["update-rules"] && values.seed === undefined) {
        await fillDatabaseRules(rules_path)
        return
    }

    const symbol_table: SymbolTableJson = readClangSymbolTable(values.seed as string);
    await fillDatabase(symbol_table)
    await fillDatabaseRules(rules_path)
}
