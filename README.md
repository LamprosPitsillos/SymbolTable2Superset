# SymbolTable to Superset
![Overview](https://github.com/LamprosPitsillos/SymbolTable2Database/assets/61395246/20c7077c-ae79-42ad-9d15-137283dbe540)

## Install instruction:
- `git clone "git@github.com:LamprosPitsillos/SymbolTable2Superset.git"`
- Dependencies
    - [Installing from PyPI | Superset](https://superset.apache.org/docs/installation/installing-superset-from-pypi)
    - [Code Smell Detector](https://github.com/LamprosPitsillos/Code-Smell-Detector)
    - A database , preferably `MariaDB`
- Setup
    - NixOs
        ```bash
        cd ./SymbolTable2Superset
        nix develop .
        bun i
        # Set up `datasource db` in `schema.prisma`
        # https://www.prisma.io/docs/orm/reference/connection-urls
        bunx prisma generate
        bun src/main.ts --help
        ```
    - Other Distros
        - You will need to have the following dependencies
            - `bun` or `ts-node & npm`
        ```bash
        cd ./SymbolTable2Superset
        bun i # npm i
        # Set up `datasource db` in `schema.prisma`
        # https://www.prisma.io/docs/orm/reference/connection-urls
        bunx prisma generate # npx prisma generate
        bun src/main.ts --help # ts-node src/main.ts --help
        ```
    - Windows not tested
- Assuming that you have set-up `superset` , `CodeSmellDetector` and `SymbolTable2Superset` following the instructions, you should initialise a Database and *"connect"* it to [Superset](https://superset.apache.org/docs/databases/installing-database-drivers) and [Prisma](https://www.prisma.io/docs/orm/reference/connection-urls).
- Lastly import `dashboard-export.zip` from `./superset_dash` in to `Superset` dashboards.
