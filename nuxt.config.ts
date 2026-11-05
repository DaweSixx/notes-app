// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: ["@nuxt/eslint", "@pinia/nuxt", "@nuxtjs/i18n"],
    ssr: false,
    typescript: {
        strict: true,
        typeCheck: true,
    },
    css: ["~/assets/scss/main.scss"],
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: '@use "~/assets/scss/_mixins.scss" as *;\n',
                },
            },
        },
    },
    app: {
        pageTransition: { name: "page", mode: "out-in" },
        head: {
            link: [
                {
                    rel: "preload",
                    href: "/fonts/Nunito/Nunito-VariableFont_wght.ttf",
                    as: "font",
                    type: "font/ttf",
                    crossorigin: "anonymous",
                },
            ],
            script: [
                {
                    // sets the theme before Vue mounts, otherwise the page flashes light in dark mode
                    innerHTML:
                        "(function(){var t;try{t=localStorage.getItem('notes-theme')}catch(e){}" +
                        "if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}" +
                        "document.documentElement.dataset.theme=t})()",
                },
            ],
        },
    },
    i18n: {
        locales: [
            { code: "ru", language: "ru-RU", name: "Русский", file: "ru.json" },
            { code: "en", language: "en-US", name: "English", file: "en.json" },
        ],
        defaultLocale: "en",
        strategy: "no_prefix",
        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: "notes-locale",
            fallbackLocale: "en",
        },
    },
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
});
