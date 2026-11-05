export type Theme = "light" | "dark";

const STORAGE_KEY = "notes-theme";

export function useTheme() {
  const theme = useState<Theme>("theme", () =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );

  function setTheme(value: Theme) {
    theme.value = value;
    document.documentElement.dataset.theme = value;
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // storage can be unavailable (private mode, quota) — the theme still applies for the session
    }
  }

  function toggleTheme() {
    setTheme(theme.value === "dark" ? "light" : "dark");
  }

  return { theme: readonly(theme), toggleTheme };
}
