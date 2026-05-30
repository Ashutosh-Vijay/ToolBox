import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../Icon";
import { Btn } from "../ui/Btn";
import { CopyButton } from "../ui/CopyButton";
import { ErrorBanner } from "../ui/ErrorBanner";

/* A live analog clock, smoothly swept (sub-second) and synced to the system
   clock. Colours come from CSS vars so it adapts to light/dark themes. */
function AnalogClock({ size = 190 }: { size?: number }) {
  const [t, setT] = useState(() => new Date());
  const raf = useRef(0);
  useEffect(() => {
    const tick = () => {
      setT(new Date());
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.46;
  const ms = t.getMilliseconds();
  const s = t.getSeconds() + ms / 1000;
  const m = t.getMinutes() + s / 60;
  const h = (t.getHours() % 12) + m / 60;
  const hourA = h * 30;
  const minA = m * 6;
  const secA = s * 6;

  const ticks = Array.from({ length: 60 }).map((_, i) => {
    const ar = (i * 6 * Math.PI) / 180;
    const major = i % 5 === 0;
    const ro = r * 0.97;
    const ri = r * (major ? 0.84 : 0.91);
    return (
      <line
        key={i}
        x1={cx + Math.sin(ar) * ro}
        y1={cy - Math.cos(ar) * ro}
        x2={cx + Math.sin(ar) * ri}
        y2={cy - Math.cos(ar) * ri}
        stroke={major ? "var(--text-1)" : "var(--text-3)"}
        strokeWidth={major ? 1.6 : 1}
        strokeLinecap="round"
      />
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="analog-clock">
      <defs>
        <radialGradient id="clk-face" cx="50%" cy="38%">
          <stop offset="0%" stopColor="var(--bg-3)" />
          <stop offset="100%" stopColor="var(--bg-2)" />
        </radialGradient>
        <filter id="clk-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="url(#clk-face)" stroke="var(--border-strong)" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--accent-soft)" strokeWidth="1" />
      {ticks}
      {/* hour hand */}
      <line x1={cx} y1={cy + r * 0.06} x2={cx} y2={cy - r * 0.5} stroke="var(--text-0)" strokeWidth="4" strokeLinecap="round" transform={`rotate(${hourA} ${cx} ${cy})`} />
      {/* minute hand */}
      <line x1={cx} y1={cy + r * 0.08} x2={cx} y2={cy - r * 0.74} stroke="var(--text-0)" strokeWidth="2.6" strokeLinecap="round" transform={`rotate(${minA} ${cx} ${cy})`} />
      {/* second hand */}
      <g transform={`rotate(${secA} ${cx} ${cy})`}>
        <line x1={cx} y1={cy + r * 0.18} x2={cx} y2={cy - r * 0.82} stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round" filter="url(#clk-glow)" />
        <line x1={cx} y1={cy + r * 0.18} x2={cx} y2={cy - r * 0.82} stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx={cx} cy={cy - r * 0.82} r="2.6" fill="var(--accent)" />
      </g>
      <circle cx={cx} cy={cy} r="5.5" fill="var(--bg-1)" stroke="var(--accent)" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="1.6" fill="var(--accent)" />
    </svg>
  );
}

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

  const pad = (n: number) => String(n).padStart(2, "0");
  const localTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const localDate = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(now);
  const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="tool-fade">
      <div className="ws-toolbar">
        <span className="pill"><span className="pdot" style={{ background: "var(--accent)" }} />Live · synced to your system clock</span>
        <span className="spacer" />
        <CopyButton text={String(Math.floor(now.getTime() / 1000))} onDone="Copied epoch" />
        <span className="faint" style={{ fontSize: 12 }}>copy epoch</span>
      </div>

      <div className="clock-hero">
        <AnalogClock size={190} />
        <div className="clock-digital">
          <div className="cd-time mono">{localTime}</div>
          <div className="cd-date">{localDate}</div>
          <div className="cd-zone"><Icon name="globe" style={{ width: 13, height: 13 }} />{tzName} · local system time</div>
        </div>
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
