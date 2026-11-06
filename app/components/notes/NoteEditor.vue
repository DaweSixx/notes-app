<script setup lang="ts">
import ConfirmModal from "~/components/modals/ConfirmModal.vue";
import NoteEditorToolbar from "~/components/notes/NoteEditorToolbar.vue";
import NoteTodoAdd from "~/components/notes/NoteTodoAdd.vue";
import NoteTodoItem from "~/components/notes/NoteTodoItem.vue";
import { useNotesStore } from "~/stores/notes";
import type { NoteInput } from "~/types/note";
import { NEW_NOTE_DRAFT } from "~/utils/drafts";
import { formatRelativeDate } from "~/utils/format-date";
import { isBlankNote, isBlankText, normalizeForSave } from "~/utils/note-rules";

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
const removedHere = ref(false);

const deletedElsewhere = computed(
  () => noteId.value !== null && !removedHere.value && !store.getById(noteId.value),
);
const blank = computed(() => isBlankNote(draft));
const canSave = computed(() => {
  const willCreate = noteId.value === null || deletedElsewhere.value;
  if (willCreate) return !blank.value;
  return isDirty.value;
});
const showTitleHint = computed(() => isBlankText(draft.title) && !blank.value);

const drafts = useDraft({
  key: () => noteId.value ?? NEW_NOTE_DRAFT,
  content: () => draft,
  isDirty,
  baseUpdatedAt: () => updatedAt.value,
});

const draftPrompt = useDraftPrompt({
  found: drafts.read(),
  saved: props.initial,
  savedUpdatedAt: props.updatedAt,
  content: () => draft,
  discard: () => drafts.discard(),
  restore: (content) => editor.restore(content),
});
const { pending: pendingDraft, isStale: draftIsStale } = draftPrompt;

const draftText = computed(() => {
  const found = pendingDraft.value;
  if (!found) return "";
  const date = formatRelativeDate(found.savedAt, locale.value);
  return draftIsStale.value ? t("draft.foundStale", { date }) : t("draft.foundText", { date });
});

function restoreDraft() {
  if (draftPrompt.restore()) toast.show(t("draft.restored"));
}

function declineDraft() {
  draftPrompt.decline();
}

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

const { focusTarget, focusAfter, focusTodoOrAdd } = useEditorFocus({
  title: titleInput,
  list,
  todos: () => draft.todos,
  focusAdd: () => addRow.value?.focus(),
});

function undo() {
  focusTarget(editor.undo());
}

function redo() {
  focusTarget(editor.redo());
}

function onRemove(id: string) {
  const index = draft.todos.findIndex((todo) => todo.id === id);
  const neighbour = draft.todos[index + 1] ?? draft.todos[index - 1];
  editor.removeTodo(id);
  nextTick(() => focusTodoOrAdd(neighbour?.id));
}

function save() {
  editor.commitText();
  if (!canSave.value) return;

  const { input, removedEmpty } = normalizeForSave(draft);
  const previousDraftKey = noteId.value ?? NEW_NOTE_DRAFT;

  let savedAt: number;
  try {
    const existing = noteId.value === null ? undefined : store.getById(noteId.value);
    if (existing) {
      savedAt = store.update(existing.id, input)?.updatedAt ?? Date.now();
    } else {
      const note = store.create(input);
      noteId.value = note.id;
      savedAt = note.updatedAt;
      emit("created", note.id);
    }
  } catch {
    toast.show(t("editor.saveFailed"), "warn");
    return;
  }

  if (previousDraftKey !== noteId.value) drafts.discard(previousDraftKey);
  editor.markSaved(input);
  updatedAt.value = savedAt;
  toast.show(removedEmpty ? t("editor.savedRemoved", { n: removedEmpty }, removedEmpty) : t("editor.saved"));
}

async function cancel() {
  editor.commitText();
  const confirmed = await modal.open(
    ConfirmModal,
    isDirty.value
      ? {
          title: t("editor.cancelTitle"),
          text: t("editor.cancelText"),
          confirmText: t("editor.cancelConfirm"),
          cancelText: t("editor.cancelKeep"),
          tone: "warn",
        }
      : {
          title: t("editor.closeTitle"),
          text: t("editor.closeText"),
          confirmText: t("editor.closeConfirm"),
          cancelText: t("editor.cancelKeep"),
          tone: "warn",
        },
  );
  if (!confirmed) return;
  draftPrompt.dismiss();
  editor.discardChanges();
  drafts.discard();
  await navigateTo("/");
}

async function remove() {
  const confirmed = await modal.open(ConfirmModal, {
    title: t("home.deleteTitle"),
    text: t("home.deleteText", { title: draft.title || t("note.untitled") }),
    confirmText: t("common.delete"),
  });
  if (!confirmed || noteId.value === null) return;
  removedHere.value = true;
  drafts.discard();
  store.remove(noteId.value);
  toast.show(t("home.deleted"));
  await navigateTo("/");
}

async function leaveDeleted() {
  drafts.discard();
  await navigateTo("/");
}

useEditorShortcuts({ undo, redo, save });

onMounted(() => {
  if (noteId.value === null) titleInput.value?.focus();
});

function lockHeight(el: Element) {
  const node = el as HTMLElement;
  node.style.height = `${node.offsetHeight}px`;
}
</script>

<template>
  <div class="note-editor">
    <NoteEditorToolbar
      :dirty="isDirty"
      :can-save="canSave"
      :can-undo="canUndo"
      :can-redo="canRedo"
      @undo="undo"
      @redo="redo"
      @save="save"
    />

    <Transition name="notice">
      <BaseNotice
        v-if="deletedElsewhere"
        key="deleted"
        tone="danger"
        icon="alert"
        :title="t('editor.deletedTitle')"
        :text="t('editor.deletedText')"
      >
        <template #actions>
          <BaseButton variant="plain" size="sm" @click="leaveDeleted">{{ t("editor.toList") }}</BaseButton>
          <BaseButton size="sm" :disabled="!canSave" @click="save">{{ t("editor.saveAsNew") }}</BaseButton>
        </template>
      </BaseNotice>
      <BaseNotice
        v-else-if="pendingDraft"
        key="draft"
        tone="warn"
        icon="history"
        :title="t('draft.found')"
        :text="draftText"
      >
        <template #actions>
          <BaseButton variant="plain" size="sm" @click="declineDraft">{{ t("draft.decline") }}</BaseButton>
          <BaseButton size="sm" @click="restoreDraft">{{ t("draft.restore") }}</BaseButton>
        </template>
      </BaseNotice>
    </Transition>

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
        @keydown.enter.prevent="focusAfter()"
      >
      <Transition name="hint">
        <p v-if="showTitleHint" class="hint">
          <BaseIcon name="alert" :size="14" />
          {{ t("editor.titleHint") }}
        </p>
      </Transition>

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
      <BaseButton
        v-if="noteId !== null && !deletedElsewhere"
        variant="danger-ghost"
        icon="trash"
        @click="remove"
      >
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

.hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--warning-text);
}

.hint-enter-active,
.hint-leave-active,
.notice-enter-active,
.notice-leave-active {
  transition:
    opacity 0.3s var(--ease),
    transform 0.3s var(--ease);
}

.hint-enter-from,
.hint-leave-to,
.notice-enter-from,
.notice-leave-to {
  opacity: 0;
  transform: translateY(-6px);
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
