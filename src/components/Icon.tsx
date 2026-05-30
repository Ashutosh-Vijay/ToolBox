/* ============================================================
   Icon — minimal monoline set. Stroke-based, inherits currentColor.
   ============================================================ */
import type { CSSProperties, ReactNode } from "react";

export const ICON_PATHS: Record<string, ReactNode> = {
  // chrome
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></>,
  command: <path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></>,
  sun: <><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M19.4 4.6l-1.8 1.8M6.4 17.6l-1.8 1.8" /></>,
  moon: <path d="M20 14.5A8 8 0 1 1 10 4a6.5 6.5 0 0 0 10 10.5z" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  chevDown: <path d="m6 9 6 6 6-6" />,
  chevRight: <path d="m9 6 6 6-6 6" />,
  chevLeft: <path d="m15 6-6 6 6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  star: <path d="m12 3 2.7 5.7 6.3.9-4.6 4.4 1.1 6.2-5.5-3-5.5 3 1.1-6.2L3 9.6l6.3-.9z" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  enter: <path d="M9 10l-4 4 4 4M5 14h10a4 4 0 0 0 4-4V6" />,
  // actions
  copy: <><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5 15V6a2 2 0 0 1 2-2h8" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  trash: <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />,
  swap: <path d="M7 4 3 8l4 4M3 8h13M17 20l4-4-4-4M21 16H8" />,
  download: <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />,
  upload: <path d="M12 21V9m0 0 4 4m-4-4-4 4M5 5h14" />,
  refresh: <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 4v4h-4M21 12a9 9 0 0 1-15.5 6.3L3 16M3 20v-4h4" />,
  file: <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5" />,
  fileDrop: <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M12 18v-6m0 0-2.2 2.2M12 12l2.2 2.2" />,
  eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>,
  alert: <><path d="M12 8v5M12 17h.01" /><path d="M10.3 3.9 2.3 18a2 2 0 0 0 1.7 3h16a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  lock: <><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" /></>,
  shield: <path d="M12 3 5 6v5c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6z" />,
  key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8M16 3l3 3-2.5 2.5L14 6" /></>,
  // tool category glyphs
  binary: <path d="M7 5h2v6H7zM7 11h2M14 5h3v6h-3a0 0 0 0 1 0 0V5zM8 14h2v5H8zM14 14h3v5h-3z" />,
  hash: <path d="M9 4 7 20M17 4l-2 16M5 9h15M4 15h15" />,
  braces: <path d="M8 4c-2 0-2 2-2 4s0 3-2 4c2 1 2 2 2 4s0 4 2 4M16 4c2 0 2 2 2 4s0 3 2 4c-2 1-2 2-2 4s0 4-2 4" />,
  link: <path d="M9.5 14.5 14.5 9.5M8 12l-2 2a3.5 3.5 0 0 0 5 5l2-2M16 12l2-2a3.5 3.5 0 0 0-5-5l-2 2" />,
  dice: <><rect x="4" y="4" width="16" height="16" rx="3.5" /><circle cx="9" cy="9" r="1.3" /><circle cx="15" cy="15" r="1.3" /><circle cx="15" cy="9" r="1.3" /><circle cx="9" cy="15" r="1.3" /></>,
  token: <><rect x="3" y="6" width="18" height="12" rx="3" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>,
  fingerprint: <path d="M12 5a7 7 0 0 0-7 7v2M12 5a7 7 0 0 1 7 7M9 12a3 3 0 0 1 6 0v4M12 12v5M15.5 16v1M8.5 14v2" />,
  type: <path d="M5 7V5h14v2M12 5v14M9 19h6" />,
  code: <path d="m8 7-5 5 5 5M16 7l5 5-5 5" />,
  qr: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M14 14h3v3M20 14v.01M14 20h3M20 17v3" /></>,
  password: <><rect x="3" y="9" width="18" height="11" rx="2.5" /><path d="M7 14v.01M12 14v.01M17 14v.01" /></>,
  text: <path d="M4 6h16M4 12h16M4 18h10" />,
  database: <><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.5 6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-6-3.5-9s1-6.5 3.5-9z" /></>,
  unlock: <><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" /><path d="M8 10.5V7a4 4 0 0 1 7.5-2" /></>,
  layers: <path d="m12 3 9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5" />,
  zap: <path d="M13 3 4 14h6l-1 7 9-11h-6z" />,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  pin: <path d="M9 4h6l-1 6 3 3v2h-4v5l-1 1-1-1v-5H6v-2l3-3z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  bolt: <path d="M13 3 4 14h6l-1 7 9-11h-6z" />,
  sparkle: <path d="M12 3v18M3 12h18M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  puzzle: <path d="M9 4a2 2 0 1 1 4 0h3v3a2 2 0 1 1 0 4v3h-3a2 2 0 1 0-4 0H6v-3a2 2 0 1 1 0-4V4z" />,
  diff: <path d="M12 4v6M9 7h6M5 17h6M5 20h6M16.5 13 21 17.5 16.5 22" />,
  regex: <path d="M12 6v8M8.5 8l7 4M15.5 8l-7 4M6 18h.01" />,
  palette: <><circle cx="12" cy="12" r="9" /><circle cx="8.5" cy="10" r="1.2" /><circle cx="12" cy="8" r="1.2" /><circle cx="15.5" cy="10" r="1.2" /><path d="M12 21a3 3 0 0 1 0-6 2 2 0 0 0 2-2 2 2 0 0 1 2-2" /></>,
};

export type IconName = keyof typeof ICON_PATHS;

export function Icon({
  name,
  className,
  style,
  strokeWidth = 1.8,
}: {
  name: string;
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
}) {
  const p = ICON_PATHS[name];
  if (!p) return null;
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {p}
    </svg>
  );
}
