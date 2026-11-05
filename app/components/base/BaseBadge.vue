<script setup lang="ts">
import type { IconName } from "~/utils/icons";

withDefaults(
  defineProps<{
    variant: "success" | "draft";
    icon?: IconName;
  }>(),
  { icon: undefined },
);
</script>

<template>
  <span class="badge" :class="variant">
    <BaseIcon v-if="icon" :name="icon" :size="12" :stroke-width="2.6" />
    <slot />
  </span>
</template>

<style lang="scss" scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.success {
  background: rgba(16, 185, 129, 0.14);
  color: var(--success-text);
}

.draft {
  background: rgba(245, 158, 11, 0.15);
  color: var(--warning-text);
}
</style>
