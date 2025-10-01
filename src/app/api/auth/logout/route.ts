import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie } from "@/lib/session";
import { logAudit, getRequestInfo } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { ipAddress, userAgent } = getRequestInfo(req);

  try {
    // Get current user before deleting session
    const user = await getCurrentUser();

    // Get session token
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session-token");

    // Delete session from database
    if (sessionToken?.value) {
      await prisma.session.deleteMany({
        where: { token: sessionToken.value },
      });
    }

    // Clear all session cookies
    await clearSessionCookie();

    // Log logout
    if (user) {
      await logAudit({
        userId: user.id,
        userEmail: user.email,
        action: "LOGOUT",
        ipAddress,
        userAgent,
        success: true,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[AUTH] Logout error:", error);

    // Still try to clear cookies even if there's an error
    await clearSessionCookie();

    return NextResponse.json(
      { error: "Logout completed with errors" },
      { status: 200 } // Return 200 even on error since cookies are cleared
    );
  }
}

