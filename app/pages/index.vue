<script setup lang="ts">
const { locale, t } = useI18n();

const today = computed(() =>
  new Intl.DateTimeFormat(locale.value, { weekday: "long", day: "numeric", month: "long" }).format(
    new Date(),
  ),
);
</script>

<template>
  <section>
    <p class="eyebrow">{{ today }}</p>
    <h1 class="title">{{ t("home.title") }}</h1>
  </section>
</template>

<style lang="scss" scoped>
.eyebrow {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--primary-2);
}

.title {
  margin: 6px 0 8px;
  font-size: clamp(32px, 5vw, 44px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
}
</style>
