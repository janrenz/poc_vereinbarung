"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function FormularContent() {
  const [code, setCode] = useState("");
  const searchParams = useSearchParams();
  const [error, setError] = useState(false);

  useEffect(() => {
    const invalid = searchParams?.get("invalid");
    if (invalid === "1") {
      setError(true);
    }
  }, [searchParams]);

  const go = () => {
    const c = code.trim().toUpperCase();
    if (!c) return;
    window.location.href = `/formular/${encodeURIComponent(c)}`;
  };

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Formular aufrufen</h1>
      <p className="text-slate-600">Bitte geben Sie Ihren Zugangscode ein.</p>
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          Ungültiger Zugangscode. Bitte versuchen Sie es erneut.
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="Zugangscode"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button 
          onClick={go} 
          className="rounded-md bg-[var(--md-sys-color-primary)] text-white px-4 py-2 hover:bg-[var(--md-sys-color-primary)]/90 transition-colors"
        >
          Weiter
        </button>
      </div>
    </div>
  );
}

export default function FormularLanding() {
  return (
    <Suspense fallback={<div>Laden...</div>}>
      <FormularContent />
    </Suspense>
  );
}
