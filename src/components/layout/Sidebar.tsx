import { useState } from "react";
import { Icon } from "../Icon";
import { toast } from "../ui/toast";
import { CATEGORIES, TOOLS, toolById, type Tool } from "../../lib/tools";
import { useToolStore } from "../../store/toolStore";

export function Sidebar() {
  const activeId = useToolStore((s) => s.activeId);
  const pinned = useToolStore((s) => s.pinned);
  const collapsed = useToolStore((s) => s.collapsed);
  const selectTool = useToolStore((s) => s.selectTool);
  const togglePin = useToolStore((s) => s.togglePin);
  const toggleCollapse = useToolStore((s) => s.toggleCollapse);

  const [query, setQuery] = useState("");
  const [closedCats, setClosedCats] = useState<Record<string, boolean>>({});
  const q = query.trim().toLowerCase();

  const matches = (t: Tool) => !q || (t.name + " " + t.kw).toLowerCase().includes(q);
  const pinnedTools = pinned.map((id) => toolById(id)).filter((t): t is Tool => !!t).filter(matches);
  const anyMatch = TOOLS.some(matches);

  const onItemClick = (t: Tool) => {
    if (t.status === "soon") {
      toast(`${t.name} is coming soon`, "info");
      return;
    }
    selectTool(t.id);
  };

  const renderItem = (t: Tool) => {
    const isPinned = pinned.includes(t.id);
    return (
      <button
        key={t.id}
        className={"sb-item" + (t.id === activeId ? " active" : "")}
        onClick={() => onItemClick(t)}
        title={t.name}
      >
        <Icon name={t.icon} className="ico" />
        <span className="label">{t.name}</span>
        {t.status === "soon" && <span className="sb-badge soon">soon</span>}
        <span
          className={"star" + (isPinned ? " pinned" : "")}
          onClick={(e) => {
            e.stopPropagation();
            togglePin(t.id);
          }}
          title={isPinned ? "Unpin" : "Pin to top"}
        >
          <Icon name="star" strokeWidth={isPinned ? 0 : 1.8} style={isPinned ? { fill: "currentColor" } : {}} />
        </span>
      </button>
    );
  };

  return (
    <aside className="sidebar">
      <button className="sb-collapse-btn" onClick={toggleCollapse} title="Collapse sidebar">
        <Icon name="chevLeft" />
      </button>

      {!collapsed && (
        <div className="sb-search">
          <div className="sb-search-box">
            <Icon name="search" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter tools…"
              spellCheck={false}
            />
            {query && (
              <button className="sb-search-clear" onClick={() => setQuery("")}>
                <Icon name="x" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="sb-scroll">
        {!anyMatch && <div className="sb-empty">No tools match “{query}”.</div>}

        {pinnedTools.length > 0 && (
          <div className="sb-group">
            {!collapsed && (
              <div className="sb-group-head" style={{ cursor: "default" }}>
                <Icon name="pin" className="chev" style={{ transform: "none", color: "var(--warning)" }} />
                <span className="gh-text">Pinned</span>
                <span className="count">{pinnedTools.length}</span>
              </div>
            )}
            <div className="sb-items">{pinnedTools.map(renderItem)}</div>
          </div>
        )}

        {CATEGORIES.map((cat) => {
          const tools = TOOLS.filter((t) => t.cat === cat.id && matches(t));
          if (!tools.length) return null;
          const closed = closedCats[cat.id];
          return (
            <div className="sb-group" key={cat.id}>
              <button
                className={"sb-group-head" + (closed ? " closed" : "")}
                onClick={() => setClosedCats((c) => ({ ...c, [cat.id]: !c[cat.id] }))}
              >
                {collapsed ? (
                  <span className="cat-dot" style={{ background: cat.color }} />
                ) : (
                  <>
                    <Icon name="chevDown" className="chev" />
                    <span className="gh-text">{cat.name}</span>
                    <span className="count">{tools.length}</span>
                  </>
                )}
              </button>
              {!closed && <div className="sb-items">{tools.map(renderItem)}</div>}
            </div>
          );
        })}
      </div>

      <div className="sb-foot">
        <button
          className="sb-add"
          onClick={() => toast("Plugin registry — drop in a new tool module", "info")}
        >
          <Icon name="puzzle" />
          {!collapsed && <span>Add a tool…</span>}
        </button>
      </div>
    </aside>
  );
}
