<script setup lang="ts">
const { locale, locales, setLocale, t } = useI18n();

const activeIndex = computed(() =>
  Math.max(
    0,
    locales.value.findIndex((l) => l.code === locale.value),
  ),
);
</script>

<template>
  <div
    class="lang"
    role="group"
    :aria-label="t('lang.label')"
    :style="{ '--count': locales.length, '--index': activeIndex }"
  >
    <span class="indicator" aria-hidden="true" />
    <button
      v-for="l in locales"
      :key="l.code"
      type="button"
      class="option"
      :class="{ active: l.code === locale }"
      :aria-pressed="l.code === locale"
      :lang="l.language"
      :title="l.name"
      @click="setLocale(l.code)"
    >
      {{ l.code.toUpperCase() }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.lang {
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--count), 1fr);
  padding: 3px;
  border-radius: 999px;
  background: var(--hover);
}

.indicator {
  position: absolute;
  top: 3px;
  bottom: 3px;
  left: 3px;
  width: calc((100% - 6px) / var(--count));
  border-radius: 999px;
  background: var(--gradient);
  box-shadow: 0 4px 12px -4px rgba(139, 92, 246, 0.7);
  transform: translateX(calc(var(--index) * 100%));
  transition: transform 0.4s var(--spring);
}

.option {
  position: relative;
  min-width: 40px;
  height: 32px;
  padding: 0 10px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.04em;
  transition: color 0.3s;

  &.active {
    color: #fff;
  }

  &:not(.active) {
    @include hover {
      color: var(--text);
    }
  }
}
</style>
