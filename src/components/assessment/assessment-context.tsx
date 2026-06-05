"use client";

import * as React from "react";
import {
  createEmptyAssessment,
  type Assessment,
} from "@/lib/schemas";
import { loadDraft, saveDraft, deleteAllLocalData } from "@/lib/db";

/**
 * Holds the working assessment in React state for the length of the visit.
 *
 * PRIVACY: state lives in memory only. It is persisted to IndexedDB ONLY when
 * the user explicitly clicks "Save draft" (see saveLocal), never automatically
 * and never to any network destination.
 */
interface AssessmentContextValue {
  assessment: Assessment;
  /** Patch one top-level section of the assessment. */
  update: <K extends keyof Assessment>(key: K, value: Assessment[K]) => void;
  reset: () => void;
  saveLocal: () => Promise<void>;
  loadLocal: () => Promise<boolean>;
  deleteLocal: () => Promise<void>;
  /** True once we've attempted to hydrate from local storage. */
  hydrated: boolean;
  lastSavedAt: number | null;
}

const AssessmentContext = React.createContext<AssessmentContextValue | null>(
  null,
);

export function AssessmentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [assessment, setAssessment] = React.useState<Assessment>(
    createEmptyAssessment,
  );
  const [hydrated, setHydrated] = React.useState(false);
  const [lastSavedAt, setLastSavedAt] = React.useState<number | null>(null);

  // Attempt a one-time hydrate from any locally-saved draft.
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const draft = await loadDraft();
        if (active && draft) {
          setAssessment(draft);
          setLastSavedAt(draft.updatedAt);
        }
      } catch {
        // IndexedDB may be unavailable (private mode / blocked). Fail silent —
        // the app still works fully in-memory.
      } finally {
        if (active) setHydrated(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const update = React.useCallback(
    <K extends keyof Assessment>(key: K, value: Assessment[K]) => {
      setAssessment((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const reset = React.useCallback(() => {
    setAssessment(createEmptyAssessment());
  }, []);

  const saveLocal = React.useCallback(async () => {
    await saveDraft(assessment);
    setLastSavedAt(Date.now());
  }, [assessment]);

  const loadLocal = React.useCallback(async () => {
    const draft = await loadDraft();
    if (draft) {
      setAssessment(draft);
      setLastSavedAt(draft.updatedAt);
      return true;
    }
    return false;
  }, []);

  const deleteLocal = React.useCallback(async () => {
    await deleteAllLocalData();
    setLastSavedAt(null);
    setAssessment(createEmptyAssessment());
  }, []);

  const value: AssessmentContextValue = {
    assessment,
    update,
    reset,
    saveLocal,
    loadLocal,
    deleteLocal,
    hydrated,
    lastSavedAt,
  };

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const ctx = React.useContext(AssessmentContext);
  if (!ctx) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }
  return ctx;
}
