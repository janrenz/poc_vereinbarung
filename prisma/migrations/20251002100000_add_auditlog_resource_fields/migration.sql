-- Add missing resource tracking fields to AuditLog
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "resourceType" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "resourceId" TEXT;

-- Create index for resource lookups
CREATE INDEX IF NOT EXISTS "AuditLog_resourceType_resourceId_idx" ON "AuditLog"("resourceType", "resourceId");
