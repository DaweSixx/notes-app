<script setup lang="ts">
const { locale, t } = useI18n();

useHead({
  htmlAttrs: { lang: locale },
  title: computed(() => t("app.name")),
});
</script>

<template>
  <NuxtRouteAnnouncer />
  <AppBackground />
  <AppHeader />
  <main class="main">
    <NuxtPage />
  </main>
  <AppModalHost />
  <AppToasts />
</template>

<style lang="scss" scoped>
.main {
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px 16px 140px;

  @include mobile {
    padding: 24px 12px 140px;
  }
}
</style>
