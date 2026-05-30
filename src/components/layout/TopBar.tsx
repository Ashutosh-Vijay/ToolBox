import { Icon } from "../Icon";
import { useToolStore } from "../../store/toolStore";

export function TopBar() {
  const theme = useToolStore((s) => s.theme);
  const settingsOpen = useToolStore((s) => s.settingsOpen);
  const toggleTheme = useToolStore((s) => s.toggleTheme);
  const setPaletteOpen = useToolStore((s) => s.setPaletteOpen);
  const setSettingsOpen = useToolStore((s) => s.setSettingsOpen);
  const setAboutOpen = useToolStore((s) => s.setAboutOpen);

  return (
    <header className="topbar">
      <button className="topbar-brand" onClick={() => setAboutOpen(true)} title="About ToolBox" style={{ background: "none", border: "none", cursor: "pointer", paddingLeft: 2 }}>
        <span className="brand-mark">
          <Icon name="grid" strokeWidth={2.2} />
        </span>
        <span className="brand-name">
          Tool<b>Box</b>
        </span>
      </button>

      <button className="topbar-search" onClick={() => setPaletteOpen(true)}>
        <Icon name="search" />
        <span>Search tools &amp; run commands…</span>
        <span className="kbd">⌘K</span>
      </button>

      <div className="topbar-actions">
        <span className="offline-pill" title="Everything runs locally. Nothing leaves your machine.">
          <span className="od" />
          Offline
        </span>
        <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
          <Icon name={theme === "dark" ? "sun" : "moon"} />
        </button>
        <button
          className={"icon-btn" + (settingsOpen ? " on" : "")}
          onClick={() => setSettingsOpen(!settingsOpen)}
          title="Settings"
        >
          <Icon name="settings" />
        </button>
      </div>
    </header>
  );
}
