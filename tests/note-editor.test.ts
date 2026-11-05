import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TEXT_COMMIT_DELAY, useNoteEditor } from "../app/composables/useNoteEditor";
import type { NoteInput } from "../app/types/note";

function makeInput(): NoteInput {
  return {
    title: "Shopping",
    todos: [
      { id: "a", text: "Milk", done: false },
      { id: "b", text: "Bread", done: true },
    ],
  };
}

function type(setValue: (value: string) => void, ...values: string[]) {
  for (const value of values) setValue(value);
}

describe("note editor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("text input", () => {
    it("records continuous typing in one field as a single entry after a pause", () => {
      const editor = useNoteEditor(makeInput());

      type(editor.setTitle, "Shopping l", "Shopping li", "Shopping list");
      vi.advanceTimersByTime(TEXT_COMMIT_DELAY);
      editor.undo();

      expect(editor.draft.title).toBe("Shopping");
      expect(editor.canUndo.value).toBe(false);
    });

    it("does not commit before the pause ends", () => {
      const editor = useNoteEditor(makeInput());

      editor.setTitle("Shopping l");
      vi.advanceTimersByTime(TEXT_COMMIT_DELAY - 1);
      editor.setTitle("Shopping list");
      vi.advanceTimersByTime(TEXT_COMMIT_DELAY);
      editor.undo();

      expect(editor.draft.title).toBe("Shopping");
    });

    it("splits typing into separate entries by pauses", () => {
      const editor = useNoteEditor(makeInput());

      editor.setTitle("Shopping list");
      vi.advanceTimersByTime(TEXT_COMMIT_DELAY);
      editor.setTitle("Shopping list 2");
      vi.advanceTimersByTime(TEXT_COMMIT_DELAY);

      editor.undo();
      expect(editor.draft.title).toBe("Shopping list");
      editor.undo();
      expect(editor.draft.title).toBe("Shopping");
    });

    it("commits on blur without waiting for the pause", () => {
      const editor = useNoteEditor(makeInput());

      editor.setTitle("Shopping list");
      editor.commitText();
      editor.setTitle("Shopping list 2");
      editor.commitText();

      editor.undo();
      expect(editor.draft.title).toBe("Shopping list");
    });

    it("commits the previous field when typing moves to another one", () => {
      const editor = useNoteEditor(makeInput());

      editor.setTitle("Groceries");
      editor.setTodoText("a", "Oat milk");
      editor.commitText();

      expect(editor.undo()).toEqual({ field: "todo", todoId: "a", exists: true });
      expect(editor.draft.todos[0]?.text).toBe("Milk");
      expect(editor.draft.title).toBe("Groceries");

      expect(editor.undo()).toEqual({ field: "title" });
      expect(editor.draft.title).toBe("Shopping");
    });

    it("undo in the middle of typing reverts the whole burst", () => {
      const editor = useNoteEditor(makeInput());

      type(editor.setTitle, "Shop", "Shopping list");
      expect(editor.canUndo.value).toBe(true);
      editor.undo();

      expect(editor.draft.title).toBe("Shopping");
    });

    it("creates no entry when the text ends up unchanged", () => {
      const editor = useNoteEditor(makeInput());

      type(editor.setTitle, "Shoppin", "Shopping");
      vi.advanceTimersByTime(TEXT_COMMIT_DELAY);

      expect(editor.canUndo.value).toBe(false);
    });
  });

  describe("atomic actions", () => {
    it("records every checkbox toggle separately", () => {
      const editor = useNoteEditor(makeInput());

      editor.toggleTodo("a");
      editor.toggleTodo("a");

      editor.undo();
      expect(editor.draft.todos[0]?.done).toBe(true);
      editor.undo();
      expect(editor.draft.todos[0]?.done).toBe(false);
    });

    it("undoes and redoes adding a todo", () => {
      const editor = useNoteEditor(makeInput());

      const todo = editor.addTodo("Eggs");
      expect(editor.draft.todos.at(-1)).toEqual(todo);

      expect(editor.undo()).toEqual({ field: "todo", todoId: todo.id, exists: false });
      expect(editor.draft.todos).toHaveLength(2);

      expect(editor.redo()).toEqual({ field: "todo", todoId: todo.id, exists: true });
      expect(editor.draft.todos.at(-1)).toEqual(todo);
    });

    it("restores a removed todo at its original position with its state", () => {
      const editor = useNoteEditor(makeInput());

      editor.removeTodo("a");
      expect(editor.draft.todos.map((t) => t.id)).toEqual(["b"]);

      editor.undo();
      expect(editor.draft.todos).toEqual(makeInput().todos);
    });

    it("commits pending typing before an atomic action", () => {
      const editor = useNoteEditor(makeInput());

      editor.setTodoText("a", "Oat milk");
      editor.removeTodo("a");

      editor.undo();
      expect(editor.draft.todos[0]?.text).toBe("Oat milk");
      editor.undo();
      expect(editor.draft.todos[0]?.text).toBe("Milk");
    });
  });

  describe("redo branch", () => {
    it("is cleared by a new change after undo", () => {
      const editor = useNoteEditor(makeInput());

      editor.toggleTodo("a");
      editor.undo();
      editor.addTodo("Eggs");

      expect(editor.canRedo.value).toBe(false);
      expect(editor.redo()).toBeUndefined();
    });

    it("is unavailable as soon as typing starts after undo", () => {
      const editor = useNoteEditor(makeInput());

      editor.toggleTodo("a");
      editor.undo();
      editor.setTitle("Groceries");

      expect(editor.canRedo.value).toBe(false);
      editor.redo();
      expect(editor.draft.todos[0]?.done).toBe(false);
    });
  });

  describe("session", () => {
    it("tracks dirty state against the last saved version", () => {
      const editor = useNoteEditor(makeInput());
      expect(editor.isDirty.value).toBe(false);

      editor.toggleTodo("a");
      expect(editor.isDirty.value).toBe(true);

      editor.undo();
      expect(editor.isDirty.value).toBe(false);
    });

    it("markSaved clears history and makes the draft the new baseline", () => {
      const editor = useNoteEditor(makeInput());
      editor.toggleTodo("a");
      editor.setTitle("Groceries");

      editor.markSaved();

      expect(editor.isDirty.value).toBe(false);
      expect(editor.canUndo.value).toBe(false);
      vi.advanceTimersByTime(TEXT_COMMIT_DELAY);
      expect(editor.canUndo.value).toBe(false);
    });

    it("discardChanges restores the baseline and clears history", () => {
      const editor = useNoteEditor(makeInput());
      editor.removeTodo("a");
      editor.setTitle("Groceries");

      editor.discardChanges();

      expect(editor.draft).toEqual(makeInput());
      expect(editor.isDirty.value).toBe(false);
      expect(editor.canUndo.value).toBe(false);
      expect(editor.canRedo.value).toBe(false);
    });

    it("does not mutate the initial input", () => {
      const input = makeInput();
      const editor = useNoteEditor(input);

      editor.setTitle("Groceries");
      editor.toggleTodo("a");

      expect(input).toEqual(makeInput());
    });
  });
});
