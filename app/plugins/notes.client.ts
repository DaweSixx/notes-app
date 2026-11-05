import { useNotesStore } from "~/stores/notes";
import { STORAGE_KEY } from "~/utils/storage";

export default defineNuxtPlugin((nuxtApp) => {
  const store = useNotesStore(nuxtApp.$pinia);
  const { recovered } = store.load(window.localStorage);

  if (recovered) {
    // wait for mount: the toast host and i18n messages are ready only by then
    nuxtApp.hook("app:mounted", () => {
      useToast().show(nuxtApp.$i18n.t("storage.recovered"), "warn", 6000);
    });
  }

  // fires only for changes made in other tabs
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY || event.key === null) store.reloadFromStorage();
  });
});
