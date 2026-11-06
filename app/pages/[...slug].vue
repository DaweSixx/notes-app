<script setup lang="ts">
import AppNotFound from "~/components/app/AppNotFound.vue";

const { t } = useI18n();
</script>

<template>
    <AppNotFound :title="t('notFound.pageTitle')" :text="t('notFound.pageText')" />
</template>
