import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { Note, NoteInput, Todo } from "~/types/note";
import { createId } from "~/utils/id";
import { loadNotes, saveNotes, type KeyValueStorage, type LoadResult } from "~/utils/storage";

function copyTodos(todos: Todo[]): Todo[] {
  return todos.map((todo) => ({ ...todo }));
}

export const useNotesStore = defineStore("notes", () => {
  const notes = ref<Note[]>([]);
  let storage: KeyValueStorage | null = null;

  const sortedNotes = computed(() => [...notes.value].sort((a, b) => b.updatedAt - a.updatedAt));

  function getById(id: string): Note | undefined {
    return notes.value.find((note) => note.id === id);
  }

  function persist() {
    if (storage) saveNotes(storage, notes.value);
  }

  function load(target: KeyValueStorage): LoadResult {
    storage = target;
    const result = loadNotes(target);
    notes.value = result.notes;
    return result;
  }

  function reloadFromStorage() {
    if (storage) notes.value = loadNotes(storage).notes;
  }

  function create(input: NoteInput): Note {
    const now = Date.now();
    const note: Note = {
      id: createId(),
      title: input.title,
      todos: copyTodos(input.todos),
      createdAt: now,
      updatedAt: now,
    };
    notes.value.push(note);
    persist();
    return note;
  }

  function update(id: string, input: NoteInput): Note | undefined {
    const note = getById(id);
    if (!note) return undefined;
    note.title = input.title;
    note.todos = copyTodos(input.todos);
    note.updatedAt = Date.now();
    persist();
    return note;
  }

  function remove(id: string): boolean {
    const next = notes.value.filter((note) => note.id !== id);
    if (next.length === notes.value.length) return false;
    notes.value = next;
    persist();
    return true;
  }

  return { notes, sortedNotes, getById, load, reloadFromStorage, create, update, remove };
});
