import type { Ref } from "vue";
import type { OperationTarget } from "~/utils/note-operations";

interface EditorFocusOptions {
    title: Readonly<Ref<HTMLInputElement | null>>;
    list: Readonly<Ref<HTMLElement | null>>;
    todos: () => readonly { readonly id: string }[];
    focusAdd: () => void;
}

function flash(el: HTMLElement) {
    el.classList.remove("flash");
    void el.offsetWidth;
    el.classList.add("flash");
    el.addEventListener("animationend", () => el.classList.remove("flash"), { once: true });
}

function focusEnd(el: HTMLInputElement | HTMLTextAreaElement) {
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
}

export function useEditorFocus(options: EditorFocusOptions) {
    function focusTodo(id: string): HTMLElement | null {
        const row = options.list.value?.querySelector<HTMLElement>(`[data-todo-id="${CSS.escape(id)}"]`);
        const field = row?.querySelector("textarea");
        if (!row || !field) return null;
        focusEnd(field);
        return row;
    }

    function focusTodoOrAdd(id: string | undefined) {
        if (id === undefined || !focusTodo(id)) options.focusAdd();
    }

    // the todo after `id`, or the first one when `id` is omitted; "add task" after the last
    function focusAfter(id?: string) {
        const todos = options.todos();
        const index = id === undefined ? -1 : todos.findIndex((todo) => todo.id === id);
        focusTodoOrAdd(todos[index + 1]?.id);
    }

    // after undo/redo: focus and highlight what changed
    function focusTarget(target: OperationTarget | undefined) {
        if (!target || target.field === "list") return;
        nextTick(() => {
            if (target.field === "title") {
                const el = options.title.value;
                if (!el) return;
                focusEnd(el);
                flash(el);
            } else if (target.exists) {
                const row = focusTodo(target.todoId);
                if (row) flash(row);
            } else {
                options.focusAdd();
            }
        });
    }

    return { focusTarget, focusAfter, focusTodoOrAdd };
}
