import { useEffect, useMemo, useState } from "react";
import { Icon } from "../Icon";
import { Btn } from "../ui/Btn";
import { CopyButton } from "../ui/CopyButton";
import { ErrorBanner } from "../ui/ErrorBanner";

const ZONES: { label: string; sub: string; tz?: string; color: string }[] = [
  { label: "Local", sub: "your system clock", tz: undefined, color: "#2fe6d2" },
  { label: "UTC / GMT", sub: "Coordinated Universal Time", tz: "UTC", color: "#7fd8ff" },
  { label: "IST", sub: "Asia/Kolkata · UTC+5:30", tz: "Asia/Kolkata", color: "#46e08a" },
  { label: "US Eastern", sub: "America/New_York", tz: "America/New_York", color: "#a78bfa" },
  { label: "UK", sub: "Europe/London", tz: "Europe/London", color: "#ffc24b" },
  { label: "Tokyo", sub: "Asia/Tokyo", tz: "Asia/Tokyo", color: "#ff6b7a" },
];

function fmtZone(d: Date, tz?: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d);
}

function Rows({ d }: { d: Date }) {
  const epochS = Math.floor(d.getTime() / 1000);
  const extras: { label: string; sub: string; value: string; color: string }[] = [
    { label: "Epoch", sub: "Unix seconds", value: String(epochS), color: "#f6b96b" },
    { label: "Epoch ms", sub: "Unix milliseconds", value: String(d.getTime()), color: "#f6b96b" },
    { label: "ISO 8601", sub: "UTC", value: d.toISOString(), color: "#c7a0ff" },
    { label: "RFC", sub: "UTC string", value: d.toUTCString(), color: "#6b7a8d" },
  ];
  return (
    <div className="rows">
      {ZONES.map((z) => (
        <div className="result-row" key={z.label}>
          <span className="rr-bar" style={{ background: z.color }} />
          <span className="rr-tag">{z.label}<span className="sub">{z.sub}</span></span>
          <span className="rr-val">{fmtZone(d, z.tz)}</span>
          <span className="rr-acts"><CopyButton text={fmtZone(d, z.tz)} /></span>
        </div>
      ))}
      {extras.map((e) => (
        <div className="result-row" key={e.label}>
          <span className="rr-bar" style={{ background: e.color }} />
          <span className="rr-tag">{e.label}<span className="sub">{e.sub}</span></span>
          <span className="rr-val">{e.value}</span>
          <span className="rr-acts"><CopyButton text={e.value} /></span>
        </div>
      ))}
    </div>
  );
}

export function TimeTool() {
  const [now, setNow] = useState(() => new Date());
  const [input, setInput] = useState("");

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const parsed = useMemo<{ d: Date } | { err: string } | null>(() => {
    const v = input.trim();
    if (!v) return null;
    if (/^\d{1,10}$/.test(v)) return { d: new Date(parseInt(v, 10) * 1000) };
    if (/^\d{11,}$/.test(v)) return { d: new Date(parseInt(v, 10)) };
    const d = new Date(v);
    if (isNaN(d.getTime())) return { err: "Couldn't parse that — try a Unix epoch (10 or 13 digits) or a date like 2026-05-31T10:00:00Z" };
    return { d };
  }, [input]);

  return (
    <div className="tool-fade">
      <div className="ws-toolbar">
        <span className="pill"><span className="pdot" style={{ background: "var(--accent)" }} />Live · synced to your system clock</span>
        <span className="spacer" />
        <CopyButton text={String(Math.floor(now.getTime() / 1000))} onDone="Copied epoch" />
        <span className="faint" style={{ fontSize: 12 }}>copy epoch</span>
      </div>

      <div style={{ marginBottom: 22 }}>
        <Rows d={now} />
      </div>

      <div className="ws-toolbar" style={{ marginTop: 8 }}>
        <span className="pane-title" style={{ fontSize: 12 }}><Icon name="clock" style={{ width: 14, height: 14 }} />Convert a specific time</span>
        <span className="spacer" />
        <Btn icon="refresh" onClick={() => setInput(String(Math.floor(Date.now() / 1000)))}>Use now</Btn>
        <Btn icon="trash" variant="danger" onClick={() => setInput("")} disabled={!input}>Clear</Btn>
      </div>
      <div className="row" style={{ marginBottom: 14 }}>
        <input
          className="input mono grow"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a Unix epoch (1748560000 or 1748560000000) or a date string (2026-05-31T10:00:00Z)…"
          spellCheck={false}
        />
      </div>

      {parsed && "err" in parsed && <ErrorBanner title="Invalid time">{parsed.err}</ErrorBanner>}
      {parsed && "d" in parsed && <Rows d={parsed.d} />}
    </div>
  );
}
