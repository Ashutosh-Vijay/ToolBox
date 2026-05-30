/* ============================================================
   toolStore — active tool, pinned tools, theme, and UI state.
   Persisted with the Tauri store plugin when running inside the
   desktop app; falls back to localStorage for plain-browser dev.
   ============================================================ */
import { create } from "zustand";
import { load, type Store } from "@tauri-apps/plugin-store";
import { STORE_FILE } from "../constants";
import { toolById } from "../lib/tools";

export type Theme = "dark" | "light";

type Persisted = {
  theme: Theme;
  activeId: string | null;
  pinned: string[];
  recent: string[];
  collapsed: boolean;
};

const DEFAULTS: Persisted = {
  theme: "dark",
  activeId: null,
  pinned: ["base64", "jwt", "hash"],
  recent: ["base64", "jwt"],
  collapsed: false,
};

/* ---------- key/value persistence (Tauri store, or localStorage) ---------- */
const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
let tauriStore: Store | null = null;

async function kvInit() {
  if (isTauri && !tauriStore) tauriStore = await load(STORE_FILE, { defaults: {}, autoSave: 200 });
}
async function kvGet<T>(key: string, fallback: T): Promise<T> {
  try {
    if (isTauri && tauriStore) {
      const v = await tauriStore.get<T>(key);
      return v == null ? fallback : v;
    }
    const raw = localStorage.getItem("toolbox." + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}
async function kvSet<T>(key: string, value: T): Promise<void> {
  try {
    if (isTauri && tauriStore) await tauriStore.set(key, value);
    else localStorage.setItem("toolbox." + key, JSON.stringify(value));
  } catch {
    /* persistence is best-effort */
  }
}

type ToolState = Persisted & {
  paletteOpen: boolean;
  settingsOpen: boolean;
  aboutOpen: boolean;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  selectTool: (id: string) => void;
  togglePin: (id: string) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleCollapse: () => void;
  setPaletteOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setAboutOpen: (open: boolean) => void;
};

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export const useToolStore = create<ToolState>((set, get) => ({
  ...DEFAULTS,
  paletteOpen: false,
  settingsOpen: false,
  aboutOpen: false,
  hydrated: false,

  hydrate: async () => {
    await kvInit();
    const loaded: Persisted = {
      theme: await kvGet("theme", DEFAULTS.theme),
      activeId: await kvGet("active", DEFAULTS.activeId),
      pinned: await kvGet("pinned", DEFAULTS.pinned),
      recent: await kvGet("recent", DEFAULTS.recent),
      collapsed: await kvGet("collapsed", DEFAULTS.collapsed),
    };
    applyTheme(loaded.theme);
    set({ ...loaded, hydrated: true });
  },

  selectTool: (id) => {
    const t = toolById(id);
    if (!t) return;
    set({ activeId: id });
    kvSet("active", id);
    if (t.status === "live") {
      const recent = [id, ...get().recent.filter((x) => x !== id)].slice(0, 5);
      set({ recent });
      kvSet("recent", recent);
    }
  },

  togglePin: (id) => {
    const pinned = get().pinned.includes(id)
      ? get().pinned.filter((x) => x !== id)
      : [...get().pinned, id];
    set({ pinned });
    kvSet("pinned", pinned);
  },

  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
    kvSet("theme", theme);
  },

  toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),

  toggleCollapse: () => {
    const collapsed = !get().collapsed;
    set({ collapsed });
    kvSet("collapsed", collapsed);
  },

  setPaletteOpen: (open) => set({ paletteOpen: open }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setAboutOpen: (open) => set({ aboutOpen: open }),
}));
