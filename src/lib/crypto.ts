/* ============================================================
   crypto.ts — pure, offline encoding/hashing/parsing helpers.
   All client-side. No network. Ported from the design prototype.
   ============================================================ */

/* ---------- MD5 (compact, public-domain style impl) ---------- */
export function md5(str: string): string {
  const toUtf8 = (s: string) => unescape(encodeURIComponent(s));
  const rl = (n: number, c: number) => (n << c) | (n >>> (32 - c));
  const add = (x: number, y: number) => {
    const l = (x & 0xffff) + (y & 0xffff);
    return (((x >> 16) + (y >> 16) + (l >> 16)) << 16) | (l & 0xffff);
  };
  const cmn = (q: number, a: number, b: number, x: number, s: number, t: number) =>
    add(rl(add(add(a, q), add(x, t)), s), b);
  const ff = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn((b & c) | (~b & d), a, b, x, s, t);
  const gg = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn((b & d) | (c & ~d), a, b, x, s, t);
  const hh = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn(b ^ c ^ d, a, b, x, s, t);
  const ii = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn(c ^ (b | ~d), a, b, x, s, t);

  str = toUtf8(str);
  const n = str.length;
  const blks: number[] = [];
  for (let i = 0; i < n; i++) blks[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
  blks[n >> 2] |= 0x80 << ((n % 4) * 8);
  blks[(((n + 8) >> 6) + 1) * 16 - 2] = n * 8;
  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  for (let i = 0; i < blks.length; i += 16) {
    const oa = a, ob = b, oc = c, od = d;
    a = ff(a, b, c, d, blks[i + 0] || 0, 7, -680876936); d = ff(d, a, b, c, blks[i + 1] || 0, 12, -389564586);
    c = ff(c, d, a, b, blks[i + 2] || 0, 17, 606105819); b = ff(b, c, d, a, blks[i + 3] || 0, 22, -1044525330);
    a = ff(a, b, c, d, blks[i + 4] || 0, 7, -176418897); d = ff(d, a, b, c, blks[i + 5] || 0, 12, 1200080426);
    c = ff(c, d, a, b, blks[i + 6] || 0, 17, -1473231341); b = ff(b, c, d, a, blks[i + 7] || 0, 22, -45705983);
    a = ff(a, b, c, d, blks[i + 8] || 0, 7, 1770035416); d = ff(d, a, b, c, blks[i + 9] || 0, 12, -1958414417);
    c = ff(c, d, a, b, blks[i + 10] || 0, 17, -42063); b = ff(b, c, d, a, blks[i + 11] || 0, 22, -1990404162);
    a = ff(a, b, c, d, blks[i + 12] || 0, 7, 1804603682); d = ff(d, a, b, c, blks[i + 13] || 0, 12, -40341101);
    c = ff(c, d, a, b, blks[i + 14] || 0, 17, -1502002290); b = ff(b, c, d, a, blks[i + 15] || 0, 22, 1236535329);
    a = gg(a, b, c, d, blks[i + 1] || 0, 5, -165796510); d = gg(d, a, b, c, blks[i + 6] || 0, 9, -1069501632);
    c = gg(c, d, a, b, blks[i + 11] || 0, 14, 643717713); b = gg(b, c, d, a, blks[i + 0] || 0, 20, -373897302);
    a = gg(a, b, c, d, blks[i + 5] || 0, 5, -701558691); d = gg(d, a, b, c, blks[i + 10] || 0, 9, 38016083);
    c = gg(c, d, a, b, blks[i + 15] || 0, 14, -660478335); b = gg(b, c, d, a, blks[i + 4] || 0, 20, -405537848);
    a = gg(a, b, c, d, blks[i + 9] || 0, 5, 568446438); d = gg(d, a, b, c, blks[i + 14] || 0, 9, -1019803690);
    c = gg(c, d, a, b, blks[i + 3] || 0, 14, -187363961); b = gg(b, c, d, a, blks[i + 8] || 0, 20, 1163531501);
    a = gg(a, b, c, d, blks[i + 13] || 0, 5, -1444681467); d = gg(d, a, b, c, blks[i + 2] || 0, 9, -51403784);
    c = gg(c, d, a, b, blks[i + 7] || 0, 14, 1735328473); b = gg(b, c, d, a, blks[i + 12] || 0, 20, -1926607734);
    a = hh(a, b, c, d, blks[i + 5] || 0, 4, -378558); d = hh(d, a, b, c, blks[i + 8] || 0, 11, -2022574463);
    c = hh(c, d, a, b, blks[i + 11] || 0, 16, 1839030562); b = hh(b, c, d, a, blks[i + 14] || 0, 23, -35309556);
    a = hh(a, b, c, d, blks[i + 1] || 0, 4, -1530992060); d = hh(d, a, b, c, blks[i + 4] || 0, 11, 1272893353);
    c = hh(c, d, a, b, blks[i + 7] || 0, 16, -155497632); b = hh(b, c, d, a, blks[i + 10] || 0, 23, -1094730640);
    a = hh(a, b, c, d, blks[i + 13] || 0, 4, 681279174); d = hh(d, a, b, c, blks[i + 0] || 0, 11, -358537222);
    c = hh(c, d, a, b, blks[i + 3] || 0, 16, -722521979); b = hh(b, c, d, a, blks[i + 6] || 0, 23, 76029189);
    a = hh(a, b, c, d, blks[i + 9] || 0, 4, -640364487); d = hh(d, a, b, c, blks[i + 12] || 0, 11, -421815835);
    c = hh(c, d, a, b, blks[i + 15] || 0, 16, 530742520); b = hh(b, c, d, a, blks[i + 2] || 0, 23, -995338651);
    a = ii(a, b, c, d, blks[i + 0] || 0, 6, -198630844); d = ii(d, a, b, c, blks[i + 7] || 0, 10, 1126891415);
    c = ii(c, d, a, b, blks[i + 14] || 0, 15, -1416354905); b = ii(b, c, d, a, blks[i + 5] || 0, 21, -57434055);
    a = ii(a, b, c, d, blks[i + 12] || 0, 6, 1700485571); d = ii(d, a, b, c, blks[i + 3] || 0, 10, -1894986606);
    c = ii(c, d, a, b, blks[i + 10] || 0, 15, -1051523); b = ii(b, c, d, a, blks[i + 1] || 0, 21, -2054922799);
    a = ii(a, b, c, d, blks[i + 8] || 0, 6, 1873313359); d = ii(d, a, b, c, blks[i + 15] || 0, 10, -30611744);
    c = ii(c, d, a, b, blks[i + 6] || 0, 15, -1560198380); b = ii(b, c, d, a, blks[i + 13] || 0, 21, 1309151649);
    a = ii(a, b, c, d, blks[i + 4] || 0, 6, -145523070); d = ii(d, a, b, c, blks[i + 11] || 0, 10, -1120210379);
    c = ii(c, d, a, b, blks[i + 2] || 0, 15, 718787259); b = ii(b, c, d, a, blks[i + 9] || 0, 21, -343485551);
    a = add(a, oa); b = add(b, ob); c = add(c, oc); d = add(d, od);
  }
  const hex = (num: number) => {
    let s = "";
    for (let j = 0; j < 4; j++) s += ("0" + ((num >> (j * 8)) & 0xff).toString(16)).slice(-2);
    return s;
  };
  return hex(a) + hex(b) + hex(c) + hex(d);
}

/* ---------- SHA via WebCrypto ---------- */
export async function shaHex(algo: AlgorithmIdentifier, str: string): Promise<string> {
  const data = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest(algo, data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export type HashSet = Record<"MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512", string>;

export async function allHashes(str: string): Promise<HashSet> {
  const [s1, s256, s384, s512] = await Promise.all([
    shaHex("SHA-1", str), shaHex("SHA-256", str), shaHex("SHA-384", str), shaHex("SHA-512", str),
  ]);
  return { MD5: md5(str), "SHA-1": s1, "SHA-256": s256, "SHA-384": s384, "SHA-512": s512 };
}

/* ---------- Base64 ---------- */
export function b64Encode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}
export function b64Decode(str: string): string {
  return decodeURIComponent(escape(atob(str.replace(/\s/g, ""))));
}
export function bytesToB64(bytes: ArrayBuffer | Uint8Array): string {
  let bin = "";
  const arr = new Uint8Array(bytes as ArrayBuffer);
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin);
}
export function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64.replace(/\s/g, ""));
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

