import { computed, getCurrentScope, onScopeDispose, reactive, readonly, shallowRef } from "vue";
import type { NoteInput, Todo } from "~/types/note";
import { createHistory } from "~/utils/history";
import { createId } from "~/utils/id";
import {
  applyOperation,
  invertOperation,
  type NoteOperation,
  type OperationTarget,
  type TextOperation,
} from "~/utils/note-operations";

export const TEXT_COMMIT_DELAY = 1000;

function cloneInput(input: NoteInput): NoteInput {
  return { title: input.title, todos: input.todos.map((todo) => ({ ...todo })) };
}

function sameField(a: TextOperation, b: TextOperation): boolean {
  if (a.type === "setTitle" || b.type === "setTitle") return a.type === b.type;
  return a.todoId === b.todoId;
}

export function useNoteEditor(initial: NoteInput) {
  const baseline = shallowRef(cloneInput(initial));
  const draft = reactive(cloneInput(initial));
  const history = createHistory<NoteOperation>();

  // a typing burst not yet in history; `to` follows the input until blur or pause
  const pending = shallowRef<TextOperation | null>(null);
  let timer: ReturnType<typeof setTimeout> | undefined;

  const hasPendingChange = computed(() => !!pending.value && pending.value.from !== pending.value.to);
  const canUndo = computed(() => history.canUndo.value || hasPendingChange.value);
  const canRedo = computed(() => history.canRedo.value && !hasPendingChange.value);
  const isDirty = computed(() => JSON.stringify(draft) !== JSON.stringify(baseline.value));
  const canSortPendingFirst = computed(() => {
    const firstDone = draft.todos.findIndex((t) => t.done);
    return firstDone !== -1 && draft.todos.slice(firstDone).some((t) => !t.done);
  });

  function stopTimer() {
    clearTimeout(timer);
    timer = undefined;
  }

  function commitText() {
    stopTimer();
    const op = pending.value;
    pending.value = null;
    if (op && op.from !== op.to) history.push(op);
  }

  function trackText(next: TextOperation) {
    if (pending.value && !sameField(pending.value, next)) commitText();
    pending.value = pending.value ? { ...pending.value, to: next.to } : next;
    stopTimer();
    timer = setTimeout(commitText, TEXT_COMMIT_DELAY);
  }

  function record(op: NoteOperation) {
    commitText();
    applyOperation(draft, op);
    history.push(op);
  }

  function setTitle(value: string) {
    if (value === draft.title) return;
    trackText({ type: "setTitle", from: draft.title, to: value });
    draft.title = value;
  }

  function setTodoText(todoId: string, value: string) {
    const todo = draft.todos.find((t) => t.id === todoId);
    if (!todo || value === todo.text) return;
    trackText({ type: "setTodoText", todoId, from: todo.text, to: value });
    todo.text = value;
  }

  function toggleTodo(todoId: string) {
    if (!draft.todos.some((t) => t.id === todoId)) return;
    record({ type: "toggleTodo", todoId });
  }

  function addTodo(text: string): Todo {
    const todo: Todo = { id: createId(), text, done: false };
    record({ type: "addTodo", todo, index: draft.todos.length });
    return { ...todo };
  }

  function removeTodo(todoId: string) {
    const index = draft.todos.findIndex((t) => t.id === todoId);
    const todo = draft.todos[index];
    if (!todo) return;
    record({ type: "removeTodo", todo: { ...todo }, index });
  }

  // one-off reorder: unfinished first, relative order inside each group is kept
  function sortPendingFirst() {
    if (!canSortPendingFirst.value) return;
    const from = draft.todos.map((t) => t.id);
    const to = [...draft.todos].sort((a, b) => Number(a.done) - Number(b.done)).map((t) => t.id);
    record({ type: "reorderTodos", from, to });
  }

  function undo(): OperationTarget | undefined {
    commitText();
    const op = history.undo();
    return op && applyOperation(draft, invertOperation(op));
  }

  function redo(): OperationTarget | undefined {
    commitText();
    const op = history.redo();
    return op && applyOperation(draft, op);
  }

  function replaceDraft(input: NoteInput) {
    draft.title = input.title;
    draft.todos = input.todos.map((todo) => ({ ...todo }));
  }

  function clearHistory() {
    stopTimer();
    pending.value = null;
    history.clear();
  }

  function markSaved() {
    clearHistory();
    baseline.value = cloneInput(draft);
  }

  function discardChanges() {
    clearHistory();
    replaceDraft(baseline.value);
  }

  if (getCurrentScope()) onScopeDispose(stopTimer);

  return {
    draft: readonly(draft),
    isDirty,
    canUndo,
    canRedo,
    canSortPendingFirst,
    setTitle,
    setTodoText,
    toggleTodo,
    addTodo,
    removeTodo,
    sortPendingFirst,
    commitText,
    undo,
    redo,
    markSaved,
    discardChanges,
  };
}
