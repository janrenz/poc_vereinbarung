"use client";

import { Trash2 } from "lucide-react";

interface DeleteEntryButtonProps {
  entryId: string;
  entryTitle: string;
  deleteAction: (entryId: string) => void;
}

export function DeleteEntryButton({ entryId, entryTitle, deleteAction }: DeleteEntryButtonProps) {
  const handleDelete = () => {
    const confirmed = confirm(
      `Möchten Sie den Eintrag "${entryTitle || 'Ohne Titel'}" wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden.`
    );

    if (confirmed) {
      deleteAction(entryId);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="text-sm px-3 py-1 rounded-full border-2 border-[var(--md-sys-color-error)] text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)] transition-colors inline-flex items-center gap-1"
    >
      <Trash2 className="w-3 h-3" />
      Löschen
    </button>
  );
}
