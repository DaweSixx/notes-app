import type { Ref } from "vue";
import { getDraft, loadDrafts, removeDraft, saveDraft, type Draft } from "~/utils/drafts";
import type { NoteContent } from "~/utils/note-rules";

export const DRAFT_SAVE_DELAY = 500;

function getStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

// drafts are best-effort: a failed read or write must never break editing
function attempt<T>(action: (storage: Storage) => T): T | undefined {
  const storage = getStorage();
  if (!storage) return undefined;
  try {
    return action(storage);
  } catch {
    return undefined;
  }
}

// which notes have a draft — for the "Draft" badge on the home page
export function useDraftKeys() {
  const keys = useState<string[]>("draft-keys", () => []);

  function refresh() {
    keys.value = Object.keys(attempt(loadDrafts) ?? {});
  }

  function has(key: string): boolean {
    return keys.value.includes(key);
  }

  function remove(key: string) {
    attempt((storage) => removeDraft(storage, key));
    keys.value = keys.value.filter((k) => k !== key);
  }

  return { has, refresh, remove };
}

interface DraftOptions {
  key: () => string;
  content: () => NoteContent;
  isDirty: Readonly<Ref<boolean>>;
  baseUpdatedAt: () => number | null;
}

export function useDraft(options: DraftOptions) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  function stop() {
    clearTimeout(timer);
    timer = undefined;
  }

  function read(): Draft | undefined {
    return attempt((storage) => getDraft(storage, options.key()));
  }

  function write() {
    stop();
    const { title, todos } = options.content();
    const draft: Draft = {
      title,
      todos: todos.map((todo) => ({ ...todo })),
      savedAt: Date.now(),
      baseUpdatedAt: options.baseUpdatedAt(),
    };
    attempt((storage) => saveDraft(storage, options.key(), draft));
  }

  function discard(key = options.key()) {
    stop();
    attempt((storage) => removeDraft(storage, key));
  }

  function flush() {
    if (timer !== undefined) write();
  }

  // not immediate: opening a note must not touch an existing draft before the user decides
  watch([() => JSON.stringify(options.content()), options.isDirty], () => {
    if (options.isDirty.value) {
      stop();
      timer = setTimeout(write, DRAFT_SAVE_DELAY);
    } else {
      discard();
    }
  });

  function onVisibilityChange() {
    if (document.visibilityState === "hidden") flush();
  }

  onMounted(() => {
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibilityChange);
  });

  onBeforeUnmount(() => {
    flush();
    window.removeEventListener("pagehide", flush);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  });

  return { read, discard };
}
