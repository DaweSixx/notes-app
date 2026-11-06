import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNotesStore } from "../app/stores/notes";
import { STORAGE_KEY, saveNotes } from "../app/utils/storage";
import { createMemoryStorage, makeNote, readStored } from "./helpers";

function setup(initial = [makeNote()]) {
  const storage = createMemoryStorage();
  saveNotes(storage, initial);
  storage.writes = 0;
  const store = useNotesStore();
  store.load(storage);
  return { store, storage };
}

describe("notes store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    vi.setSystemTime(1000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads notes without writing", () => {
    const { store, storage } = setup();

    expect(store.notes).toEqual([makeNote()]);
    expect(storage.writes).toBe(0);
  });

  it("creates a note with id and timestamps and persists it", () => {
    const { store, storage } = setup([]);

    const note = store.create({ title: "Ideas", todos: [{ id: "t1", text: "Sync", done: false }] });

    expect(note.id).toBeTruthy();
    expect(note.createdAt).toBe(1000);
    expect(note.updatedAt).toBe(1000);
    expect(store.getById(note.id)?.title).toBe("Ideas");
    expect(readStored(storage).notes).toHaveLength(1);
    expect(storage.writes).toBe(1);
  });

  it("copies todos so later changes to the input don't leak into the store", () => {
    const { store } = setup([]);
    const todos = [{ id: "t1", text: "Sync", done: false }];

    const note = store.create({ title: "Ideas", todos });
    todos[0]!.text = "Changed";

    expect(store.getById(note.id)?.todos[0]?.text).toBe("Sync");
  });

  it("updates title and todos, bumps updatedAt and persists", () => {
    const { store, storage } = setup();
    vi.setSystemTime(5000);

    store.update("n1", { title: "Groceries", todos: [{ id: "t1", text: "Milk", done: true }] });

    const note = store.getById("n1");
    expect(note?.title).toBe("Groceries");
    expect(note?.todos[0]?.done).toBe(true);
    expect(note?.createdAt).toBe(1);
    expect(note?.updatedAt).toBe(5000);
    expect(readStored(storage).notes[0]?.title).toBe("Groceries");
  });

  it("ignores updates of a missing note without writing", () => {
    const { store, storage } = setup();

    expect(store.update("missing", { title: "x", todos: [] })).toBeUndefined();
    expect(storage.writes).toBe(0);
  });

  it("removes a note and persists", () => {
    const { store, storage } = setup();

    expect(store.remove("n1")).toBe(true);
    expect(store.notes).toEqual([]);
    expect(readStored(storage).notes).toEqual([]);
  });

  it("ignores removal of a missing note without writing", () => {
    const { store, storage } = setup();

    expect(store.remove("missing")).toBe(false);
    expect(store.notes).toHaveLength(1);
    expect(storage.writes).toBe(0);
  });

  it("sorts notes by updatedAt, newest first", () => {
    const { store } = setup([
      makeNote({ id: "old", updatedAt: 10 }),
      makeNote({ id: "new", updatedAt: 30 }),
      makeNote({ id: "mid", updatedAt: 20 }),
    ]);

    expect(store.sortedNotes.map((note) => note.id)).toEqual(["new", "mid", "old"]);
  });

  it("keeps the state unchanged when writing to storage fails", () => {
    const { store, storage } = setup();
    storage.failWrites = true;

    expect(() => store.create({ title: "Ideas", todos: [] })).toThrow();
    expect(() => store.update("n1", { title: "Groceries", todos: [] })).toThrow();
    expect(() => store.remove("n1")).toThrow();

    expect(store.notes).toEqual([makeNote()]);
  });

  it("picks up changes written by another tab", () => {
    const { store, storage } = setup();
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, notes: [] }));

    store.reloadFromStorage();

    expect(store.notes).toEqual([]);
  });
});
