<script setup lang="ts">
const emit = defineEmits<{ add: [text: string] }>();

const { t } = useI18n();
const input = ref<HTMLInputElement | null>(null);
const text = ref("");
const shake = ref(false);

function submit() {
  const value = text.value.trim();
  if (!value) {
    shake.value = true;
    return;
  }
  emit("add", value);
  text.value = "";
}

defineExpose({ focus: () => input.value?.focus() });
</script>

<template>
  <form class="add" :class="{ shake }" data-native-undo @submit.prevent="submit" @animationend="shake = false">
    <span class="icon"><BaseIcon name="plus" :size="20" /></span>
    <input
      ref="input"
      v-model="text"
      class="input"
      :placeholder="t('editor.addPlaceholder')"
      :aria-label="t('editor.addLabel')"
      autocomplete="off"
      enterkeyhint="done"
    />
    <kbd>Enter</kbd>
  </form>
</template>

<style lang="scss" scoped>
.add {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  padding: 4px 12px;
  border: 1.5px dashed rgba(139, 92, 246, 0.35);
  border-radius: 14px;
  transition:
    border-color 0.2s,
    background-color 0.2s;

  &:focus-within {
    border-style: solid;
    border-color: var(--primary-2);
    background: var(--input-bg);

    kbd {
      opacity: 1;
    }
  }

  &.shake {
    animation: shake 0.4s;
  }
}

.icon {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: var(--primary-2);
}

.input {
  flex: 1;
  min-width: 0;
  padding: 9px 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15.5px;
  font-weight: 500;

  &::placeholder {
    color: var(--muted);
    opacity: 0.7;
  }
}

kbd {
  opacity: 0;
  transition: opacity 0.2s;

  @include mobile {
    display: none;
  }
}

@keyframes shake {
  20%,
  60% {
    transform: translateX(-6px);
  }
  40%,
  80% {
    transform: translateX(6px);
  }
}
</style>
