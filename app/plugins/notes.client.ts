import { useNotesStore } from "~/stores/notes";
import { DRAFTS_KEY, pruneDrafts } from "~/utils/drafts";
import { STORAGE_KEY } from "~/utils/storage";

export default defineNuxtPlugin((nuxtApp) => {
  const store = useNotesStore(nuxtApp.$pinia);
  const draftKeys = useDraftKeys();
  const { recovered } = store.load(window.localStorage);

  // drafts of notes deleted while this tab was closed are no longer reachable
  try {
    pruneDrafts(window.localStorage, store.notes.map((note) => note.id));
  } catch {
    // best-effort cleanup
  }

  if (recovered) {
    // wait for mount: the toast host and i18n messages are ready only by then
    nuxtApp.hook("app:mounted", () => {
      useToast().show(nuxtApp.$i18n.t("storage.recovered"), "warn", 6000);
    });
  }

  // fires only for changes made in other tabs
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY || event.key === null) store.reloadFromStorage();
    if (event.key === DRAFTS_KEY || event.key === null) draftKeys.refresh();
  });
});
