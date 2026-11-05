<script setup lang="ts">
import type { IconName } from "~/utils/icons";

withDefaults(
  defineProps<{
    tone: "warn" | "danger";
    icon: IconName;
    title: string;
    text?: string;
  }>(),
  { text: undefined },
);
</script>

<template>
  <div class="notice" :class="tone" role="status">
    <span class="icon"><BaseIcon :name="icon" :size="20" /></span>
    <div class="body">
      <strong class="title">{{ title }}</strong>
      <span v-if="text" class="text">{{ text }}</span>
    </div>
    <div v-if="$slots.actions" class="actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.notice {
  @include glass;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
  padding: 14px 16px;
  border-radius: 18px;

  @include mobile {
    flex-wrap: wrap;
  }
}

.icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 11px;

  .warn & {
    background: rgba(245, 158, 11, 0.15);
    color: var(--warning);
  }

  .danger & {
    background: rgba(239, 68, 68, 0.12);
    color: var(--danger);
  }
}

.warn {
  border-color: rgba(245, 158, 11, 0.4);
}

.danger {
  border-color: rgba(239, 68, 68, 0.4);
}

.body {
  flex: 1;
  min-width: 0;
}

.title {
  display: block;
  font-size: 14.5px;
  font-weight: 800;
}

.text {
  font-size: 13px;
  color: var(--muted);
}

.actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;

  @include mobile {
    width: 100%;

    > :deep(*) {
      flex: 1;
    }
  }
}
</style>
