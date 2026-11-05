import { computed, shallowRef } from "vue";

export const HISTORY_LIMIT = 50;

export function createHistory<T>(limit = HISTORY_LIMIT) {
  const past = shallowRef<T[]>([]);
  const future = shallowRef<T[]>([]);

  function push(entry: T) {
    past.value = [...past.value, entry].slice(-limit);
    future.value = [];
  }

  function undo(): T | undefined {
    const entry = past.value.at(-1);
    if (entry === undefined) return undefined;
    past.value = past.value.slice(0, -1);
    future.value = [...future.value, entry];
    return entry;
  }

  function redo(): T | undefined {
    const entry = future.value.at(-1);
    if (entry === undefined) return undefined;
    future.value = future.value.slice(0, -1);
    past.value = [...past.value, entry];
    return entry;
  }

  function clear() {
    past.value = [];
    future.value = [];
  }

  return {
    push,
    undo,
    redo,
    clear,
    canUndo: computed(() => past.value.length > 0),
    canRedo: computed(() => future.value.length > 0),
  };
}
