<script setup lang="ts">
import type { Todo } from "~/types/note";

const props = defineProps<{ todo: Todo }>();

const emit = defineEmits<{
  toggle: [];
  "update:text": [value: string];
  commit: [];
  remove: [];
  enter: [];
}>();

const { t } = useI18n();
const field = ref<HTMLTextAreaElement | null>(null);

function resize() {
  const el = field.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

function onInput(event: Event) {
  const el = event.target as HTMLTextAreaElement;
  // a task is a single line by meaning; pasted line breaks become spaces
  const value = el.value.replace(/[\r\n]+/g, " ");
  if (value !== el.value) el.value = value;
  emit("update:text", value);
  resize();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== "Enter" || event.isComposing) return;
  event.preventDefault();
  emit("enter");
}

watch(
  () => props.todo.text,
  () => nextTick(resize),
);

onMounted(() => {
  resize();
  window.addEventListener("resize", resize);
});

onBeforeUnmount(() => window.removeEventListener("resize", resize));
</script>

<template>
  <li class="todo" :class="{ done: todo.done }" :data-todo-id="todo.id">
    <BaseCheckbox :model-value="todo.done" :label="t('editor.toggleTodo')" @update:model-value="emit('toggle')" />
    <textarea
      ref="field"
      class="text"
      rows="1"
      :value="todo.text"
      :placeholder="t('editor.todoPlaceholder')"
      :aria-label="t('editor.todoText')"
      @input="onInput"
      @keydown="onKeydown"
      @blur="emit('commit')"
    />
    <BaseIconButton icon="trash" variant="danger" class="remove" :label="t('editor.removeTodo')" @click="emit('remove')" />
  </li>
</template>

<style lang="scss" scoped>
.todo {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 4px 6px 4px 12px;
  border-radius: 14px;
  transition: background-color 0.2s;

  &:focus-within {
    background: var(--hover);
  }

  @include hover {
    background: var(--hover);

    .remove {
      opacity: 1;
    }
  }

  :deep(.check) {
    margin-top: 9px;
  }
}

.text {
  flex: 1;
  min-width: 0;
  padding: 9px 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15.5px;
  font-weight: 500;
  line-height: 1.45;
  resize: none;
  overflow: hidden;
  transition: color 0.3s;

  &::placeholder {
    color: var(--muted);
    opacity: 0.7;
  }

  .done & {
    color: var(--muted);
    text-decoration: line-through;
  }
}

.remove {
  margin-top: 1px;
  opacity: 0;

  .todo:focus-within & {
    opacity: 1;
  }

  @media (hover: none) {
    opacity: 1;
  }
}
</style>
