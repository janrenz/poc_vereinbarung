import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

let seedAttempted = false;

/**
 * Middleware that runs on every request.
 * In production, attempts to seed the database once on the first request.
 */
export async function middleware(request: NextRequest) {
  // Only attempt seeding once in production
  if (process.env.NODE_ENV === "production" && !seedAttempted) {
    seedAttempted = true;

    // Import dynamically to avoid issues during build
    try {
      const { autoSeed } = await import("@/lib/auto-seed");
      await autoSeed();
    } catch (error) {
      console.error("⚠️ Auto-seed in middleware failed:", error);
      // Don't block the request if seeding fails
    }
  }

  return NextResponse.next();
}

// Only run middleware for actual page routes, not for static files or API routes that don't need it
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
