// Generates a 1024x1024 PNG source icon for ToolBox: a teal rounded square
// with a white 2x2 grid glyph (matches the in-app brand mark). Pure Node, no deps.
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const S = 1024;
const buf = Buffer.alloc(S * S * 4);

function px(x, y, r, g, b, a) {
  const i = (y * S + x) * 4;
  buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = a;
}

// rounded-rect mask helper
function inRoundRect(x, y, x0, y0, x1, y1, rad) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const cx = Math.min(Math.max(x, x0 + rad), x1 - rad);
  const cy = Math.min(Math.max(y, y0 + rad), y1 - rad);
  const dx = x - cx, dy = y - cy;
  return dx * dx + dy * dy <= rad * rad;
}

const pad = 96;
const rad = 200;
for (let y = 0; y < S; y++) {
  for (let x = 0; x < S; x++) {
    if (inRoundRect(x, y, pad, pad, S - pad, S - pad, rad)) {
      // diagonal teal gradient: #2fe6d2 -> #1fc6b4
      const t = (x + y) / (2 * S);
      const r = Math.round(0x2f + (0x1f - 0x2f) * t);
      const g = Math.round(0xe6 + (0xc6 - 0xe6) * t);
      const b = Math.round(0xd2 + (0xb4 - 0xd2) * t);
      px(x, y, r, g, b, 255);
    } else {
      px(x, y, 0, 0, 0, 0);
    }
  }
}

// white 2x2 grid of rounded squares (the brand glyph)
const cell = 150, gap = 70, gr = 34;
const total = cell * 2 + gap;
const ox = Math.round((S - total) / 2);
const oy = Math.round((S - total) / 2);
for (const [gx, gy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
  const x0 = ox + gx * (cell + gap);
  const y0 = oy + gy * (cell + gap);
  for (let y = y0; y < y0 + cell; y++) {
    for (let x = x0; x < x0 + cell; x++) {
      if (inRoundRect(x, y, x0, y0, x0 + cell, y0 + cell, gr)) px(x, y, 4, 32, 29, 255);
    }
  }
}

// encode PNG (RGBA, 8-bit)
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])) >>> 0);
  return Buffer.concat([len, t, data, crc]);
}
function crc32(b) {
  let c = ~0;
  for (let i = 0; i < b.length; i++) {
    c ^= b[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c;
}
const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4);
ihdr[8] = 8; ihdr[9] = 6; // bit depth, RGBA
const raw = Buffer.alloc(S * (S * 4 + 1));
for (let y = 0; y < S; y++) {
  raw[y * (S * 4 + 1)] = 0;
  buf.copy(raw, y * (S * 4 + 1) + 1, y * S * 4, (y + 1) * S * 4);
}
const png = Buffer.concat([
  sig,
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);
writeFileSync(new URL("../app-icon.png", import.meta.url), png);
console.log("wrote app-icon.png", png.length, "bytes");
