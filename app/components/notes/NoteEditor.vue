<script setup lang="ts">
import ConfirmModal from "~/components/modals/ConfirmModal.vue";
import NoteEditorToolbar from "~/components/notes/NoteEditorToolbar.vue";
import NoteTodoAdd from "~/components/notes/NoteTodoAdd.vue";
import NoteTodoItem from "~/components/notes/NoteTodoItem.vue";
import { useNotesStore } from "~/stores/notes";
import type { NoteInput } from "~/types/note";
import { formatRelativeDate } from "~/utils/format-date";
import type { OperationTarget } from "~/utils/note-operations";

const props = defineProps<{
  noteId: string | null;
  initial: NoteInput;
  updatedAt: number | null;
}>();

const emit = defineEmits<{ created: [id: string] }>();

const { t, locale } = useI18n();
const store = useNotesStore();
const modal = useModal();
const toast = useToast();

const editor = useNoteEditor(props.initial);
const { draft, isDirty, canUndo, canRedo, canSortPendingFirst } = editor;

const noteId = ref(props.noteId);
const updatedAt = ref(props.updatedAt);

const total = computed(() => draft.todos.length);
const done = computed(() => draft.todos.filter((todo) => todo.done).length);
const eyebrow = computed(() =>
  updatedAt.value === null
    ? t("editor.new")
    : t("editor.updated", { date: formatRelativeDate(updatedAt.value, locale.value) }),
);

const titleInput = ref<HTMLInputElement | null>(null);
const list = ref<HTMLElement | null>(null);
const addRow = ref<InstanceType<typeof NoteTodoAdd> | null>(null);

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

function focusTodo(id: string): HTMLElement | null {
  const row = list.value?.querySelector<HTMLElement>(`[data-todo-id="${CSS.escape(id)}"]`);
  const field = row?.querySelector("textarea");
  if (!row || !field) return null;
  focusEnd(field);
  return row;
}

function focusTarget(target: OperationTarget | undefined) {
  if (!target || target.field === "list") return;
  nextTick(() => {
    if (target.field === "title") {
      if (!titleInput.value) return;
      focusEnd(titleInput.value);
      flash(titleInput.value);
    } else if (target.exists) {
      const row = focusTodo(target.todoId);
      if (row) flash(row);
    } else {
      addRow.value?.focus();
    }
  });
}

function undo() {
  focusTarget(editor.undo());
}

function redo() {
  focusTarget(editor.redo());
}

function focusAfter(id: string | undefined) {
  const index = id === undefined ? -1 : draft.todos.findIndex((todo) => todo.id === id);
  const next = draft.todos[index + 1];
  if (!next || !focusTodo(next.id)) addRow.value?.focus();
}

function onRemove(id: string) {
  const index = draft.todos.findIndex((todo) => todo.id === id);
  const neighbour = draft.todos[index + 1] ?? draft.todos[index - 1];
  editor.removeTodo(id);
  nextTick(() => {
    if (!neighbour || !focusTodo(neighbour.id)) addRow.value?.focus();
  });
}

function save() {
  editor.commitText();
  if (!isDirty.value) return;

  const input: NoteInput = {
    title: draft.title,
    todos: draft.todos.map((todo) => ({ id: todo.id, text: todo.text, done: todo.done })),
  };

  try {
    if (noteId.value === null) {
      const note = store.create(input);
      noteId.value = note.id;
      emit("created", note.id);
    } else if (!store.update(noteId.value, input)) {
      toast.show(t("editor.saveFailed"), "warn");
      return;
    }
  } catch {
    toast.show(t("editor.saveFailed"), "warn");
    return;
  }

  editor.markSaved();
  updatedAt.value = Date.now();
  toast.show(t("editor.saved"));
}

async function cancel() {
  editor.commitText();
  if (isDirty.value) {
    const confirmed = await modal.open(ConfirmModal, {
      title: t("editor.cancelTitle"),
      text: t("editor.cancelText"),
      confirmText: t("editor.cancelConfirm"),
      cancelText: t("editor.cancelKeep"),
      tone: "warn",
    });
    if (!confirmed) return;
  }
  editor.discardChanges();
  await navigateTo("/");
}

async function remove() {
  const confirmed = await modal.open(ConfirmModal, {
    title: t("home.deleteTitle"),
    text: t("home.deleteText", { title: draft.title || t("note.untitled") }),
    confirmText: t("common.delete"),
  });
  if (!confirmed || noteId.value === null) return;
  store.remove(noteId.value);
  toast.show(t("home.deleted"));
  await navigateTo("/");
}

