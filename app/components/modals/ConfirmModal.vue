<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    text?: string;
    confirmText: string;
    cancelText?: string;
    tone?: "danger" | "warn";
  }>(),
  { text: undefined, cancelText: undefined, tone: "danger" },
);

const emit = defineEmits<{ resolve: [value: boolean] }>();
const { t } = useI18n();
</script>

<template>
  <div class="confirm">
    <div class="badge-icon" :class="tone">
      <BaseIcon :name="tone === 'danger' ? 'trash' : 'alert'" :size="22" />
    </div>
    <h2 class="title">{{ title }}</h2>
    <p v-if="text" class="text">{{ text }}</p>
    <div class="actions">
      <BaseButton variant="ghost" class="action" data-autofocus @click="emit('resolve', false)">
        {{ cancelText ?? t("common.cancel") }}
      </BaseButton>
      <BaseButton
        :variant="tone === 'danger' ? 'danger' : 'primary'"
        class="action"
        @click="emit('resolve', true)"
      >
        {{ confirmText }}
      </BaseButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.badge-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  margin-bottom: 16px;
  border-radius: 14px;

  &.danger {
    background: rgba(239, 68, 68, 0.12);
    color: var(--danger);
  }

  &.warn {
    background: rgba(245, 158, 11, 0.15);
    color: var(--warning);
  }
}

.title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.015em;
  line-height: 1.3;
}

.text {
  margin-top: 8px;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.55;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;

  @include mobile {
    flex-direction: column-reverse;

    .action {
      width: 100%;
    }
  }
}
</style>