/* ---------- Hex ---------- */
export function bytesToHex(bytes: ArrayBuffer | Uint8Array): string {
  return [...new Uint8Array(bytes as ArrayBuffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/[^0-9a-fA-F]/g, "");
  if (clean.length % 2) throw new Error("Hex string must have an even number of digits");
  const arr = new Uint8Array(clean.length / 2);
  for (let i = 0; i < arr.length; i++) arr[i] = parseInt(clean.substr(i * 2, 2), 16);
  return arr;
}
export function textToHex(s: string): string {
  return [...new TextEncoder().encode(s)].map((b) => b.toString(16).padStart(2, "0")).join(" ");
}
export function hexToText(hex: string): string {
  return new TextDecoder().decode(hexToBytes(hex));
}

/* ---------- URL ---------- */
export const urlEncode = (s: string) => encodeURIComponent(s);
export const urlDecode = (s: string) => decodeURIComponent(s.replace(/\+/g, " "));

/* ---------- HTML entities ---------- */
export function htmlEscape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
export function htmlUnescape(s: string): string {
  const el = document.createElement("textarea");
  el.innerHTML = s;
  return el.value;
}

/* ---------- Unicode escape ---------- */
export function unicodeEscape(s: string): string {
  return [...s].map((ch) => {
    const code = ch.codePointAt(0)!;
    return code > 127 ? "\\u" + code.toString(16).padStart(4, "0") : ch;
  }).join("");
}
export function unicodeUnescape(s: string): string {
  return s
    .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

/* ---------- Base58 (Bitcoin alphabet) ---------- */
const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
export function base58Encode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
  let num = 0n;
  for (const b of bytes) num = num * 256n + BigInt(b);
  let out = "";
  while (num > 0n) {
    out = B58[Number(num % 58n)] + out;
    num /= 58n;
  }
  return "1".repeat(zeros) + out;
}
export function base58Decode(s: string): string {
  let zeros = 0;
  while (zeros < s.length && s[zeros] === "1") zeros++;
  let num = 0n;
  for (const ch of s.trim()) {
    const idx = B58.indexOf(ch);
    if (idx < 0) throw new Error(`Invalid Base58 character: "${ch}"`);
    num = num * 58n + BigInt(idx);
  }
  const bytes: number[] = [];
  while (num > 0n) {
    bytes.unshift(Number(num % 256n));
    num /= 256n;
  }
  return new TextDecoder().decode(new Uint8Array([...new Array(zeros).fill(0), ...bytes]));
}

/* ---------- CRC32 ---------- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
export function crc32(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let crc = 0xffffffff;
  for (const b of bytes) crc = CRC_TABLE[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, "0");
}

/* ---------- random ---------- */
export function uuidv4(): string {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });
}
export function randomBytesHex(n: number): string {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return bytesToHex(a);
}

