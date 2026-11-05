import { describe, expect, it } from "vitest";
import {
  DRAFTS_KEY,
  DRAFTS_VERSION,
  NEW_NOTE_DRAFT,
  getDraft,
  loadDrafts,
  pruneDrafts,
  removeDraft,
  saveDraft,
  type Draft,
} from "../app/utils/drafts";
import { createMemoryStorage } from "./helpers";

function makeDraft(overrides: Partial<Draft> = {}): Draft {
  return {
    title: "Shopping",
    todos: [{ id: "t1", text: "Milk", done: false }],
    savedAt: 100,
    baseUpdatedAt: 50,
    ...overrides,
  };
}

describe("drafts", () => {
  it("returns no drafts when nothing is stored", () => {
    expect(loadDrafts(createMemoryStorage())).toEqual({});
  });

  it("saves a draft with the schema version and reads it back", () => {
    const storage = createMemoryStorage();

    saveDraft(storage, "n1", makeDraft());

    expect(JSON.parse(storage.data.get(DRAFTS_KEY) ?? "null").version).toBe(DRAFTS_VERSION);
    expect(getDraft(storage, "n1")).toEqual(makeDraft());
  });

  it("keeps drafts of other notes when saving one", () => {
    const storage = createMemoryStorage();
    saveDraft(storage, "n1", makeDraft());

    saveDraft(storage, NEW_NOTE_DRAFT, makeDraft({ title: "New", baseUpdatedAt: null }));

    expect(Object.keys(loadDrafts(storage)).sort()).toEqual(["n1", NEW_NOTE_DRAFT].sort());
  });

  it("removes only the given draft", () => {
    const storage = createMemoryStorage();
    saveDraft(storage, "n1", makeDraft());
    saveDraft(storage, "n2", makeDraft());

    removeDraft(storage, "n1");

    expect(Object.keys(loadDrafts(storage))).toEqual(["n2"]);
  });

  it("does not write when removing a missing draft", () => {
    const storage = createMemoryStorage();
    saveDraft(storage, "n1", makeDraft());
    storage.writes = 0;

    removeDraft(storage, "missing");

    expect(storage.writes).toBe(0);
  });

  it.each([
    ["invalid JSON", "{oops"],
    ["unknown version", JSON.stringify({ version: DRAFTS_VERSION + 1, drafts: {} })],
    ["drafts is not an object", JSON.stringify({ version: DRAFTS_VERSION, drafts: [] })],
  ])("ignores unreadable data: %s", (_, raw) => {
    const storage = createMemoryStorage({ [DRAFTS_KEY]: raw });

    expect(loadDrafts(storage)).toEqual({});

    saveDraft(storage, "n1", makeDraft());
    expect(loadDrafts(storage)).toEqual({ n1: makeDraft() });
  });

  it("skips malformed entries and keeps valid ones", () => {
    const storage = createMemoryStorage({
      [DRAFTS_KEY]: JSON.stringify({
        version: DRAFTS_VERSION,
        drafts: { good: makeDraft(), bad: { title: 1 } },
      }),
    });

    expect(loadDrafts(storage)).toEqual({ good: makeDraft() });
  });

  it("prunes drafts of missing notes but keeps the new-note draft", () => {
    const storage = createMemoryStorage();
    saveDraft(storage, "kept", makeDraft());
    saveDraft(storage, "gone", makeDraft());
    saveDraft(storage, NEW_NOTE_DRAFT, makeDraft({ baseUpdatedAt: null }));

    pruneDrafts(storage, ["kept"]);

    expect(Object.keys(loadDrafts(storage)).sort()).toEqual(["kept", NEW_NOTE_DRAFT].sort());
  });

  it("does not write when there is nothing to prune", () => {
    const storage = createMemoryStorage();
    saveDraft(storage, "kept", makeDraft());
    storage.writes = 0;

    pruneDrafts(storage, ["kept"]);

    expect(storage.writes).toBe(0);
  });
});
