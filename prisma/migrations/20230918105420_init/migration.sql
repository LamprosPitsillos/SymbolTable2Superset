/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Post";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Dependency" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Types" (
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
    "MethodTemplateArgs" INTEGER NOT NULL DEFAULT 0,
    "dependencyId" INTEGER NOT NULL,
    CONSTRAINT "Types_dependencyId_fkey" FOREIGN KEY ("dependencyId") REFERENCES "Dependency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Source" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "source" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Structure" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "signature" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "col" INTEGER NOT NULL,
    "line" INTEGER NOT NULL,
    "file" TEXT NOT NULL,
    "structure_type" TEXT NOT NULL,
    "template_parent" TEXT
);

-- CreateTable
CREATE TABLE "StructTemplateArgs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "arg" TEXT NOT NULL,
    "structId" INTEGER NOT NULL,
    CONSTRAINT "StructTemplateArgs_structId_fkey" FOREIGN KEY ("structId") REFERENCES "Structure" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bases" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "structureId" INTEGER NOT NULL,
    CONSTRAINT "Bases_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contain" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "structureId" INTEGER NOT NULL,
    CONSTRAINT "Contain_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Fields" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "full_name" TEXT NOT NULL,
    "access" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "full_type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "col" INTEGER NOT NULL,
    "file" TEXT NOT NULL,
    "line" INTEGER NOT NULL,
    "structureId" INTEGER NOT NULL,
    CONSTRAINT "Fields_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Friends" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Method" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "signature" TEXT NOT NULL,
    "access" TEXT NOT NULL,
    "argsId" INTEGER NOT NULL,
    "brances" INTEGER NOT NULL,
    "lines" INTEGER NOT NULL,
    "literals" INTEGER NOT NULL,
    "loops" INTEGER NOT NULL,
    "max_score" INTEGER NOT NULL,
    "method_type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ret_type" TEXT NOT NULL,
    "col" INTEGER NOT NULL,
    "line" INTEGER NOT NULL,
    "file" TEXT NOT NULL,
    "statements" INTEGER NOT NULL,
    "virtual" BOOLEAN NOT NULL,
    "structureId" INTEGER NOT NULL,
    CONSTRAINT "Method_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MethodTemplateArgs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "arg" TEXT NOT NULL,
    "methodId" INTEGER NOT NULL,
    CONSTRAINT "MethodTemplateArgs_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "Method" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Args" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "col" INTEGER NOT NULL,
    "line" INTEGER NOT NULL,
    "file" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "methodId" INTEGER NOT NULL,
    CONSTRAINT "Args_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "Method" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Types_dependencyId_key" ON "Types"("dependencyId");

-- CreateIndex
CREATE UNIQUE INDEX "StructTemplateArgs_structId_key" ON "StructTemplateArgs"("structId");

-- CreateIndex
CREATE UNIQUE INDEX "Bases_structureId_key" ON "Bases"("structureId");

-- CreateIndex
CREATE UNIQUE INDEX "Contain_structureId_key" ON "Contain"("structureId");

-- CreateIndex
CREATE UNIQUE INDEX "Fields_structureId_key" ON "Fields"("structureId");

-- CreateIndex
CREATE UNIQUE INDEX "Method_argsId_key" ON "Method"("argsId");

-- CreateIndex
CREATE UNIQUE INDEX "Method_structureId_key" ON "Method"("structureId");

-- CreateIndex
CREATE UNIQUE INDEX "MethodTemplateArgs_methodId_key" ON "MethodTemplateArgs"("methodId");

-- CreateIndex
CREATE UNIQUE INDEX "Args_methodId_key" ON "Args"("methodId");
