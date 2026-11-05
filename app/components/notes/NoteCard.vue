<script setup lang="ts">
import type { Note } from "~/types/note";
import { formatRelativeDate } from "~/utils/format-date";

const PREVIEW_SIZE = 3;

const props = defineProps<{
  note: Note;
  index: number;
  now: number;
  hasDraft: boolean;
}>();

const emit = defineEmits<{ delete: [] }>();

const { t, locale } = useI18n();

const link = computed(() => `/notes/${props.note.id}`);
const total = computed(() => props.note.todos.length);
const done = computed(() => props.note.todos.filter((todo) => todo.done).length);
const percent = computed(() => (total.value ? Math.round((done.value / total.value) * 100) : 0));
const complete = computed(() => total.value > 0 && done.value === total.value);
const preview = computed(() => props.note.todos.slice(0, PREVIEW_SIZE));

const updated = computed(() => formatRelativeDate(props.note.updatedAt, locale.value, props.now));

const card = ref<HTMLElement | null>(null);

function onPointerMove(event: PointerEvent) {
  const el = card.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
  el.style.setProperty("--my", `${event.clientY - rect.top}px`);
}
</script>

<template>
  <article ref="card" class="card" :style="{ '--i': index }" @pointermove="onPointerMove">
    <div class="top">
      <h3 class="title">
        <NuxtLink :to="link" class="link" :class="{ untitled: !note.title }">
          {{ note.title || t("note.untitled") }}
        </NuxtLink>
      </h3>
      <BaseBadge v-if="hasDraft" variant="draft" icon="history">{{ t("card.draft") }}</BaseBadge>
      <BaseBadge v-else-if="complete" variant="success" icon="check">{{ t("card.done") }}</BaseBadge>
    </div>

    <template v-if="total">
      <div>
        <BaseProgress
          :done="done"
          :total="total"
          :style="{ '--progress-delay': `${index * 70 + 250}ms` }"
        />
        <div class="meta">
          <span>{{ t("card.progress", { done, total }) }}</span>
          <span>{{ percent }}%</span>
        </div>
      </div>

      <ul class="preview">
        <li v-for="todo in preview" :key="todo.id" :class="{ done: todo.done }">
          <span class="mini-check">
            <BaseIcon v-if="todo.done" name="check" :size="11" :stroke-width="3.2" />
          </span>
          <span class="text" :class="{ placeholder: !todo.text }">
            {{ todo.text || t("card.emptyTodo") }}
          </span>
        </li>
      </ul>

      <p v-if="total > PREVIEW_SIZE" class="more">{{ t("card.more", { n: total - PREVIEW_SIZE }) }}</p>
    </template>
    <p v-else class="no-todos">{{ t("card.noTodos") }}</p>

    <footer class="foot">
      <span class="date">
        <BaseIcon name="clock" :size="14" />
        {{ updated }}
      </span>
      <div class="actions">
        <BaseIconButton
          icon="edit"
          class="raised"
          :label="t('card.edit')"
          :tip="t('card.edit')"
          @click="navigateTo(link)"
        />
        <BaseIconButton
          icon="trash"
          variant="danger"
          class="raised"
          :label="t('card.delete')"
          :tip="t('card.delete')"
          @click="emit('delete')"
        />
      </div>
    </footer>
  </article>
</template>

<style lang="scss" scoped>
.card {
  @include glass;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px;
  border-radius: var(--radius);
  animation: card-in 0.6s var(--ease) both;
  animation-delay: calc(var(--i) * 70ms);
  transition:
    transform 0.4s var(--ease),
    box-shadow 0.4s,
    border-color 0.3s,
    background-color 0.4s;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(
      420px circle at var(--mx, 50%) var(--my, 50%),
      rgba(139, 92, 246, 0.16),
      transparent 40%
    );
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
  }

  @include hover {
    transform: translateY(-6px);
    border-color: rgba(139, 92, 246, 0.35);
    box-shadow: var(--shadow-lg);

    &::before {
      opacity: 1;
    }

    .actions {
      opacity: 1;
      transform: none;
    }
  }

  &:has(.link:focus-visible) {
    outline: 2px solid var(--primary-2);
    outline-offset: 3px;
  }

  &:focus-within .actions {
    opacity: 1;
    transform: none;
  }
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.title {
  min-width: 0;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.015em;
  line-height: 1.3;
}

.link {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-decoration: none;
  outline: none;

  // stretched link: the whole card is clickable, buttons stay on top via .raised
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    border-radius: inherit;
  }

  &.untitled {
    color: var(--muted);
    font-weight: 700;
  }
}

.raised {
  z-index: 2;
}

.meta {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.preview {
  display: flex;
  flex-direction: column;
  gap: 9px;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    font-size: 14.5px;
    font-weight: 500;
  }

  .text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .done .text {
    color: var(--muted);
    text-decoration: line-through;
  }

  .placeholder {
    color: var(--muted);
  }
}

.mini-check {
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border: 1.5px solid var(--check-border);
  border-radius: 6px;
  color: #fff;

  .done & {
    border-color: var(--success);
    background: var(--success);
  }
}

.more {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary-2);
}

.no-todos {
  font-size: 14px;
  color: var(--muted);
}

.foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--line);
}

.date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
}

.actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transform: translateY(4px);
  transition:
    opacity 0.25s,
    transform 0.3s var(--ease);

  @media (hover: none) {
    opacity: 1;
    transform: none;
  }
}
</style>
