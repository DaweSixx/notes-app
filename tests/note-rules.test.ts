import { describe, expect, it } from "vitest";
import type { NoteInput } from "../app/types/note";
import { isBlankNote, normalizeForSave } from "../app/utils/note-rules";

function makeInput(overrides: Partial<NoteInput> = {}): NoteInput {
  return {
    title: "  Shopping  ",
    todos: [
      { id: "a", text: " Milk ", done: true },
      { id: "b", text: "   ", done: false },
      { id: "c", text: "", done: true },
      { id: "d", text: "Bread", done: false },
    ],
    ...overrides,
  };
}

describe("normalizeForSave", () => {
  it("trims the title and todo texts", () => {
    const { input } = normalizeForSave(makeInput());

    expect(input.title).toBe("Shopping");
    expect(input.todos.map((t) => t.text)).toEqual(["Milk", "Bread"]);
  });

  it("drops empty and whitespace-only todos and reports how many", () => {
    const { input, removedEmpty } = normalizeForSave(makeInput());

    expect(input.todos.map((t) => t.id)).toEqual(["a", "d"]);
    expect(removedEmpty).toBe(2);
  });

  it("keeps ids and done state of the remaining todos", () => {
    const { input } = normalizeForSave(makeInput());

    expect(input.todos).toEqual([
      { id: "a", text: "Milk", done: true },
      { id: "d", text: "Bread", done: false },
    ]);
  });

  it("keeps an empty title as an empty string", () => {
    const { input } = normalizeForSave(makeInput({ title: "   " }));

    expect(input.title).toBe("");
  });

  it("does not mutate the input", () => {
    const original = makeInput();

    normalizeForSave(original);

    expect(original).toEqual(makeInput());
  });
});

describe("isBlankNote", () => {
  it("is true with no title and no todos", () => {
    expect(isBlankNote({ title: "", todos: [] })).toBe(true);
  });

  it("is true when title and todos contain only whitespace", () => {
    expect(isBlankNote({ title: "  ", todos: [{ id: "a", text: " ", done: true }] })).toBe(true);
  });

  it("is false with a title", () => {
    expect(isBlankNote({ title: "Ideas", todos: [] })).toBe(false);
  });

  it("is false with at least one non-empty todo", () => {
    expect(isBlankNote({ title: "", todos: [{ id: "a", text: "Milk", done: false }] })).toBe(false);
  });
});
