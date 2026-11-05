import type { Note, Todo } from "~/types/note";

export const STORAGE_KEY = "notes-app:data";
export const BACKUP_KEY = "notes-app:data:backup";
export const SCHEMA_VERSION = 1;

export type KeyValueStorage = Pick<Storage, "getItem" | "setItem">;

export interface PersistedData {
  version: number;
  notes: Note[];
}

export interface LoadResult {
  notes: Note[];
  recovered: boolean;
}

// key = version to migrate from; each step returns data of the next version
const migrations: Record<number, (data: Record<string, unknown>) => Record<string, unknown>> = {};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTodo(value: unknown): value is Todo {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.text === "string" &&
    typeof value.done === "boolean"
  );
}

function isNote(value: unknown): value is Note {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    Array.isArray(value.todos) &&
    value.todos.every(isTodo) &&
    typeof value.createdAt === "number" &&
    typeof value.updatedAt === "number"
  );
}

function migrate(data: unknown): PersistedData | null {
  let current = data;
  while (isObject(current) && typeof current.version === "number" && current.version < SCHEMA_VERSION) {
    const step = migrations[current.version];
    if (!step) return null;
    current = step(current);
  }

  if (!isObject(current) || current.version !== SCHEMA_VERSION) return null;
  const notes: unknown = current.notes;
  if (!Array.isArray(notes) || !notes.every(isNote)) return null;
  return { version: SCHEMA_VERSION, notes };
}

function parse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function saveNotes(storage: KeyValueStorage, notes: Note[]) {
  const data: PersistedData = { version: SCHEMA_VERSION, notes };
  storage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadNotes(storage: KeyValueStorage): LoadResult {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) return { notes: [], recovered: false };

  const data = migrate(parse(raw));
  if (data) return { notes: data.notes, recovered: false };

  // keep the unreadable original, then reset so the warning isn't shown on every reload
  storage.setItem(BACKUP_KEY, raw);
  saveNotes(storage, []);
  return { notes: [], recovered: true };
}
