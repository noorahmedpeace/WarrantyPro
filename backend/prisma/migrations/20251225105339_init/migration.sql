-- CreateTable
CREATE TABLE "Warranty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "brand" TEXT,
    "category" TEXT,
    "purchase_date" DATETIME NOT NULL,
    "warranty_duration_months" INTEGER NOT NULL,
    "expiry_date" DATETIME NOT NULL,
    "shop_name" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Warranty_user_id_idx" ON "Warranty"("user_id");

-- CreateIndex
CREATE INDEX "Warranty_expiry_date_idx" ON "Warranty"("expiry_date");
