import type { Draft } from "~/utils/drafts";
import type { NoteContent } from "~/utils/note-rules";

interface DraftPromptOptions {
    found: Draft | undefined;
    saved: NoteContent;
    savedUpdatedAt: number | null;
    content: () => NoteContent;
    discard: () => void;
    restore: (content: NoteContent) => void;
}

function sameContent(a: NoteContent, b: NoteContent): boolean {
    return JSON.stringify({ title: a.title, todos: a.todos }) === JSON.stringify({ title: b.title, todos: b.todos });
}

// offers a draft found on open; editing without answering counts as "dismiss"
export function useDraftPrompt(options: DraftPromptOptions) {
    const pending = shallowRef<Draft | null>(null);

    if (options.found) {
        if (sameContent(options.found, options.saved)) options.discard();
        else pending.value = options.found;
    }

    const isStale = computed(
        () => pending.value !== null && pending.value.baseUpdatedAt !== options.savedUpdatedAt,
    );

    function decline() {
        pending.value = null;
        options.discard();
    }

    function restore(): boolean {
        const found = pending.value;
        if (!found) return false;
        pending.value = null;
        options.restore(found);
        return true;
    }

    function dismiss() {
        pending.value = null;
    }

    // sync: has to run before useDraft reacts to the same edit and schedules a new draft write
    watch(
        () => JSON.stringify(options.content()),
        () => {
            if (pending.value) decline();
        },
        { flush: "sync" },
    );

    return { pending: computed(() => pending.value), isStale, restore, decline, dismiss };
}
