# SymbolTable to Superset

![Overview](https://github.com/LamprosPitsillos/SymbolTable2Database/assets/61395246/20c7077c-ae79-42ad-9d15-137283dbe540)

## Installation Instructions:

### 1. Clone the Repository
```bash
git clone git@github.com:LamprosPitsillos/SymbolTable2Superset.git
```

### 2. Install Dependencies
- [Installing Superset from PyPI](https://superset.apache.org/docs/installation/installing-superset-from-pypi)
- [Code Smell Detector](https://github.com/LamprosPitsillos/Code-Smell-Detector)
- MariaDB or any preferred database

### 3. Setup Environment

#### For NixOs
```bash
cd ./SymbolTable2Superset
nix develop .
bun i
# Configure datasource in `schema.prisma`
# Refer to: https://www.prisma.io/docs/orm/reference/connection-urls
bunx prisma generate
bun src/main.ts --help
```

#### For Other Distros
- Ensure you have `bun` or `ts-node & npm` installed
```bash
cd ./SymbolTable2Superset
bun i # npm i
# Configure datasource in `schema.prisma`
# Refer to: https://www.prisma.io/docs/orm/reference/connection-urls
bunx prisma generate # npx prisma generate
bun src/main.ts --help # ts-node src/main.ts --help
```

#### Note: Windows not tested

### 4. Database Initialization
- Setup a database and connect it to Superset and Prisma
    - Refer to [Superset Documentation](https://superset.apache.org/docs/databases/installing-database-drivers) and [Prisma Documentation](https://www.prisma.io/docs/orm/reference/connection-urls)

### 5. Import Dashboards
- Import `dashboard-export.zip` from `./superset_dash` into Superset dashboards.
