import { isAuthenticated, isSuperAdmin } from "@/lib/auth";
import { NotificationBadge } from "./NotificationBadge";
import { Suspense } from "react";

export async function HeaderNotifications() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return null;
  }

  // Superadmin sieht keine Benachrichtigungen
  const superAdmin = await isSuperAdmin();
  if (superAdmin) {
    return null;
  }

  return (
    <Suspense fallback={<div className="w-9 h-9" />}>
      <NotificationBadge />
    </Suspense>
  );
}

