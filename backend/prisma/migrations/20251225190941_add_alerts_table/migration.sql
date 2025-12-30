-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "warranty_id" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Alert_warranty_id_fkey" FOREIGN KEY ("warranty_id") REFERENCES "Warranty" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Alert_user_id_idx" ON "Alert"("user_id");

-- CreateIndex
CREATE INDEX "Alert_warranty_id_idx" ON "Alert"("warranty_id");

-- CreateIndex
CREATE INDEX "Alert_read_idx" ON "Alert"("read");
