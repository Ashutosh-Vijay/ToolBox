/* ============================================================
   Loaders — six self-contained splash animations, ported from the
   Claude Design "Loader" bundle. Each takes { accent, fg, size }.
   ============================================================ */
import { useEffect, useRef, useState } from "react";

export type LoaderProps = { accent: string; fg: string; size?: number };

/* 1. ORBITAL */
export function OrbitalLoader({ accent, fg, size = 360 }: LoaderProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radii = [size * 0.42, size * 0.3, size * 0.18];
  const speeds = [12, 7.5, 4.2];
  const phases = [0, 120, 240];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <filter id="orb-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="orb-bead">
          <stop offset="0%" stopColor={accent} stopOpacity="1" />
          <stop offset="60%" stopColor={accent} stopOpacity=".9" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r="1.5" fill={fg} opacity="0.35" />
      <line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy} stroke={fg} strokeOpacity="0.15" />
      <line x1={cx} y1={cy - 6} x2={cx} y2={cy + 6} stroke={fg} strokeOpacity="0.15" />
      {radii.map((r, i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={fg} strokeOpacity="0.08" strokeDasharray={i === 1 ? "1 4" : "none"} />
          {i === 0 && Array.from({ length: 12 }).map((_, t) => {
            const a = (t / 12) * Math.PI * 2 - Math.PI / 2;
            return (
              <line key={t} x1={cx + Math.cos(a) * (r - 6)} y1={cy + Math.sin(a) * (r - 6)} x2={cx + Math.cos(a) * (r + 6)} y2={cy + Math.sin(a) * (r + 6)} stroke={fg} strokeOpacity={t % 3 === 0 ? 0.35 : 0.12} />
            );
          })}
          <g style={{ transformOrigin: `${cx}px ${cy}px` }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={accent} strokeOpacity="0.18" strokeWidth="1.2" strokeDasharray={`${r * 0.8} ${r * 6}`} strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from={`${phases[i]} ${cx} ${cy}`} to={`${phases[i] + 360} ${cx} ${cy}`} dur={`${speeds[i]}s`} repeatCount="indefinite" />
            </circle>
          </g>
          <g style={{ transformOrigin: `${cx}px ${cy}px` }} filter="url(#orb-glow)">
            <circle cx={cx + r} cy={cy} r={i === 2 ? 5 : 3.5} fill="url(#orb-bead)">
              <animateTransform attributeName="transform" type="rotate" from={`${phases[i]} ${cx} ${cy}`} to={`${phases[i] + 360} ${cx} ${cy}`} dur={`${speeds[i]}s`} repeatCount="indefinite" />
            </circle>
          </g>
        </g>
      ))}
    </svg>
  );
}

/* 2. PENDULUM */
export function PendulumLoader({ accent, fg, size = 360 }: LoaderProps) {
  const cx = size / 2;
  const pivotY = size * 0.18;
  const armLen = size * 0.55;
  const ballR = size * 0.04;
  return (
    <>
      <style>{`@keyframes pend-swing{0%{transform:rotate(-32deg);animation-timing-function:cubic-bezier(.4,0,.6,1)}50%{transform:rotate(32deg);animation-timing-function:cubic-bezier(.4,0,.6,1)}100%{transform:rotate(-32deg)}}`}</style>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="pend-ball" cx="35%" cy="35%">
            <stop offset="0%" stopColor={accent} stopOpacity="1" />
            <stop offset="60%" stopColor={accent} stopOpacity="0.95" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.7" />
          </radialGradient>
          <linearGradient id="pend-arm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fg} stopOpacity="0.5" />
            <stop offset="100%" stopColor={fg} stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <line x1={cx - size * 0.32} y1={pivotY} x2={cx + size * 0.32} y2={pivotY} stroke={fg} strokeOpacity="0.25" strokeWidth="1" />
        <circle cx={cx} cy={pivotY} r="3" fill={fg} fillOpacity="0.35" />
        <circle cx={cx} cy={pivotY} r="6" fill="none" stroke={fg} strokeOpacity="0.15" />
        <path d={`M ${cx - armLen * 0.55} ${pivotY + armLen * 0.85} A ${armLen} ${armLen} 0 0 1 ${cx + armLen * 0.55} ${pivotY + armLen * 0.85}`} fill="none" stroke={fg} strokeOpacity="0.06" strokeDasharray="2 4" />
        <g style={{ transformOrigin: `${cx}px ${pivotY}px`, animation: "pend-swing 2.4s infinite" }}>
          <line x1={cx} y1={pivotY} x2={cx} y2={pivotY + armLen} stroke="url(#pend-arm)" strokeWidth="1.5" />
          <circle cx={cx} cy={pivotY} r="2.5" fill={accent} />
          <circle cx={cx} cy={pivotY + armLen} r={ballR} fill="url(#pend-ball)" />
          <circle cx={cx} cy={pivotY + armLen} r={ballR + 8} fill="none" stroke={accent} strokeOpacity="0.2" />
          <circle cx={cx} cy={pivotY + armLen} r={ballR + 16} fill="none" stroke={accent} strokeOpacity="0.08" />
        </g>
        {[-30, -15, 0, 15, 30].map((deg, i) => {
          const a = (deg * Math.PI) / 180 + Math.PI / 2;
          const r = armLen + 14;
          return <line key={i} x1={cx + Math.cos(a) * armLen} y1={pivotY + Math.sin(a) * armLen} x2={cx + Math.cos(a) * (r + 6)} y2={pivotY + Math.sin(a) * (r + 6)} stroke={fg} strokeOpacity={deg === 0 ? 0.35 : 0.12} strokeWidth="1" />;
        })}
      </svg>
    </>
  );
}

