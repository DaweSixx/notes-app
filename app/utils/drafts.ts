import type { Todo } from "~/types/note";
import { isObject, isTodo, type KeyValueStorage } from "~/utils/storage";

export const DRAFTS_KEY = "notes-app:drafts";
export const DRAFTS_VERSION = 1;
export const NEW_NOTE_DRAFT = "new";

export interface Draft {
  title: string;
  todos: Todo[];
  savedAt: number;
  // updatedAt of the saved note when the draft was started; tells if the note changed since
  baseUpdatedAt: number | null;
}

export type DraftMap = Record<string, Draft>;

function isDraft(value: unknown): value is Draft {
  return (
    isObject(value) &&
    typeof value.title === "string" &&
    Array.isArray(value.todos) &&
    value.todos.every(isTodo) &&
    typeof value.savedAt === "number" &&
    (value.baseUpdatedAt === null || typeof value.baseUpdatedAt === "number")
  );
}

// drafts are disposable: unreadable data is dropped instead of being backed up
export function loadDrafts(storage: KeyValueStorage): DraftMap {
  const raw = storage.getItem(DRAFTS_KEY);
  if (raw === null) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (!isObject(parsed) || parsed.version !== DRAFTS_VERSION || !isObject(parsed.drafts)) return {};

  const drafts: DraftMap = {};
  for (const [key, value] of Object.entries(parsed.drafts)) {
    if (isDraft(value)) drafts[key] = value;
  }
  return drafts;
}

function writeDrafts(storage: KeyValueStorage, drafts: DraftMap) {
  storage.setItem(DRAFTS_KEY, JSON.stringify({ version: DRAFTS_VERSION, drafts }));
}

export function getDraft(storage: KeyValueStorage, key: string): Draft | undefined {
  return loadDrafts(storage)[key];
}

// read-modify-write, so tabs editing different notes don't overwrite each other's drafts
export function saveDraft(storage: KeyValueStorage, key: string, draft: Draft) {
  writeDrafts(storage, { ...loadDrafts(storage), [key]: draft });
}

export function removeDraft(storage: KeyValueStorage, key: string) {
  const drafts = loadDrafts(storage);
  if (!(key in drafts)) return;
  writeDrafts(storage, Object.fromEntries(Object.entries(drafts).filter(([k]) => k !== key)));
}

export function pruneDrafts(storage: KeyValueStorage, existingIds: string[]) {
  const entries = Object.entries(loadDrafts(storage));
  const kept = entries.filter(([key]) => key === NEW_NOTE_DRAFT || existingIds.includes(key));
  if (kept.length !== entries.length) writeDrafts(storage, Object.fromEntries(kept));
}
