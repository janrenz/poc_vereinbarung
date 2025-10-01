import { prisma } from "./prisma";

/**
 * Delete audit logs older than 90 days for GDPR compliance
 * Should be run as a scheduled task (e.g., daily cron job)
 */
export async function cleanupOldAuditLogs(): Promise<{ deletedCount: number }> {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  try {
    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo,
        },
      },
    });

    console.log(
      `[AUDIT CLEANUP] Deleted ${result.count} audit logs older than 90 days`
    );

    return { deletedCount: result.count };
  } catch (error) {
    console.error("[AUDIT CLEANUP] Failed to delete old audit logs:", error);
    throw error;
  }
}

/**
 * Get count of audit logs older than 90 days (for monitoring)
 */
export async function getOldAuditLogsCount(): Promise<number> {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  try {
    const count = await prisma.auditLog.count({
      where: {
        createdAt: {
          lt: ninetyDaysAgo,
        },
      },
    });

    return count;
  } catch (error) {
    console.error(
      "[AUDIT CLEANUP] Failed to count old audit logs:",
      error
    );
    throw error;
  }
}
