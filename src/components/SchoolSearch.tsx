"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, MapPin, Building2, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";

type School = {
  externalId: string;
  name: string;
  city: string;
  state: string;
  address: string;
};

type SchoolSearchProps = {
  onSchoolSelect: (school: School) => void;
  selectedSchool?: School | null;
};

export function SchoolSearch({ onSchoolSelect, selectedSchool }: SchoolSearchProps) {
  const [query, setQuery] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<School | null>(selectedSchool || null);
  const debouncedQuery = useDebounce(query, 400);

  const searchSchools = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSchools([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/schools?q=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error("Suche fehlgeschlagen");
      }

      const data = await response.json();
      setSchools(data.schools || []);
      
      if (data.schools.length === 0) {
        setError("Keine Schulen gefunden");
      }
    } catch (err) {
      setError("Fehler bei der Suche. Bitte versuchen Sie es erneut.");
      setSchools([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    searchSchools(debouncedQuery);
  }, [debouncedQuery, searchSchools]);

  const handleSelectSchool = (school: School) => {
    setSelected(school);
    onSchoolSelect(school);
    setQuery(school.name);
    setSchools([]);
  };

  const handleClearSelection = () => {
    setSelected(null);
    setQuery("");
    setSchools([]);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <label className="block text-sm font-medium mb-2 text-[var(--md-sys-color-on-surface)]">
          Schule suchen
        </label>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[var(--md-sys-color-outline)]" />
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Schulname oder Ort eingeben..."
            data-testid="school-search-input"
            className="w-full pl-12 pr-4 py-3 rounded-[var(--md-sys-shape-corner-medium)] border-2 border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent transition-colors text-base"
            disabled={!!selected}
          />
          
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <Loader2 className="h-5 w-5 text-[var(--md-sys-color-primary)] animate-spin" data-testid="loading-spinner" />
            </div>
          )}

          {selected && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-[var(--md-sys-color-error)] hover:text-[var(--md-sys-color-error)]/80 text-sm font-medium touch-manipulation"
                data-testid="clear-selection"
              >
                Ändern
              </button>
            </div>
          )}
        </div>

        {query.length > 0 && query.length < 2 && !selected && (
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Bitte geben Sie mindestens 2 Zeichen ein
          </p>
        )}
      </div>

      {/* Selected School Display */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-primary-container)] border-2 border-[var(--md-sys-color-primary)]"
            data-testid="selected-school"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--md-sys-color-primary)] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-[var(--md-sys-color-on-primary)]" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-[var(--md-sys-color-on-primary-container)] mb-1">
                  {selected.name}
                </h4>
                <div className="space-y-1 text-sm text-[var(--md-sys-color-on-primary-container)]/80">
                  {selected.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{selected.city}</span>
                    </div>
                  )}
                  {selected.state && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>{selected.state}</span>
                    </div>
                  )}
                  {selected.address && (
                    <div className="text-xs opacity-75">
                      {selected.address}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results */}
      <AnimatePresence>
        {!selected && schools.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
            data-testid="search-results"
          >
            <p className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)]">
              {schools.length} {schools.length === 1 ? "Ergebnis" : "Ergebnisse"} gefunden
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {schools.map((school, index) => (
                <motion.button
                  key={school.externalId || index}
                  type="button"
                  onClick={() => handleSelectSchool(school)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="w-full text-left p-4 rounded-[var(--md-sys-shape-corner-medium)] border-2 border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary-container)]/20 transition-colors touch-manipulation"
                  data-testid={`school-result-${index}`}
                >
                  <h4 className="font-semibold text-[var(--md-sys-color-on-surface)] mb-1">
                    {school.name}
                  </h4>
                  <div className="flex flex-wrap gap-3 text-sm text-[var(--md-sys-color-on-surface-variant)]">
                    {school.city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{school.city}</span>
                      </div>
                    )}
                    {school.state && (
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        <span>{school.state}</span>
                      </div>
                    )}
                  </div>
                  {school.address && (
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]/70 mt-1">
                      {school.address}
                    </p>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]"
            data-testid="search-error"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



