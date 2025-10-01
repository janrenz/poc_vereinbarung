import { getUnreadCount } from "@/lib/notifications";
import { Bell } from "lucide-react";
import Link from "next/link";

export async function NotificationBadge() {
  const unreadCount = await getUnreadCount("SCHULAMT");

  if (unreadCount === 0) {
    return (
      <Link
        href="/admin/notifications"
        className="relative p-2 text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-variant)] rounded-full transition-colors"
        aria-label="Benachrichtigungen"
      >
        <Bell className="w-5 h-5" />
      </Link>
    );
  }

  return (
    <Link
      href="/admin/notifications"
      className="relative p-2 text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-variant)] rounded-full transition-colors"
      aria-label={`${unreadCount} ungelesene Benachrichtigungen`}
    >
      <Bell className="w-5 h-5" />
      <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] text-xs font-bold">
        {unreadCount > 9 ? "9+" : unreadCount}
      </span>
    </Link>
  );
}