/* 3. RIBBON */
export function RibbonLoader({ accent, fg, size = 360 }: LoaderProps) {
  const cx = size / 2;
  const cy = size / 2;
  const buildPath = (phase: number) => {
    const pts: [number, number][] = [];
    const N = 200;
    const A = size * 0.34;
    const B = size * 0.2;
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * Math.PI * 2;
      pts.push([cx + A * Math.sin(2 * t + phase), cy + B * Math.sin(3 * t)]);
    }
    return "M " + pts.map((p) => p.join(" ")).join(" L ");
  };
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setPhase(((now - start) / 1000) * 0.6);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const path = buildPath(phase);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="ribbon-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={accent} stopOpacity="0" />
          <stop offset="50%" stopColor={accent} stopOpacity="1" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
        <filter id="ribbon-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>
      <path d={path} fill="none" stroke={accent} strokeOpacity="0.25" strokeWidth="14" filter="url(#ribbon-glow)" />
      <path d={path} fill="none" stroke={fg} strokeOpacity="0.08" strokeWidth="6" />
      <path d={path} fill="none" stroke="url(#ribbon-grad)" strokeWidth="2" strokeLinecap="round" strokeDasharray={`${size * 1.2} ${size * 4}`}>
        <animate attributeName="stroke-dashoffset" from={`${size * 4}`} to={`${-size * 1.2}`} dur="3.6s" repeatCount="indefinite" />
      </path>
      <path d={path} fill="none" stroke={accent} strokeOpacity="0.85" strokeWidth="1.2" />
    </svg>
  );
}

/* 4. RINGS */
export function RingsLoader({ accent, fg, size = 360 }: LoaderProps) {
  const cx = size / 2;
  const cy = size / 2;
  const rings = Array.from({ length: 7 }).map((_, i) => ({
    r: size * 0.1 + i * size * 0.045,
    sweep: 30 + i * 18,
    speed: 6 + i * 0.6,
    dir: i % 2 === 0 ? 1 : -1,
    phase: i * 22,
    width: 1 + i * 0.12,
    opacity: 0.95 - i * 0.07,
  }));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs><filter id="rings-glow"><feGaussianBlur stdDeviation="1.5" /></filter></defs>
      {rings.map((r, i) => <circle key={"g" + i} cx={cx} cy={cy} r={r.r} fill="none" stroke={fg} strokeOpacity="0.05" />)}
      <circle cx={cx} cy={cy} r="3" fill={accent} />
      <circle cx={cx} cy={cy} r="8" fill="none" stroke={accent} strokeOpacity="0.4">
        <animate attributeName="r" values="6;14;6" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.4;0;0.4" dur="2.4s" repeatCount="indefinite" />
      </circle>
      {rings.map((r, i) => {
        const C = 2 * Math.PI * r.r;
        const dash = (r.sweep / 360) * C;
        return (
          <g key={i} style={{ transformOrigin: `${cx}px ${cy}px` }}>
            <circle cx={cx} cy={cy} r={r.r} fill="none" stroke={accent} strokeOpacity={r.opacity} strokeWidth={r.width} strokeLinecap="round" strokeDasharray={`${dash} ${C - dash}`} filter={i < 3 ? "url(#rings-glow)" : undefined}>
              <animateTransform attributeName="transform" type="rotate" from={`${r.phase} ${cx} ${cy}`} to={`${r.phase + 360 * r.dir} ${cx} ${cy}`} dur={`${r.speed}s`} repeatCount="indefinite" />
            </circle>
          </g>
        );
      })}
    </svg>
  );
}

