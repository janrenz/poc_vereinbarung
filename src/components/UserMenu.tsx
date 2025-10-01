"use client";

import { useState } from "react";
import { User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserMenuProps {
  user: {
    email: string;
    name?: string | null;
    role: string;
  } | null;
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/login");
        router.refresh();
      } else {
        console.error("Logout failed");
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)]/80 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary)] flex items-center justify-center text-[var(--md-sys-color-on-primary)]">
          <User className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium hidden sm:inline">
          {user.name || user.email}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-[var(--md-sys-shape-corner-large)] shadow-lg border border-[var(--md-sys-color-outline-variant)] z-50 overflow-hidden">
            <div className="p-4 border-b border-[var(--md-sys-color-outline-variant)]">
              <div className="font-medium text-[var(--md-sys-color-on-surface)]">
                {user.name || "Benutzer"}
              </div>
              <div className="text-sm text-[var(--md-sys-color-on-surface-variant)] truncate">
                {user.email}
              </div>
              <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
                <span className="px-2 py-0.5 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] rounded-full">
                  {user.role === "SUPERADMIN" ? "Super Admin" : "Admin"}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--md-sys-color-surface-variant)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-4 h-4 text-[var(--md-sys-color-error)]" />
              <span className="text-[var(--md-sys-color-error)] font-medium">
                {isLoggingOut ? "Abmelden..." : "Abmelden"}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
