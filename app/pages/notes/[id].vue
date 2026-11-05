<script setup lang="ts">
import NoteEditor from "~/components/notes/NoteEditor.vue";
import NoteNotFound from "~/components/notes/NoteNotFound.vue";
import { useNotesStore } from "~/stores/notes";
import type { NoteInput } from "~/types/note";

// one page instance for all notes: switching between them is handled by the editor key below
definePageMeta({ key: "note-editor" });

interface EditorSession {
  noteId: string | null;
  initial: NoteInput;
  updatedAt: number | null;
}

const route = useRoute();
const router = useRouter();
const store = useNotesStore();

const routeId = computed(() => String(route.params.id));
const editorKey = ref(routeId.value);
let createdId: string | null = null;

function resolve(id: string): EditorSession | null {
  if (id === "new") return { noteId: null, initial: { title: "", todos: [] }, updatedAt: null };
  const note = store.getById(id);
  if (!note) return null;
  return { noteId: note.id, initial: { title: note.title, todos: note.todos }, updatedAt: note.updatedAt };
}

// snapshot on open: the editor works on its own copy from here on
const session = shallowRef(resolve(editorKey.value));

watch(routeId, (id) => {
  // the URL of a just-created note changes from /notes/new — keep the same editor
  if (id === createdId) return;
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
  <NoteNotFound v-else />
</template>
