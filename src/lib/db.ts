import Dexie, { type Table } from "dexie";
import {
  assessmentSchema,
  createEmptyAssessment,
  type Assessment,
} from "./schemas";

/**
 * Local-only persistence layer for Pinpoint.
 *
 * PRIVACY MODEL (read me):
 * - This is the ONLY place assessment answers are persisted, and it is 100%
 *   client-side IndexedDB via Dexie. There is no sync, no remote endpoint,
 *   no service worker shipping data anywhere.
 * - Data lives in the user's browser profile and nowhere else. Clearing site
 *   data, using the in-app "Delete local data" button, or private browsing
 *   teardown removes it entirely.
 * - We store a single draft row keyed by a constant id. We do NOT store any
 *   visitor id, device fingerprint, or analytics record.
 */

export const DRAFT_ID = "draft";
const DB_NAME = "pinpoint";

class PinpointDB extends Dexie {
  assessments!: Table<Assessment, string>;

  constructor() {
    super(DB_NAME);
    this.version(1).stores({
      // Only the primary key is indexed; the rest of the document is opaque.
      assessments: "id",
    });
  }
}

// Guard against SSR: Dexie/IndexedDB only exist in the browser. During Next.js
// server rendering we expose a stub-free lazy accessor instead.
let _db: PinpointDB | null = null;
function db(): PinpointDB {
  if (typeof window === "undefined") {
    throw new Error("Pinpoint local storage is only available in the browser.");
  }
  if (!_db) _db = new PinpointDB();
  return _db;
}

/** True when IndexedDB is usable (browser + not blocked). */
export function isLocalStorageAvailable(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window;
}

/** Persist the working draft locally. Validates shape before writing. */
export async function saveDraft(assessment: Assessment): Promise<void> {
  const parsed = assessmentSchema.parse({
    ...assessment,
    id: DRAFT_ID,
    updatedAt: Date.now(),
  });
  await db().assessments.put(parsed);
}

/** Load the working draft, or null if none has been saved yet. */
export async function loadDraft(): Promise<Assessment | null> {
  const row = await db().assessments.get(DRAFT_ID);
  if (!row) return null;
  // Re-parse so older drafts get current defaults applied.
  return assessmentSchema.parse(row);
}

/** Has the user ever saved a draft in this browser? */
export async function hasDraft(): Promise<boolean> {
  const count = await db().assessments.where("id").equals(DRAFT_ID).count();
  return count > 0;
}

/**
 * Delete ALL Pinpoint data from this browser.
 *
 * PRIVACY: This is the user-facing "right to be forgotten" switch. We drop the
 * entire IndexedDB database rather than just rows, so nothing Pinpoint created
 * survives. Returns once the delete is complete.
 */
export async function deleteAllLocalData(): Promise<void> {
  if (_db) {
    _db.close();
    _db = null;
  }
  await Dexie.delete(DB_NAME);
}

/** Convenience used by the wizard when starting over. */
export function emptyAssessment(): Assessment {
  return createEmptyAssessment();
}
