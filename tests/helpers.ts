import type { Note } from "../app/types/note";
import { STORAGE_KEY, type KeyValueStorage, type PersistedData } from "../app/utils/storage";

export interface MemoryStorage extends KeyValueStorage {
  data: Map<string, string>;
  writes: number;
  failWrites: boolean;
}

export function createMemoryStorage(initial: Record<string, string> = {}): MemoryStorage {
  const storage: MemoryStorage = {
    data: new Map(Object.entries(initial)),
    writes: 0,
    failWrites: false,
    getItem: (key) => storage.data.get(key) ?? null,
    setItem: (key, value) => {
      if (storage.failWrites) throw new Error("QuotaExceededError");
      storage.writes++;
      storage.data.set(key, value);
    },
  };
  return storage;
}

export function readStored(storage: MemoryStorage): PersistedData {
  return JSON.parse(storage.data.get(STORAGE_KEY) ?? "null") as PersistedData;
}

export function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: "n1",
    title: "Shopping",
    todos: [{ id: "t1", text: "Milk", done: false }],
    createdAt: 1,
    updatedAt: 2,
    ...overrides,
  };
}
