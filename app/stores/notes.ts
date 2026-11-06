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

  // write first: if storage throws (e.g. quota), the in-memory state stays as it was
  function commit(next: Note[]) {
    if (storage) saveNotes(storage, next);
    notes.value = next;
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
    commit([...notes.value, note]);
    return note;
  }

  function update(id: string, input: NoteInput): Note | undefined {
    const current = getById(id);
    if (!current) return undefined;
    const updated: Note = {
      ...current,
      title: input.title,
      todos: copyTodos(input.todos),
      updatedAt: Date.now(),
    };
    commit(notes.value.map((note) => (note.id === id ? updated : note)));
    return updated;
  }

  function remove(id: string): boolean {
    const next = notes.value.filter((note) => note.id !== id);
    if (next.length === notes.value.length) return false;
    commit(next);
    return true;
  }

  return { notes, sortedNotes, getById, load, reloadFromStorage, create, update, remove };
});
