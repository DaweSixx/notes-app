// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: ["@nuxt/eslint"],
    typescript: {
        strict: true,
        typeCheck: true,
    },
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
});
