<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <header class="header">
    <NuxtLink to="/" class="logo" :title="t('header.home')">
      <span class="logo-mark">
        <BaseIcon name="note" />
      </span>
      {{ t("app.name") }}
    </NuxtLink>

    <div class="actions">
      <AppLangSwitcher />
      <AppThemeToggle />
    </div>
  </header>
</template>

<style lang="scss" scoped>
.header {
  @include glass;
  position: sticky;
  top: 16px;
  z-index: 50;
  width: calc(100% - 32px);
  max-width: 1120px;
  margin: 16px auto 0;
  padding: 8px 8px 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 999px;

  @include mobile {
    top: 8px;
    width: calc(100% - 16px);
    margin-top: 8px;
  }
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-decoration: none;
  border-radius: 12px;

  @include hover {
    .logo-mark {
      transform: rotate(-8deg) scale(1.06);
    }
  }
}

.logo-mark {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: var(--gradient);
  color: #fff;
  box-shadow: 0 6px 16px -4px rgba(139, 92, 246, 0.6);
  transition: transform 0.5s var(--spring);
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
