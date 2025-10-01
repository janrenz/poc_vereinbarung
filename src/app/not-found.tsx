import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-[var(--md-sys-color-on-surface)]">404</h1>
        <h2 className="text-2xl font-semibold text-[var(--md-sys-color-on-surface-variant)]">
          Seite nicht gefunden
        </h2>
        <p className="text-[var(--md-sys-color-on-surface-variant)]">
          Die gesuchte Seite existiert nicht.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-6 py-3 font-medium md-elevation-1 hover:md-elevation-2 transition-all"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}