useEditorShortcuts({ undo, redo, save });

onMounted(() => {
  if (noteId.value === null) titleInput.value?.focus();
});

// collapse the removed row so the rows below slide up instead of jumping
function lockHeight(el: Element) {
  const node = el as HTMLElement;
  node.style.height = `${node.offsetHeight}px`;
}
</script>

<template>
  <div class="note-editor">
    <NoteEditorToolbar
      :dirty="isDirty"
      :can-undo="canUndo"
      :can-redo="canRedo"
      @undo="undo"
      @redo="redo"
      @save="save"
    />

    <article class="sheet">
      <p class="eyebrow">{{ eyebrow }}</p>
      <input
        ref="titleInput"
        class="title"
        :value="draft.title"
        :placeholder="t('note.untitled')"
        :aria-label="t('editor.titleLabel')"
        maxlength="200"
        @input="editor.setTitle(($event.target as HTMLInputElement).value)"
        @blur="editor.commitText()"
        @keydown.enter.prevent="focusAfter(undefined)"
      />

      <div class="progress-row">
        <BaseProgress :done="done" :total="total" size="md" class="progress" />
        <span class="count">{{ done }} / {{ total }}</span>
        <BaseButton
          variant="plain"
          size="sm"
          icon="sort"
          :disabled="!canSortPendingFirst"
          @click="editor.sortPendingFirst()"
        >
          {{ t("editor.sortPendingFirst") }}
        </BaseButton>
      </div>

      <div ref="list">
        <TransitionGroup tag="ul" name="todo" class="todos" @before-leave="lockHeight">
          <NoteTodoItem
            v-for="todo in draft.todos"
            :key="todo.id"
            :todo="todo"
            @toggle="editor.toggleTodo(todo.id)"
            @update:text="editor.setTodoText(todo.id, $event)"
            @commit="editor.commitText()"
            @remove="onRemove(todo.id)"
            @enter="focusAfter(todo.id)"
          />
        </TransitionGroup>
      </div>

      <NoteTodoAdd ref="addRow" @add="editor.addTodo($event)" />

      <div class="shortcuts">
        <span><kbd>Ctrl</kbd><kbd>Z</kbd> {{ t("editor.shortcutUndo") }}</span>
        <span><kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>Z</kbd> {{ t("editor.shortcutRedo") }}</span>
        <span><kbd>Ctrl</kbd><kbd>S</kbd> {{ t("editor.shortcutSave") }}</span>
      </div>
    </article>

    <div class="foot">
      <BaseButton variant="plain" icon="x" @click="cancel">{{ t("editor.cancel") }}</BaseButton>
      <BaseButton v-if="noteId !== null" variant="danger-ghost" icon="trash" @click="remove">
        {{ t("editor.delete") }}
      </BaseButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.note-editor {
  max-width: 760px;
  margin: 0 auto;
}

.sheet {
  @include glass;
  padding: 30px 32px 22px;
  border-radius: 24px;

  @include mobile {
    padding: 22px 18px 16px;
    border-radius: 20px;
  }
}

.eyebrow {
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
}

.title {
  width: 100%;
  padding: 4px 8px;
  margin: 0 -8px;
  border: none;
  border-radius: 10px;
  outline: none;
  background: transparent;
  font-size: clamp(26px, 4vw, 34px);
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.2;
  box-sizing: content-box;

  &::placeholder {
    color: var(--muted);
    opacity: 0.55;
  }
}

.progress-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin: 18px 0 16px;
}

.progress {
  flex: 1;
  min-width: 140px;
}

.count {
  min-width: 44px;
  font-size: 13px;
  font-weight: 800;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.todos {
  display: flex;
  flex-direction: column;
  gap: 2px;
  list-style: none;
}

.todo-enter-active {
  transition:
    opacity 0.35s,
    transform 0.4s var(--ease);
}

.todo-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

.todo-leave-active {
  overflow: hidden;
  transition:
    height 0.3s var(--ease),
    padding 0.3s var(--ease),
    opacity 0.25s,
    transform 0.3s var(--ease);
}

.todo-leave-to {
  height: 0 !important;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
  transform: translateX(24px);
}

.todo-move {
  transition: transform 0.45s var(--ease);
}

.shortcuts {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--muted);

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  @include mobile {
    display: none;
  }
}

.foot {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;

  @include mobile {
    flex-direction: column-reverse;
  }
}
</style>
