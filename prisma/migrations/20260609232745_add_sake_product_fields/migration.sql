-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "sakaMai" TEXT,
    "seimaiWari" TEXT,
    "alcohol" TEXT,
    "description" TEXT,
    "price1800" REAL,
    "unit1800" TEXT DEFAULT '本',
    "stock1800" INTEGER DEFAULT 0,
    "price720" REAL,
    "unit720" TEXT DEFAULT '本',
    "stock720" INTEGER DEFAULT 0,
    "price" REAL NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT '本',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("createdAt", "description", "id", "name", "price", "stock", "unit", "updatedAt") SELECT "createdAt", "description", "id", "name", "price", "stock", "unit", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
