// Status label translations for German UI
export const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Entwurf, noch nicht final",
  SUBMITTED: "Eingereicht",
  RETURNED: "Zur Überarbeitung zurückgegeben",
  APPROVED: "Angenommen",
  ARCHIVED: "Archiviert",
};

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status;
}

export const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  RETURNED: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  ARCHIVED: "bg-gray-100 text-gray-700",
};

export function getStatusColor(status: string): string {
  return STATUS_COLORS[status] || STATUS_COLORS.DRAFT;
}



