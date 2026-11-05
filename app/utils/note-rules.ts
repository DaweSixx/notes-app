import type { NoteInput, Todo } from "~/types/note";

// read-only view of note content, so the editor's readonly draft can be passed as is
export interface NoteContent {
  readonly title: string;
  readonly todos: readonly Readonly<Todo>[];
}

export interface NormalizedNote {
  input: NoteInput;
  removedEmpty: number;
}

export function isBlankText(text: string): boolean {
  return text.trim() === "";
}

export function isBlankNote(content: NoteContent): boolean {
  return isBlankText(content.title) && content.todos.every((todo) => isBlankText(todo.text));
}

// trims texts and drops empty todos; an empty title is kept and shown as "Untitled"
export function normalizeForSave(content: NoteContent): NormalizedNote {
  const todos = content.todos.map((todo) => ({ id: todo.id, text: todo.text.trim(), done: todo.done }));
  const kept = todos.filter((todo) => todo.text !== "");
  return {
    input: { title: content.title.trim(), todos: kept },
    removedEmpty: todos.length - kept.length,
  };
}
