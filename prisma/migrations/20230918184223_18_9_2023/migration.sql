/*
  Warnings:

  - You are about to drop the column `name` on the `Args` table. All the data in the column will be lost.
  - You are about to drop the column `dependencyId` on the `Types` table. All the data in the column will be lost.
  - Added the required column `typesId` to the `Dependency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `structureId` to the `Friends` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_type` to the `Args` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Dependency" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "typesId" INTEGER NOT NULL,
    CONSTRAINT "Dependency_typesId_fkey" FOREIGN KEY ("typesId") REFERENCES "Types" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Dependency" ("from", "id", "to") SELECT "from", "id", "to" FROM "Dependency";
DROP TABLE "Dependency";
ALTER TABLE "new_Dependency" RENAME TO "Dependency";
CREATE UNIQUE INDEX "Dependency_typesId_key" ON "Dependency"("typesId");
CREATE TABLE "new_Friends" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "structureId" INTEGER NOT NULL,
    CONSTRAINT "Friends_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Friends" ("id", "name") SELECT "id", "name" FROM "Friends";
DROP TABLE "Friends";
ALTER TABLE "new_Friends" RENAME TO "Friends";
CREATE UNIQUE INDEX "Friends_structureId_key" ON "Friends"("structureId");
CREATE TABLE "new_Args" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "full_type" TEXT NOT NULL,
    "col" INTEGER NOT NULL,
    "line" INTEGER NOT NULL,
    "file" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "methodId" INTEGER NOT NULL,
    CONSTRAINT "Args_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "Method" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Args" ("col", "file", "id", "line", "methodId", "type") SELECT "col", "file", "id", "line", "methodId", "type" FROM "Args";
DROP TABLE "Args";
ALTER TABLE "new_Args" RENAME TO "Args";
CREATE UNIQUE INDEX "Args_methodId_key" ON "Args"("methodId");
CREATE TABLE "new_Types" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Inherit" INTEGER NOT NULL DEFAULT 0,
    "Friend" INTEGER NOT NULL DEFAULT 0,
    "NestedClass" INTEGER NOT NULL DEFAULT 0,
    "ClassField" INTEGER NOT NULL DEFAULT 0,
    "ClassTemplateParent" INTEGER NOT NULL DEFAULT 0,
    "ClassTemplateArg" INTEGER NOT NULL DEFAULT 0,
    "MethodReturn" INTEGER NOT NULL DEFAULT 0,
    "MethodArg" INTEGER NOT NULL DEFAULT 0,
    "MethodDefinition" INTEGER NOT NULL DEFAULT 0,
    "MemberExpr" INTEGER NOT NULL DEFAULT 0,
    "MethodTemplateArgs" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Types" ("ClassField", "ClassTemplateArg", "ClassTemplateParent", "Friend", "Inherit", "MemberExpr", "MethodArg", "MethodDefinition", "MethodReturn", "MethodTemplateArgs", "NestedClass", "id") SELECT "ClassField", "ClassTemplateArg", "ClassTemplateParent", "Friend", "Inherit", "MemberExpr", "MethodArg", "MethodDefinition", "MethodReturn", "MethodTemplateArgs", "NestedClass", "id" FROM "Types";
DROP TABLE "Types";
ALTER TABLE "new_Types" RENAME TO "Types";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
