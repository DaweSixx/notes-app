<script setup lang="ts">
const { toasts } = useToast();
</script>

<template>
  <div class="toasts" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="toast in toasts" :key="toast.id" class="toast">
        <span class="toast-icon" :class="toast.tone">
          <BaseIcon :name="toast.tone === 'warn' ? 'alert' : 'check'" :size="14" :stroke-width="3" />
        </span>
        {{ toast.text }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style lang="scss" scoped>
.toasts {
  position: fixed;
  left: 50%;
  bottom: 24px;
  z-index: 120;
  width: max-content;
  max-width: calc(100vw - 32px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
  transform: translateX(-50%);
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px 12px 12px;
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  background: var(--glass-strong);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-lg);
  font-size: 14px;
  font-weight: 700;
}

.toast-icon {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 50%;
  color: #fff;

  &.success {
    background: var(--success);
  }

  &.warn {
    background: var(--warning);
  }
}

.toast-enter-active {
  transition:
    opacity 0.3s,
    transform 0.45s var(--spring);
}

.toast-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s var(--ease);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}
</style>
