<script setup lang="ts">
const { theme, toggleTheme } = useTheme();
const { t } = useI18n();

const label = computed(() => (theme.value === "dark" ? t("theme.toLight") : t("theme.toDark")));
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :class="theme"
    :aria-label="label"
    :title="label"
    @click="toggleTheme"
  >
    <BaseIcon name="moon" :size="20" class="glyph moon" />
    <BaseIcon name="sun" :size="20" class="glyph sun" />
  </button>
</template>

<style lang="scss" scoped>
.theme-toggle {
  position: relative;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--muted);
  transition:
    background-color 0.2s,
    color 0.2s,
    transform 0.25s var(--spring);

  @include hover {
    background: var(--hover);
    color: var(--text);
  }

  &:active {
    transform: scale(0.9);
  }
}

.glyph {
  position: absolute;
  transition:
    transform 0.5s var(--spring),
    opacity 0.3s;
}

.light .sun,
.dark .moon {
  opacity: 0;
}

.light .sun {
  transform: rotate(-90deg) scale(0.4);
}

.dark .moon {
  transform: rotate(90deg) scale(0.4);
}
</style>
