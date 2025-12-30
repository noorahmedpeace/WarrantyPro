/*
  Warnings:

  - You are about to drop the column `category` on the `Warranty` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Warranty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "brand" TEXT,
    "categoryId" TEXT,
    "purchase_date" DATETIME NOT NULL,
    "warranty_duration_months" INTEGER NOT NULL,
    "expiry_date" DATETIME NOT NULL,
    "shop_name" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Warranty_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Warranty" ("brand", "created_at", "expiry_date", "id", "notes", "product_name", "purchase_date", "shop_name", "status", "updated_at", "user_id", "warranty_duration_months") SELECT "brand", "created_at", "expiry_date", "id", "notes", "product_name", "purchase_date", "shop_name", "status", "updated_at", "user_id", "warranty_duration_months" FROM "Warranty";
DROP TABLE "Warranty";
ALTER TABLE "new_Warranty" RENAME TO "Warranty";
CREATE INDEX "Warranty_user_id_idx" ON "Warranty"("user_id");
CREATE INDEX "Warranty_expiry_date_idx" ON "Warranty"("expiry_date");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
