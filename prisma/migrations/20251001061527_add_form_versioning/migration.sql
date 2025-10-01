-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Form" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "schoolId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "schoolYear" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "title" TEXT,
    "date" DATETIME,
    "submittedAt" DATETIME,
    "approvedAt" DATETIME,
    CONSTRAINT "Form_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Form" ("approvedAt", "createdAt", "date", "id", "schoolId", "status", "submittedAt", "title", "updatedAt") SELECT "approvedAt", "createdAt", "date", "id", "schoolId", "status", "submittedAt", "title", "updatedAt" FROM "Form";
DROP TABLE "Form";
ALTER TABLE "new_Form" RENAME TO "Form";
CREATE INDEX "Form_schoolId_idx" ON "Form"("schoolId");
CREATE INDEX "Form_schoolId_version_idx" ON "Form"("schoolId", "version");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
