import { Icon } from "../Icon";
import { Btn } from "../ui/Btn";
import { TOOLS, LIVE_COUNT } from "../../lib/tools";
import { useToolStore } from "../../store/toolStore";

export function EmptyState() {
  const selectTool = useToolStore((s) => s.selectTool);
  const setPaletteOpen = useToolStore((s) => s.setPaletteOpen);
  const quick = TOOLS.filter((t) => t.status === "live");

  return (
    <div className="empty-state">
      <div className="es-art">
        <Icon name="grid" strokeWidth={1.6} />
      </div>
      <div className="es-title">Pick a tool to get started</div>
      <div className="es-sub">
        {LIVE_COUNT} tools ready, more on the way. Everything runs locally — your data never leaves this
        machine. Press{" "}
        <span className="kbd" style={{ verticalAlign: "middle" }}>
          ⌘K
        </span>{" "}
        to jump anywhere.
      </div>
      <div className="es-actions">
        <Btn variant="primary" icon="command" onClick={() => setPaletteOpen(true)}>
          Open command palette
        </Btn>
      </div>
      <div className="es-chips">
        {quick.map((t) => (
          <button key={t.id} className="es-chip" onClick={() => selectTool(t.id)}>
            <Icon name={t.icon} />
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
}
