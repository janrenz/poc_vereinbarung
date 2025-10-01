-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Form" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdById" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "schoolYear" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "title" TEXT,
    "date" DATETIME,
    "submittedAt" DATETIME,
    "approvedAt" DATETIME,
    CONSTRAINT "Form_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Form_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Form" ("approvedAt", "createdAt", "date", "id", "schoolId", "schoolYear", "status", "submittedAt", "title", "updatedAt", "version") SELECT "approvedAt", "createdAt", "date", "id", "schoolId", "schoolYear", "status", "submittedAt", "title", "updatedAt", "version" FROM "Form";
DROP TABLE "Form";
ALTER TABLE "new_Form" RENAME TO "Form";
CREATE INDEX "Form_schoolId_idx" ON "Form"("schoolId");
CREATE INDEX "Form_schoolId_version_idx" ON "Form"("schoolId", "version");
CREATE INDEX "Form_createdById_idx" ON "Form"("createdById");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
