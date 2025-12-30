-- CreateTable
CREATE TABLE "WarrantyFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "warranty_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WarrantyFile_warranty_id_fkey" FOREIGN KEY ("warranty_id") REFERENCES "Warranty" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "WarrantyFile_warranty_id_idx" ON "WarrantyFile"("warranty_id");
