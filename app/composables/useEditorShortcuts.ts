interface EditorShortcutHandlers {
  undo: () => void;
  redo: () => void;
  save: () => void;
}

function isKey(event: KeyboardEvent, letter: "z" | "s"): boolean {
  const key = event.key.toLowerCase();
  if (/^[a-z]$/.test(key)) return key === letter;
  return event.code === `Key${letter.toUpperCase()}`;
}

export function useEditorShortcuts(handlers: EditorShortcutHandlers) {
  const { hasOpen } = useModal();

  function onKeydown(event: KeyboardEvent) {
    if (hasOpen.value || event.altKey || !(event.ctrlKey || event.metaKey)) return;

    if (isKey(event, "z")) {
      if (event.target instanceof Element && event.target.closest("[data-native-undo]")) return;
      event.preventDefault();
      if (event.shiftKey) handlers.redo();
      else handlers.undo();
    } else if (isKey(event, "s") && !event.shiftKey) {
      event.preventDefault();
      handlers.save();
    }
  }

  onMounted(() => document.addEventListener("keydown", onKeydown));
  onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown));
}