/* 5. PARTICLES (canvas) */
export function ParticlesLoader({ accent, size = 360 }: LoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    const cx = size / 2;
    const cy = size / 2;
    const particles = Array.from({ length: 140 }).map(() => ({
      r: (Math.random() * 0.35 + 0.1) * size,
      phase: Math.random() * Math.PI * 2,
      speed: (0.2 + Math.random() * 0.7) * (Math.random() < 0.4 ? -1 : 1),
      ecc: 0.4 + Math.random() * 0.6,
      tilt: Math.random() * Math.PI,
      size: Math.random() < 0.85 ? 0.8 + Math.random() * 0.8 : 1.6 + Math.random() * 0.8,
      bright: Math.random() < 0.15,
    }));
    let raf = 0;
    const start = performance.now();
    const draw = (now: number) => {
      const t = (now - start) / 1000;
      ctx.fillStyle = "rgba(10,12,16,0.18)";
      ctx.fillRect(0, 0, size, size);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.1);
      grad.addColorStop(0, accent + "33");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
      ctx.fill();
      for (const p of particles) {
        const a = p.phase + t * p.speed;
        const ex = Math.cos(a) * p.r;
        const ey = Math.sin(a) * p.r * p.ecc;
        const x = cx + Math.cos(p.tilt) * ex - Math.sin(p.tilt) * ey;
        const y = cy + Math.sin(p.tilt) * ex + Math.cos(p.tilt) * ey;
        ctx.fillStyle = p.bright ? accent : "rgba(233,238,246," + (0.55 + Math.random() * 0.3) + ")";
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [size, accent]);
  return <canvas ref={canvasRef} style={{ width: size, height: size, display: "block" }} />;
}

/* 6. GLYPH */
export function GlyphLoader({ accent, fg, size = 360 }: LoaderProps) {
  const cx = size / 2;
  const cy = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="glyph-sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={fg} stopOpacity="0" />
          <stop offset="40%" stopColor={fg} stopOpacity="1" />
          <stop offset="60%" stopColor={fg} stopOpacity="1" />
          <stop offset="100%" stopColor={fg} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="glyph-accent-sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={accent} stopOpacity="0" />
          <stop offset="50%" stopColor={accent} stopOpacity="1" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
        <mask id="glyph-mask">
          <rect width={size} height={size} fill="black" />
          <rect x="0" y="0" width={size * 0.6} height={size} fill="url(#glyph-sweep)">
            <animate attributeName="x" from={`${-size * 0.6}`} to={`${size}`} dur="2.6s" repeatCount="indefinite" />
          </rect>
        </mask>
        <mask id="glyph-mask-accent">
          <rect width={size} height={size} fill="black" />
          <rect x="0" y="0" width={size * 0.4} height={size} fill="url(#glyph-accent-sweep)">
            <animate attributeName="x" from={`${-size * 0.4}`} to={`${size}`} dur="2.6s" begin="-0.3s" repeatCount="indefinite" />
          </rect>
        </mask>
      </defs>
      <line x1={size * 0.18} y1={cy - size * 0.16} x2={size * 0.82} y2={cy - size * 0.16} stroke={fg} strokeOpacity="0.08" />
      <line x1={size * 0.18} y1={cy + size * 0.16} x2={size * 0.82} y2={cy + size * 0.16} stroke={fg} strokeOpacity="0.08" />
      <text x={cx} y={cy + size * 0.04} textAnchor="middle" fontFamily="Hanken Grotesk, serif" fontStyle="italic" fontSize={size * 0.2} fill={fg} fillOpacity="0.1">loading</text>
      <text x={cx} y={cy + size * 0.04} textAnchor="middle" fontFamily="Hanken Grotesk, serif" fontStyle="italic" fontSize={size * 0.2} fill={fg} mask="url(#glyph-mask)">loading</text>
      <text x={cx} y={cy + size * 0.04} textAnchor="middle" fontFamily="Hanken Grotesk, serif" fontStyle="italic" fontSize={size * 0.2} fill={accent} mask="url(#glyph-mask-accent)">loading</text>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={cx + size * 0.2 + i * 10} cy={cy + size * 0.05} r="2" fill={accent}>
          <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

export const LOADERS = [OrbitalLoader, RingsLoader, RibbonLoader, ParticlesLoader, PendulumLoader, GlyphLoader];
export const LOADER_LABELS = ["Aligning", "Tuning", "Drawing", "Gathering", "Measuring", "Reading"];
