<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";
import type { IconName } from "~/utils/icons";

withDefaults(
  defineProps<{
    variant?: "primary" | "ghost" | "plain" | "danger" | "danger-ghost";
    size?: "md" | "sm";
    icon?: IconName;
    to?: RouteLocationRaw;
    type?: "button" | "submit";
    disabled?: boolean;
  }>(),
  { variant: "primary", size: "md", icon: undefined, to: undefined, type: "button" },
);
</script>

<template>
  <NuxtLink v-if="to" :to="to" class="btn" :class="[variant, size]">
    <BaseIcon v-if="icon" :name="icon" />
    <slot />
  </NuxtLink>
  <button v-else :type="type" :disabled="disabled" class="btn" :class="[variant, size]">
    <BaseIcon v-if="icon" :name="icon" />
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: 14px;
  background: transparent;
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  text-decoration: none;
  user-select: none;
  transition:
    transform 0.25s var(--spring),
    box-shadow 0.3s,
    background-color 0.2s,
    background-position 0.6s var(--ease),
    color 0.2s,
    opacity 0.2s,
    filter 0.2s;

  &:active:not(:disabled) {
    transform: scale(0.96);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.sm {
  height: 38px;
  padding: 0 14px;
  border-radius: 12px;
  font-size: 14px;
}

.primary {
  color: #fff;
  background: var(--gradient);
  background-size: 200% 100%;
  box-shadow: 0 8px 20px -8px rgba(139, 92, 246, 0.75);

  &:not(:disabled) {
    @include hover {
      background-position: 100% 0;
      transform: translateY(-2px);
      box-shadow: 0 14px 28px -10px rgba(139, 92, 246, 0.85);
    }
  }
}

.ghost {
  background: var(--glass);
  border-color: var(--glass-border);

  &:not(:disabled) {
    @include hover {
      background: var(--glass-strong);
    }
  }
}

.plain:not(:disabled) {
  @include hover {
    background: var(--hover);
  }
}

.danger {
  color: #fff;
  background: var(--danger);
  box-shadow: 0 8px 20px -8px rgba(239, 68, 68, 0.7);

  &:not(:disabled) {
    @include hover {
      transform: translateY(-2px);
      filter: brightness(1.06);
    }
  }
}

.danger-ghost {
  color: var(--danger);

  &:not(:disabled) {
    @include hover {
      background: rgba(239, 68, 68, 0.1);
    }
  }
}
</style>
