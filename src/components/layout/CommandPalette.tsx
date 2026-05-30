import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../Icon";
import { toast } from "../ui/toast";
import { TOOLS, toolById, catById, type Tool } from "../../lib/tools";
import { useToolStore } from "../../store/toolStore";

export function CommandPalette() {
  const open = useToolStore((s) => s.paletteOpen);
  const recent = useToolStore((s) => s.recent);
  const setPaletteOpen = useToolStore((s) => s.setPaletteOpen);
  const selectTool = useToolStore((s) => s.selectTool);

  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) {
      const recentTools = recent.map((id) => toolById(id)).filter((t): t is Tool => !!t);
      const rest = TOOLS.filter((t) => !recent.includes(t.id));
      return { recent: recentTools, all: rest };
    }
    const scored = TOOLS.map((t) => {
      const hay = (t.name + " " + t.kw + " " + catById(t.cat).name).toLowerCase();
      const idx = hay.indexOf(q);
      const nameIdx = t.name.toLowerCase().indexOf(q);
      if (idx === -1) return null;
      return { t, score: nameIdx === 0 ? 0 : nameIdx > 0 ? 1 : 2 };
    })
      .filter((x): x is { t: Tool; score: number } => !!x)
      .sort((a, b) => a.score - b.score)
      .map((x) => x.t);
    return { recent: [], all: scored };
  }, [q, recent]);

  const flat = useMemo(() => [...results.recent, ...results.all], [results]);

  useEffect(() => {
    setSel(0);
  }, [query]);

  const close = () => setPaletteOpen(false);
  const choose = (t: Tool) => {
    if (t.status === "soon") {
      toast(`${t.name} is coming soon`, "info");
    } else {
      selectTool(t.id);
    }
    close();
  };

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSel((s) => Math.min(s + 1, flat.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSel((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (flat[sel]) choose(flat[sel]);
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, flat, sel]);

  useEffect(() => {
    const el = listRef.current?.querySelector(".cmdk-item.sel");
    el?.scrollIntoView?.({ block: "nearest" });
  }, [sel]);

  if (!open) return null;

  let runningIndex = -1;
  const renderItem = (t: Tool) => {
    runningIndex++;
    const i = runningIndex;
    const cat = catById(t.cat);
    return (
      <button
        key={t.id}
        className={"cmdk-item" + (i === sel ? " sel" : "")}
        onMouseEnter={() => setSel(i)}
        onClick={() => choose(t)}
      >
        <span className="ci-ico">
          <Icon name={t.icon} />
        </span>
        <span className="ci-text">
          <span className="ci-title">
            {t.name}
            {t.status === "soon" && <span className="sb-badge soon">soon</span>}
            {t.status === "live" && (
              <span className="pill accent" style={{ fontSize: 10, padding: "1px 7px" }}>
                <span className="pdot" />
                live
              </span>
            )}
          </span>
          <span className="ci-sub">{t.desc}</span>
        </span>
        <span className="ci-cat" style={{ color: i === sel ? cat.color : undefined }}>
          {cat.name}
        </span>
        <span className="ci-enter">
          <Icon name="enter" />
        </span>
      </button>
    );
  };

  return (
    <div
      className="cmdk-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="cmdk" role="dialog" aria-label="Command palette">
        <div className="cmdk-input-row">
          <Icon name="search" />
          <input
            ref={inputRef}
            className="cmdk-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a tool or run a command…"
            spellCheck={false}
          />
          <span className="kbd">esc</span>
        </div>
        <div className="cmdk-list" ref={listRef}>
          {flat.length === 0 && <div className="cmdk-empty">No matches for “{query}”</div>}
          {results.recent.length > 0 && <div className="cmdk-section">Recent</div>}
          {results.recent.map(renderItem)}
          {results.all.length > 0 && <div className="cmdk-section">{q ? "Results" : "All tools"}</div>}
          {results.all.map(renderItem)}
        </div>
        <div className="cmdk-foot">
          <span className="hint">
            <span className="kbd">↑</span>
            <span className="kbd">↓</span> navigate
          </span>
          <span className="hint">
            <span className="kbd">↵</span> open
          </span>
          <span className="hint">
            <span className="kbd">esc</span> close
          </span>
          <span style={{ marginLeft: "auto" }}>
            {flat.length} tool{flat.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
