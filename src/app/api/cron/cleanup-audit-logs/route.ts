import { NextRequest, NextResponse } from "next/server";
import { cleanupOldAuditLogs } from "@/lib/audit-cleanup";

/**
 * Cron endpoint to clean up old audit logs
 * Should be called daily by Vercel Cron or similar service
 *
 * Requires CRON_SECRET environment variable for authentication
 */
export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("[CRON] CRON_SECRET environment variable not set");
    return NextResponse.json(
      { error: "Cron job not configured" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error("[CRON] Unauthorized cron job attempt");
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    console.log("[CRON] Starting audit log cleanup...");
    const result = await cleanupOldAuditLogs();

    console.log(
      `[CRON] Audit log cleanup completed. Deleted ${result.deletedCount} records.`
    );

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON] Audit log cleanup failed:", error);
    return NextResponse.json(
      {
        error: "Cleanup failed",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
