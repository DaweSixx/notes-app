<script setup lang="ts">
import ConfirmModal from "~/components/modals/ConfirmModal.vue";
import NoteCard from "~/components/notes/NoteCard.vue";
import { useNotesStore } from "~/stores/notes";
import type { Note } from "~/types/note";

const { locale, t } = useI18n();
const store = useNotesStore();
const modal = useModal();
const toast = useToast();
const draftKeys = useDraftKeys();

const today = computed(() =>
  new Intl.DateTimeFormat(locale.value, { weekday: "long", day: "numeric", month: "long" }).format(
    new Date(),
  ),
);

const stats = computed(() => {
  const todos = store.notes.flatMap((note) => note.todos);
  const done = todos.filter((todo) => todo.done).length;
  const notes = t("home.notesCount", store.notes.length);
  const tasks = t("home.tasksDone", { done, n: todos.length }, todos.length);
  return `${notes} · ${tasks}`;
});

// relative dates on the cards ("5 min ago") need a clock to stay fresh
const now = ref(Date.now());
let clock: ReturnType<typeof setInterval> | undefined;
onMounted(() => {
  draftKeys.refresh();
  clock = setInterval(() => (now.value = Date.now()), 60_000);
});
onBeforeUnmount(() => clearInterval(clock));

async function onDelete(note: Note) {
  const confirmed = await modal.open(ConfirmModal, {
    title: t("home.deleteTitle"),
    text: t("home.deleteText", { title: note.title || t("note.untitled") }),
    confirmText: t("common.delete"),
  });
  if (!confirmed) return;
  store.remove(note.id);
  draftKeys.remove(note.id);
  toast.show(t("home.deleted"));
}

// lift the leaving card out of the grid so the others can glide into its place
function onBeforeLeave(el: Element) {
  const node = el as HTMLElement;
  const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = node;
  Object.assign(node.style, {
    position: "absolute",
    left: `${offsetLeft}px`,
    top: `${offsetTop}px`,
    width: `${offsetWidth}px`,
    height: `${offsetHeight}px`,
  });
}
</script>

<template>
  <section>
    <div class="head">
      <div>
        <p class="eyebrow">{{ today }}</p>
        <h1 class="title">{{ t("home.title") }}</h1>
        <p v-if="store.notes.length" class="stats">{{ stats }}</p>
      </div>
      <BaseButton v-if="store.notes.length" to="/notes/new" icon="plus" class="create">
        {{ t("home.create") }}
      </BaseButton>
    </div>

    <Transition name="swap" mode="out-in">
      <TransitionGroup
        v-if="store.notes.length"
        tag="div"
        name="card"
        class="grid"
        @before-leave="onBeforeLeave"
      >
        <NoteCard
          v-for="(note, index) in store.sortedNotes"
          :key="note.id"
          :note="note"
          :index="index"
          :now="now"
          :has-draft="draftKeys.has(note.id)"
          @delete="onDelete(note)"
        />
        <NuxtLink key="new" to="/notes/new" class="new-card" :style="{ '--i': store.notes.length }">
          <span class="plus"><BaseIcon name="plus" :size="24" /></span>
          {{ t("home.create") }}
        </NuxtLink>
      </TransitionGroup>

      <div v-else class="empty">
        <div class="empty-art"><BaseIcon name="sparkle" :size="44" /></div>
        <h2 class="empty-title">{{ t("home.emptyTitle") }}</h2>
        <p class="empty-text">{{ t("home.emptyText") }}</p>
        <BaseButton to="/notes/new" icon="plus">{{ t("home.emptyCreate") }}</BaseButton>
      </div>
    </Transition>
  </section>
</template>

<style lang="scss" scoped>
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 32px;

  @include mobile {
    align-items: stretch;

    .create {
      width: 100%;
    }
  }
}

.eyebrow {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--primary-2);
}

.title {
  margin: 6px 0 8px;
  font-size: clamp(32px, 5vw, 44px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.stats {
  color: var(--muted);
  font-size: 15px;
  font-weight: 600;
}

.grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;

  @include mobile {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}

.card-move {
  transition: transform 0.45s var(--ease);
}

.card-leave-active {
  transition:
    opacity 0.35s var(--ease),
    transform 0.35s var(--ease);
}

.card-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.new-card {
  min-height: 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 2px dashed rgba(139, 92, 246, 0.35);
  border-radius: var(--radius);
  color: var(--primary-2);
  font-size: 15px;
  font-weight: 800;
  text-decoration: none;
  animation: fade-up 0.6s var(--ease) both;
  animation-delay: calc(var(--i) * 70ms);
  transition:
    background-color 0.3s,
    border-color 0.3s;

  @include hover {
    background: var(--hover);
    border-color: var(--primary-2);

    .plus {
      transform: rotate(90deg) scale(1.08);
    }
  }

  @include mobile {
    min-height: 140px;
  }
}

.plus {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--pink));
  color: #fff;
  box-shadow: 0 10px 24px -8px rgba(139, 92, 246, 0.7);
  transition: transform 0.5s var(--spring);
}

.empty {
  @include glass;
  padding: 64px 24px;
  border-radius: 28px;
  text-align: center;
}

.empty-art {
  width: 96px;
  height: 96px;
  display: grid;
  place-items: center;
  margin: 0 auto 20px;
  border-radius: 28px;
  background: var(--gradient);
  color: #fff;
  box-shadow: 0 20px 40px -14px rgba(139, 92, 246, 0.7);
  animation: bob 3s ease-in-out infinite;
}

.empty-title {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.empty-text {
  max-width: 380px;
  margin: 8px auto 24px;
  color: var(--muted);
}

.swap-enter-active,
.swap-leave-active {
  transition:
    opacity 0.3s var(--ease),
    transform 0.3s var(--ease);
}

.swap-enter-from,
.swap-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
}

@keyframes bob {
  50% {
    transform: translateY(-8px) rotate(-3deg);
  }
}
</style>
