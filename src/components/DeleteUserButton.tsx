"use client";

interface DeleteUserButtonProps {
  userId: string;
  userEmail: string;
  deleteAction: (userId: string) => void;
}

export function DeleteUserButton({ userId, userEmail, deleteAction }: DeleteUserButtonProps) {
  return (
    <form action={() => deleteAction(userId)}>
      <button
        type="submit"
        className="rounded-[var(--md-sys-shape-corner-full)] border-2 border-[var(--md-sys-color-error)] text-[var(--md-sys-color-error)] px-4 py-2 text-sm font-medium hover:bg-[var(--md-sys-color-error-container)] transition-all"
        onClick={(e) => {
          if (!confirm(`Benutzer "${userEmail}" wirklich löschen?`)) {
            e.preventDefault();
          }
        }}
      >
        Löschen
      </button>
    </form>
  );
}
