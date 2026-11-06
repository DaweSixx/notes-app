<script setup lang="ts">
import AppNotFound from "~/components/app/AppNotFound.vue";
import NoteEditor from "~/components/notes/NoteEditor.vue";
import { useNotesStore } from "~/stores/notes";
import type { NoteInput } from "~/types/note";

definePageMeta({ key: "note-editor" });

interface EditorSession {
  noteId: string | null;
  initial: NoteInput;
  updatedAt: number | null;
}

const route = useRoute();
const router = useRouter();
const store = useNotesStore();
const { t } = useI18n();

const routeId = computed(() => String(route.params.id));
const editorKey = ref(routeId.value);
let createdId: string | null = null;

function resolve(id: string): EditorSession | null {
  if (id === "new") return { noteId: null, initial: { title: "", todos: [] }, updatedAt: null };
  const note = store.getById(id);
  if (!note) return null;
  return { noteId: note.id, initial: { title: note.title, todos: note.todos }, updatedAt: note.updatedAt };
}

const session = shallowRef(resolve(editorKey.value));

watch(routeId, (id) => {
  if (id === createdId) {
    createdId = null;
    return;
  }
  editorKey.value = id;
  session.value = resolve(id);
});

function onCreated(id: string) {
  createdId = id;
  router.replace(`/notes/${id}`);
}
</script>

<template>
  <NoteEditor
    v-if="session"
    :key="editorKey"
    :note-id="session.noteId"
    :initial="session.initial"
    :updated-at="session.updatedAt"
    @created="onCreated"
  />
  <AppNotFound v-else :title="t('notFound.noteTitle')" :text="t('notFound.noteText')" />
</template>
