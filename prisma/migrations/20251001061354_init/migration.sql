-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT
);

-- CreateTable
CREATE TABLE "Form" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "schoolId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "title" TEXT,
    "date" DATETIME,
    "submittedAt" DATETIME,
    "approvedAt" DATETIME,
    CONSTRAINT "Form_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "formId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "zielsetzungenText" TEXT,
    "zielbereich1" JSONB,
    "zielbereich2" JSONB,
    "zielbereich3" JSONB,
    "datengrundlage" JSONB,
    "datengrundlageAndere" TEXT,
    "zielgruppe" JSONB,
    "zielgruppeSusDetail" TEXT,
    "massnahmen" TEXT,
    "indikatoren" TEXT,
    "verantwortlich" TEXT,
    "beteiligt" TEXT,
    "beginnSchuljahr" TEXT,
    "beginnHalbjahr" INTEGER,
    "endeSchuljahr" TEXT,
    "endeHalbjahr" INTEGER,
    "fortbildungJa" BOOLEAN NOT NULL DEFAULT false,
    "fortbildungThemen" TEXT,
    "fortbildungZielgruppe" TEXT,
    CONSTRAINT "Entry_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccessCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "expiresAt" DATETIME,
    "usedAt" DATETIME,
    CONSTRAINT "AccessCode_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "formId" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "authorName" TEXT,
    "message" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Comment_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "School_externalId_key" ON "School"("externalId");

-- CreateIndex
CREATE INDEX "Form_schoolId_idx" ON "Form"("schoolId");

-- CreateIndex
CREATE INDEX "Entry_formId_idx" ON "Entry"("formId");

-- CreateIndex
CREATE UNIQUE INDEX "AccessCode_code_key" ON "AccessCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AccessCode_formId_key" ON "AccessCode"("formId");

-- CreateIndex
CREATE INDEX "Comment_formId_idx" ON "Comment"("formId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");

-- CreateIndex
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");
