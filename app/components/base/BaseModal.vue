<script setup lang="ts">
const props = defineProps<{ active: boolean }>();
const emit = defineEmits<{ dismiss: [] }>();

const dialog = ref<HTMLElement | null>(null);
const labelledBy = ref<string>();
const titleId = useId();
const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

const { focusInitial, handleTab } = useFocusTrap(dialog);

function onKeydown(event: KeyboardEvent) {
  if (!props.active) return;
  if (event.key === "Escape") {
    event.preventDefault();
    emit("dismiss");
  } else if (event.key === "Tab") {
    handleTab(event);
  }
}

// when the modal above closes, take focus back into this one
watch(
  () => props.active,
  (active) => {
    if (!active) return;
    nextTick(() => {
      if (!dialog.value?.contains(document.activeElement)) focusInitial();
    });
  },
);

onMounted(() => {
  const title = dialog.value?.querySelector<HTMLElement>("h1, h2, h3");
  if (title) {
    title.id ||= titleId;
    labelledBy.value = title.id;
  }
  document.addEventListener("keydown", onKeydown);
  if (props.active) focusInitial();
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
  if (returnFocus?.isConnected) returnFocus.focus();
});
</script>

<template>
  <div class="modal-root" :inert="!active">
    <div class="backdrop" @click="emit('dismiss')" />
    <div
      ref="dialog"
      class="dialog"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="labelledBy"
      tabindex="-1"
    >
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal-root {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 16px;
}

.backdrop {
  position: absolute;
  inset: 0;
  background: rgba(10, 11, 24, 0.45);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
}

.dialog {
  position: relative;
  width: min(420px, 100%);
  max-height: calc(100vh - 32px);
  overflow: auto;
  padding: 28px;
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  outline: none;
  background: var(--glass-strong);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  backdrop-filter: blur(24px) saturate(160%);
  box-shadow: var(--shadow-lg);

  @include mobile {
    padding: 22px;
  }
}

.modal-enter-active .backdrop,
.modal-leave-active .backdrop {
  transition: opacity 0.25s;
}

.modal-enter-active .dialog {
  transition:
    opacity 0.3s var(--ease),
    transform 0.4s var(--spring);
}

.modal-leave-active .dialog {
  transition:
    opacity 0.2s,
    transform 0.2s var(--ease);
}

.modal-enter-from .backdrop,
.modal-leave-to .backdrop {
  opacity: 0;
}

.modal-enter-from .dialog {
  opacity: 0;
  transform: translateY(14px) scale(0.95);
}

.modal-leave-to .dialog {
  opacity: 0;
  transform: translateY(8px) scale(0.97);
}
</style>
