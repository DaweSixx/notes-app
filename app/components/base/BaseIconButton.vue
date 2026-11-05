<script setup lang="ts">
import type { IconName } from "~/utils/icons";

withDefaults(
  defineProps<{
    icon: IconName;
    label: string;
    tip?: string;
    variant?: "default" | "danger";
    disabled?: boolean;
  }>(),
  { tip: undefined, variant: "default" },
);
</script>

<template>
  <button
    type="button"
    class="icon-btn"
    :class="{ danger: variant === 'danger' }"
    :aria-label="label"
    :data-tip="tip"
    :disabled="disabled"
  >
    <BaseIcon :name="icon" />
  </button>
</template>

<style lang="scss" scoped>
.icon-btn {
  position: relative;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: var(--muted);
  transition:
    background-color 0.2s,
    color 0.2s,
    transform 0.25s var(--spring),
    opacity 0.2s;

  &:not(:disabled) {
    @include hover {
      background: var(--hover);
      color: var(--text);
    }

    &:active {
      transform: scale(0.9);
    }
  }

  &.danger:not(:disabled) {
    @include hover {
      background: rgba(239, 68, 68, 0.1);
      color: var(--danger);
    }
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}

[data-tip]::after {
  content: attr(data-tip);
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  z-index: 10;
  padding: 6px 9px;
  border-radius: 8px;
  background: var(--tip-bg);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transform: translateX(-50%) translateY(-4px) scale(0.95);
  transition:
    opacity 0.2s,
    transform 0.25s var(--ease);

  @media (hover: none) {
    display: none;
  }
}

[data-tip]:hover::after,
[data-tip]:focus-visible::after {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
}
</style>
