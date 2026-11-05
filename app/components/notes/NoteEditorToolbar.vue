<script setup lang="ts">
defineProps<{
  dirty: boolean;
  canSave: boolean;
  canUndo: boolean;
  canRedo: boolean;
}>();

const emit = defineEmits<{ undo: []; redo: []; save: [] }>();
const { t } = useI18n();
</script>

<template>
  <div class="toolbar">
    <BaseButton to="/" variant="plain" size="sm" icon="arrowLeft">
      <span class="label">{{ t("editor.back") }}</span>
    </BaseButton>

    <div class="status" :class="{ dirty }" role="status">
      <span class="dot" aria-hidden="true" />
      <span class="label">{{ dirty ? t("editor.statusUnsaved") : t("editor.statusSaved") }}</span>
    </div>

    <div class="spacer" />

    <BaseIconButton
      icon="undo"
      :label="t('editor.undo')"
      :tip="t('editor.undoTip')"
      :disabled="!canUndo"
      @click="emit('undo')"
    />
    <BaseIconButton
      icon="redo"
      :label="t('editor.redo')"
      :tip="t('editor.redoTip')"
      :disabled="!canRedo"
      @click="emit('redo')"
    />
    <span class="divider" aria-hidden="true" />
    <BaseButton size="sm" icon="save" :disabled="!canSave" :title="t('editor.saveTip')" @click="emit('save')">
      <span class="label">{{ t("editor.save") }}</span>
    </BaseButton>
  </div>
</template>

<style lang="scss" scoped>
.toolbar {
  @include glass;
  position: sticky;
  top: 88px;
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  padding: 8px;
  border-radius: 18px;

  @include mobile {
    top: 72px;
  }
}

.spacer {
  flex: 1;
}

.divider {
  width: 1px;
  height: 24px;
  margin: 0 4px;
  background: var(--line);
}

.status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--muted);
}

.dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--success);
  transition: background-color 0.3s;

  .dirty & {
    background: var(--warning);
    animation: pulse 1.6s infinite;
  }
}

// on narrow screens the text is visually hidden but still read by screen readers
.label {
  @include mobile {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.5);
  }
  100% {
    box-shadow: 0 0 0 8px rgba(245, 158, 11, 0);
  }
}
</style>
