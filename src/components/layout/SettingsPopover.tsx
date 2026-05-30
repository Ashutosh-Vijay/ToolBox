import { useEffect, useRef, useState } from "react";
import { Icon } from "../Icon";
import { Seg } from "../ui/Seg";
import { toast } from "../ui/toast";
import { useToolStore } from "../../store/toolStore";

export function SettingsPopover() {
  const theme = useToolStore((s) => s.theme);
  const setTheme = useToolStore((s) => s.setTheme);
  const setSettingsOpen = useToolStore((s) => s.setSettingsOpen);
  const ref = useRef<HTMLDivElement>(null);

  // Visual-only preferences that mirror the design's settings panel.
  const [wrap, setWrap] = useState(true);
  const [autorun, setAutorun] = useState(true);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setSettingsOpen(false);
    };
    const id = setTimeout(() => document.addEventListener("mousedown", h), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", h);
    };
  }, [setSettingsOpen]);

  return (
    <div className="popover" ref={ref}>
      <div className="popover-head">Appearance</div>
      <div className="po-row" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{ cursor: "pointer" }}>
        <Icon name={theme === "dark" ? "moon" : "sun"} className="po-ico" />
        <div className="po-text">
          <div className="po-title">Theme</div>
          <div className="po-sub">{theme === "dark" ? "Dark" : "Light"} mode</div>
        </div>
        <Seg
          value={theme}
          onChange={(v) => setTheme(v as "dark" | "light")}
          options={[
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
          ]}
        />
      </div>

      <div className="po-div" />
      <div className="popover-head">Behavior</div>
      <div className="po-row" onClick={() => setAutorun((v) => !v)} style={{ cursor: "pointer" }}>
        <Icon name="bolt" className="po-ico" />
        <div className="po-text">
          <div className="po-title">Live processing</div>
          <div className="po-sub">Update output as you type</div>
        </div>
        <div className={"switch" + (autorun ? " on" : "")} />
      </div>
      <div className="po-row" onClick={() => setWrap((v) => !v)} style={{ cursor: "pointer" }}>
        <Icon name="text" className="po-ico" />
        <div className="po-text">
          <div className="po-title">Wrap output</div>
          <div className="po-sub">Soft-wrap long lines</div>
        </div>
        <div className={"switch" + (wrap ? " on" : "")} />
      </div>

      <div className="po-div" />
      <div className="po-row" style={{ cursor: "pointer" }} onClick={() => toast("All data stays on this device", "info")}>
        <Icon name="shield" className="po-ico" />
        <div className="po-text">
          <div className="po-title">Privacy</div>
          <div className="po-sub">100% offline · no telemetry</div>
        </div>
      </div>
    </div>
  );
}