/* ---------- JSON tokenizer (syntax highlight) ---------- */
export type JsonToken = { t: string; v: string };
export function tokenizeJson(json: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  const re = /("(?:\\.|[^"\\])*"\s*:?)|("(?:\\.|[^"\\])*")|(-?\d+\.?\d*(?:[eE][+-]?\d+)?)|\b(true|false)\b|\b(null)\b|([{}\[\],])|(\s+)/g;
  let m: RegExpExecArray | null;
  let last = 0;
  while ((m = re.exec(json)) !== null) {
    if (m.index > last) tokens.push({ t: "punc", v: json.slice(last, m.index) });
    if (m[1]) tokens.push({ t: m[1].trimEnd().endsWith(":") ? "key" : "str", v: m[1] });
    else if (m[2]) tokens.push({ t: "str", v: m[2] });
    else if (m[3]) tokens.push({ t: "num", v: m[3] });
    else if (m[4]) tokens.push({ t: "bool", v: m[4] });
    else if (m[5]) tokens.push({ t: "null", v: m[5] });
    else if (m[6]) tokens.push({ t: "punc", v: m[6] });
    else if (m[7]) tokens.push({ t: "ws", v: m[7] });
    last = re.lastIndex;
  }
  if (last < json.length) tokens.push({ t: "punc", v: json.slice(last) });
  return tokens;
}
/* ---------- Java / Mule toString() map → JSON ----------
   Turns logger output like `{message={message=world}, messageId=world,
   tags=[a, b]}` into a real JS value. Keys are unquoted, `=` separates
   key/value, `{}` is a map, `[]` is a list, scalars are coerced. */
