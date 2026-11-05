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
    <svg class="icon moon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
    <svg class="icon sun" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
      />
    </svg>
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

.icon {
  position: absolute;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
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
