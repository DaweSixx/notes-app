<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <section class="not-found">
    <div class="code" aria-hidden="true">404</div>
    <h1 class="title">{{ t("notFound.title") }}</h1>
    <p class="text">{{ t("notFound.text") }}</p>
    <BaseButton to="/" icon="arrowLeft">{{ t("notFound.back") }}</BaseButton>
  </section>
</template>

<style lang="scss" scoped>
.not-found {
  @include glass;
  max-width: 520px;
  margin: 40px auto;
  padding: 56px 24px;
  border-radius: 28px;
  text-align: center;
}

.code {
  margin-bottom: 12px;
  font-size: 88px;
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 1;
  background: linear-gradient(135deg, var(--primary), var(--pink));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.title {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.text {
  max-width: 380px;
  margin: 8px auto 24px;
  color: var(--muted);
}
</style>