export function parseJavaToString(input: string): unknown {
  const s = input.trim();
  let i = 0;
  const ws = () => {
    while (i < s.length && /\s/.test(s[i])) i++;
  };
  const coerce = (raw: string): unknown => {
    const v = raw.trim();
    if (v === "null") return null;
    if (v === "true") return true;
    if (v === "false") return false;
    if (/^-?\d+$/.test(v)) return Number(v);
    if (/^-?\d+\.\d+$/.test(v)) return Number(v);
    return v;
  };

  function value(): unknown {
    ws();
    if (s[i] === "{") return map();
    if (s[i] === "[") return list();
    return scalar();
  }
  function map(): Record<string, unknown> {
    i++; // {
    const obj: Record<string, unknown> = {};
    ws();
    if (s[i] === "}") {
      i++;
      return obj;
    }
    while (i < s.length) {
      ws();
      let start = i;
      while (i < s.length && s[i] !== "=" && s[i] !== "," && s[i] !== "}") i++;
      const key = s.slice(start, i).trim();
      if (s[i] === "=") i++;
      obj[key] = value();
      ws();
      if (s[i] === ",") {
        i++;
        continue;
      }
      if (s[i] === "}") {
        i++;
        break;
      }
      break;
    }
    return obj;
  }
  function list(): unknown[] {
    i++; // [
    const arr: unknown[] = [];
    ws();
    if (s[i] === "]") {
      i++;
      return arr;
    }
    while (i < s.length) {
      arr.push(value());
      ws();
      if (s[i] === ",") {
        i++;
        continue;
      }
      if (s[i] === "]") {
        i++;
        break;
      }
      break;
    }
    return arr;
  }
  function scalar(): unknown {
    const start = i;
    let depth = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === "{" || c === "[") depth++;
      else if (c === "}" || c === "]") {
        if (depth === 0) break;
        depth--;
      } else if (c === "," && depth === 0) break;
      i++;
    }
    return coerce(s.slice(start, i));
  }

  if (!(s[0] === "{" || s[0] === "[")) throw new Error("Expected the text to start with '{' or '[' (a Java map or list)");
  const out = value();
  return out;
}

export function jsonErrorInfo(text: string, err: Error): { msg: string; line: number | null; col: number | null } {
  const msg = err.message || String(err);
  const posMatch = msg.match(/position (\d+)/);
  let line: number | null = null;
  let col: number | null = null;
  if (posMatch) {
    const pos = parseInt(posMatch[1], 10);
    const before = text.slice(0, pos);
    line = before.split("\n").length;
    col = pos - before.lastIndexOf("\n");
  }
  return { msg, line, col };
}

/* ---------- JWT ---------- */
function b64urlDecode(seg: string): string {
  let s = seg.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return decodeURIComponent(escape(atob(s)));
}

export type DecodedJwt = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  parts: string[];
};

export function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split(".");
  if (parts.length < 2) throw new Error("Not a valid JWT — expected at least 2 segments separated by '.'");
  let header: Record<string, unknown>, payload: Record<string, unknown>;
  try { header = JSON.parse(b64urlDecode(parts[0])); }
  catch { throw new Error("Header is not valid base64url-encoded JSON"); }
  try { payload = JSON.parse(b64urlDecode(parts[1])); }
  catch { throw new Error("Payload is not valid base64url-encoded JSON"); }
  return { header, payload, signature: parts[2] || "", parts };
}

export const CLAIM_NOTES: Record<string, string> = {
  iss: "Issuer", sub: "Subject", aud: "Audience", exp: "Expiration time",
  nbf: "Not before", iat: "Issued at", jti: "JWT ID", typ: "Type", alg: "Algorithm",
  kid: "Key ID", scope: "Scope", azp: "Authorized party", name: "Full name", email: "Email",
};

export function epochToHuman(n: unknown): string | null {
  if (typeof n !== "number") return null;
  const d = new Date(n * 1000);
  if (isNaN(d.getTime())) return null;
  return d.toUTCString();
}

/* ---------- misc ---------- */
export function fmtBytes(n: number): string {
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  return (n / 1024 / 1024).toFixed(2) + " MB";
}

/* ---------- AES via WebCrypto ---------- */
export async function aesProcess({
  mode,
  op,
  keyHex,
  ivHex,
  input,
}: {
  mode: "CBC" | "GCM" | "CTR";
  op: "encrypt" | "decrypt";
  keyHex: string;
  ivHex: string;
  input: string;
}): Promise<string> {
  const keyBytes = hexToBytes(keyHex);
  if (![16, 32].includes(keyBytes.length))
    throw new Error("Key must be 16 or 32 bytes (32/64 hex chars) for AES-128/256 — WebCrypto doesn't support 192-bit keys");
  const algoName = mode === "GCM" ? "AES-GCM" : mode === "CTR" ? "AES-CTR" : "AES-CBC";
  const key = await crypto.subtle.importKey("raw", keyBytes as BufferSource, { name: algoName }, false, ["encrypt", "decrypt"]);
  const iv = hexToBytes(ivHex);
  if (mode !== "GCM" && iv.length !== 16) throw new Error("IV must be exactly 16 bytes (32 hex chars)");
  if (mode === "GCM" && ![12, 16].includes(iv.length)) throw new Error("GCM nonce should be 12 bytes (24 hex chars)");
  const params =
    mode === "CTR" ? { name: algoName, counter: iv as BufferSource, length: 64 } : { name: algoName, iv: iv as BufferSource };
  if (op === "encrypt") {
    const ct = await crypto.subtle.encrypt(params, key, new TextEncoder().encode(input));
    return bytesToB64(ct);
  }
  const pt = await crypto.subtle.decrypt(params, key, b64ToBytes(input) as BufferSource);
  return new TextDecoder().decode(pt);
}

