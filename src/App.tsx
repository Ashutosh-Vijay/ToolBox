import { useEffect, useRef, useState } from "react";
import { Icon } from "./components/Icon";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SplashLoader } from "./components/SplashLoader";
import { AboutModal } from "./components/AboutModal";
import { Updater } from "./components/Updater";
import { requestUpdateCheck } from "./lib/updater";
import { TopBar } from "./components/layout/TopBar";
import { Sidebar } from "./components/layout/Sidebar";
import { SettingsPopover } from "./components/layout/SettingsPopover";
import { CommandPalette } from "./components/layout/CommandPalette";
import { EmptyState } from "./components/layout/EmptyState";
import { CategoryPill } from "./components/ui/CategoryPill";
import { ToastHost } from "./components/ui/ToastHost";
import { toolById, catById } from "./lib/tools";
import { useToolStore } from "./store/toolStore";

export default function App() {
  const activeId = useToolStore((s) => s.activeId);
  const collapsed = useToolStore((s) => s.collapsed);
  const settingsOpen = useToolStore((s) => s.settingsOpen);
  const pinned = useToolStore((s) => s.pinned);
  const togglePin = useToolStore((s) => s.togglePin);
  const setPaletteOpen = useToolStore((s) => s.setPaletteOpen);
  const toggleCollapse = useToolStore((s) => s.toggleCollapse);
  const hydrate = useToolStore((s) => s.hydrate);
  const hydrated = useToolStore((s) => s.hydrated);
  const aboutOpen = useToolStore((s) => s.aboutOpen);
  const setAboutOpen = useToolStore((s) => s.setAboutOpen);

  // Boot: hydrate persisted state, then drop the splash. Keep the splash up for
  // a short minimum so it reads as a deliberate loader, not a flash.
  const [booting, setBooting] = useState(true);
  const [splashGone, setSplashGone] = useState(false);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => setBooting(false), 650); // min splash time after hydration
    return () => clearTimeout(t);
  }, [hydrated]);
  useEffect(() => {
    if (booting) return;
    const t = setTimeout(() => setSplashGone(true), 480); // matches fade-out
    return () => clearTimeout(t);
  }, [booting]);

  // Global shortcuts: ⌘K / Ctrl+K toggles the command palette, ⌘/ collapses.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(!useToolStore.getState().paletteOpen);
      } else if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        toggleCollapse();
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [setPaletteOpen, toggleCollapse]);

  // Active tool is always a live tool — SOON tools never navigate here.
  const tool = activeId ? toolById(activeId) : null;
  const cat = tool ? catById(tool.cat) : null;

  // Keep every visited tool mounted (hidden) so switching tabs doesn't reset
  // its input/output. We track the set of tool ids that have been opened.
  const visited = useRef<string[]>([]);
  if (tool && !visited.current.includes(tool.id)) visited.current = [...visited.current, tool.id];

  return (
    <div className={"app" + (collapsed ? " collapsed" : "")}>
      <TopBar />
      {settingsOpen && <SettingsPopover />}

      <Sidebar />

      <main className="main">
        {!tool && (
          <div className="ws-body" style={{ padding: 0 }}>
            <EmptyState />
          </div>
        )}

        {tool && cat && (
          <>
            <div className="ws-head">
              <div className="ws-title-ico" style={{ background: cat.color + "1f", color: cat.color }}>
                <Icon name={tool.icon} />
              </div>
              <div className="ws-head-text">
                <div className="ws-title">
                  {tool.name}
                  <CategoryPill catId={tool.cat} />
                </div>
                <div className="ws-sub">{tool.desc}</div>
              </div>
              <div className="ws-head-actions">
                <button
                  className={"icon-btn" + (pinned.includes(tool.id) ? " on" : "")}
                  onClick={() => togglePin(tool.id)}
                  title={pinned.includes(tool.id) ? "Unpin" : "Pin to top"}
                >
                  <Icon
                    name="star"
                    strokeWidth={pinned.includes(tool.id) ? 0 : 1.8}
                    style={pinned.includes(tool.id) ? { fill: "currentColor" } : {}}
                  />
                </button>
              </div>
            </div>
            <ErrorBoundary resetKey={tool.id}>
              <div className="ws-body">
                {visited.current.map((id) => {
                  const t = toolById(id);
                  const C = t?.component;
                  if (!C) return null;
                  return (
                    <div key={id} style={{ display: id === tool.id ? "block" : "none" }}>
                      <C />
                    </div>
                  );
                })}
              </div>
            </ErrorBoundary>
          </>
        )}
      </main>

      <CommandPalette />
      <ToastHost />
      <Updater />
      {aboutOpen && (
        <AboutModal
          onClose={() => setAboutOpen(false)}
          onCheckUpdate={() => {
            setAboutOpen(false);
            requestUpdateCheck(true);
          }}
        />
      )}
      {!splashGone && <SplashLoader leaving={!booting} />}
    </div>
  );
}
