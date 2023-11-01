import { prisma, readClangSyntaxTree, fillDatabase } from "./Database"
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
    const symbol_tree = readClangSyntaxTree(values.seed as string);
    await fillDatabase(symbol_tree)

}