/* ---------- file type sniffing (magic bytes) ----------
   Enough coverage to label a decoded Base64 blob and decide whether it can be
   previewed inline. Returns null when nothing matches (treat as text). */
export type SniffKind = "image" | "pdf" | "audio" | "video" | "binary";
export type SniffResult = { mime: string; ext: string; kind: SniffKind; label: string };

export function sniffMime(b: Uint8Array): SniffResult | null {
  const at = (sig: number[], off = 0) => sig.every((v, i) => b[off + i] === v);
  const ascii = (s: string, off = 0) => [...s].every((c, i) => b[off + i] === c.charCodeAt(0));

  // PDF: the %PDF marker is allowed anywhere in the first 1 KB, not just byte 0.
  const scanLimit = Math.min(b.length, 1024);
  for (let i = 0; i + 4 <= scanLimit; i++) {
    if (b[i] === 0x25 && b[i + 1] === 0x50 && b[i + 2] === 0x44 && b[i + 3] === 0x46)
      return { mime: "application/pdf", ext: "pdf", kind: "pdf", label: "PDF document" };
  }
  if (at([0x89, 0x50, 0x4e, 0x47])) return { mime: "image/png", ext: "png", kind: "image", label: "PNG image" };
  if (at([0xff, 0xd8, 0xff])) return { mime: "image/jpeg", ext: "jpg", kind: "image", label: "JPEG image" };
  if (at([0x47, 0x49, 0x46, 0x38])) return { mime: "image/gif", ext: "gif", kind: "image", label: "GIF image" };
  if (ascii("RIFF") && ascii("WEBP", 8)) return { mime: "image/webp", ext: "webp", kind: "image", label: "WebP image" };
  if (ascii("RIFF") && ascii("WAVE", 8)) return { mime: "audio/wav", ext: "wav", kind: "audio", label: "WAV audio" };
  if (ascii("RIFF") && ascii("AVI ", 8)) return { mime: "video/x-msvideo", ext: "avi", kind: "video", label: "AVI video" };
  if (at([0x42, 0x4d])) return { mime: "image/bmp", ext: "bmp", kind: "image", label: "BMP image" };
  if (at([0x00, 0x00, 0x01, 0x00])) return { mime: "image/x-icon", ext: "ico", kind: "image", label: "ICO icon" };
  if (ascii("ftyp", 4)) return { mime: "video/mp4", ext: "mp4", kind: "video", label: "MP4 video" };
  if (at([0x49, 0x44, 0x33]) || at([0xff, 0xfb]) || at([0xff, 0xf3])) return { mime: "audio/mpeg", ext: "mp3", kind: "audio", label: "MP3 audio" };
  if (ascii("OggS")) return { mime: "audio/ogg", ext: "ogg", kind: "audio", label: "Ogg audio" };
  if (ascii("fLaC")) return { mime: "audio/flac", ext: "flac", kind: "audio", label: "FLAC audio" };
  if (at([0x50, 0x4b, 0x03, 0x04])) return { mime: "application/zip", ext: "zip", kind: "binary", label: "ZIP archive" };
  if (at([0x1f, 0x8b])) return { mime: "application/gzip", ext: "gz", kind: "binary", label: "Gzip archive" };
  if (at([0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c])) return { mime: "application/x-7z-compressed", ext: "7z", kind: "binary", label: "7-Zip archive" };
  if (ascii("Rar!")) return { mime: "application/x-rar-compressed", ext: "rar", kind: "binary", label: "RAR archive" };
  return null;
}

/* Heuristic: do these bytes look like binary (not decodable as readable text)? */
export function looksBinary(b: Uint8Array): boolean {
  const n = Math.min(b.length, 512);
  for (let i = 0; i < n; i++) {
    const c = b[i];
    if (c === 0) return true; // NUL byte → binary
    if (c < 9 || (c > 13 && c < 32)) return true; // control chars
  }
  return false;
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
}
