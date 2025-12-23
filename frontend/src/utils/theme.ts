export type ThemePreference = "light" | "dark" | "auto";

const THEME_STORAGE_KEY = "pf-theme";
const THEME_COLORS = {
  light: "#f9f6f2",
  dark: "#141414ff",
} as const;
const THEME_TEXT_COLORS = {
  light: "#161412ff",
  dark: "#e5e7eb",
} as const;

const normalizeTheme = (value: string | null): ThemePreference => {
  if (value === "light" || value === "dark" || value === "auto") {
    return value;
  }
  return "auto";
};

const resolveTheme = (preference: ThemePreference): "light" | "dark" => {
  if (preference === "auto") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return preference;
};

export const getStoredTheme = (): ThemePreference =>
  normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));

export const setStoredTheme = (preference: ThemePreference) => {
  localStorage.setItem(THEME_STORAGE_KEY, preference);
};

export const applyTheme = (preference: ThemePreference) => {
  const resolved = resolveTheme(preference);
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
  root.style.backgroundColor = THEME_COLORS[resolved];
  root.style.color = THEME_TEXT_COLORS[resolved];

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute("content", THEME_COLORS[resolved]);
  }
};

export const initTheme = (): ThemePreference => {
  const preference = getStoredTheme();
  applyTheme(preference);
  return preference;
};

export const watchSystemTheme = () => {
  if (!window.matchMedia) {
    return () => undefined;
  }

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => {
    if (getStoredTheme() === "auto") {
      applyTheme("auto");
    }
  };

  if (media.addEventListener) {
    media.addEventListener("change", handler);
  } else {
    media.addListener(handler);
  }

  return () => {
    if (media.removeEventListener) {
      media.removeEventListener("change", handler);
    } else {
      media.removeListener(handler);
    }
  };
};
