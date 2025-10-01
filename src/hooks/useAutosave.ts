import { useEffect, useRef, useCallback } from 'react';

type AutosaveOptions = {
  delay?: number;
  onSave: () => Promise<void> | void;
  enabled?: boolean;
};

export function useAutosave({ delay = 2000, onSave, enabled = true }: AutosaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef(false);

  const triggerSave = useCallback(async () => {
    if (!enabled || isSavingRef.current) {
      pendingSaveRef.current = true;
      return;
    }

    isSavingRef.current = true;
    pendingSaveRef.current = false;

    try {
      await onSave();
    } catch (error) {
      console.error('Autosave failed:', error);
    } finally {
      isSavingRef.current = false;

      // If there was a pending save request, trigger it now
      if (pendingSaveRef.current) {
        pendingSaveRef.current = false;
        triggerSave();
      }
    }
  }, [onSave, enabled]);

  const scheduleAutosave = useCallback(() => {
    if (!enabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      triggerSave();
    }, delay);
  }, [delay, triggerSave, enabled]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { scheduleAutosave, triggerSave };
}



