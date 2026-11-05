import { describe, expect, it } from "vitest";
import {
  BACKUP_KEY,
  SCHEMA_VERSION,
  STORAGE_KEY,
  loadNotes,
  saveNotes,
} from "../app/utils/storage";
import { createMemoryStorage, makeNote, readStored } from "./helpers";

describe("storage", () => {
  it("returns an empty list when nothing is stored", () => {
    const storage = createMemoryStorage();

    expect(loadNotes(storage)).toEqual({ notes: [], recovered: false });
    expect(storage.writes).toBe(0);
  });

  it("saves notes with the schema version and reads them back", () => {
    const storage = createMemoryStorage();
    const note = makeNote();

    saveNotes(storage, [note]);

    expect(readStored(storage).version).toBe(SCHEMA_VERSION);
    expect(loadNotes(storage)).toEqual({ notes: [note], recovered: false });
  });

  it.each([
    ["invalid JSON", "{oops"],
    ["no version", JSON.stringify({ notes: [] })],
    ["unknown newer version", JSON.stringify({ version: SCHEMA_VERSION + 1, notes: [] })],
    ["notes is not an array", JSON.stringify({ version: SCHEMA_VERSION, notes: {} })],
    ["note with wrong shape", JSON.stringify({ version: SCHEMA_VERSION, notes: [{ id: 1 }] })],
    [
      "todo with wrong shape",
      JSON.stringify({
        version: SCHEMA_VERSION,
        notes: [makeNote({ todos: [{ id: "t1", text: "Milk" } as never] })],
      }),
    ],
  ])("backs up and resets unreadable data: %s", (_, raw) => {
    const storage = createMemoryStorage({ [STORAGE_KEY]: raw });

    expect(loadNotes(storage)).toEqual({ notes: [], recovered: true });
    expect(storage.data.get(BACKUP_KEY)).toBe(raw);
    expect(readStored(storage)).toEqual({ version: SCHEMA_VERSION, notes: [] });
  });

  it("does not report recovery again after the reset", () => {
    const storage = createMemoryStorage({ [STORAGE_KEY]: "{oops" });

    loadNotes(storage);

    expect(loadNotes(storage).recovered).toBe(false);
    expect(storage.data.get(BACKUP_KEY)).toBe("{oops");
  });
});
