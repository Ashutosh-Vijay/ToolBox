import { useEffect, useMemo, useState, type ReactNode } from "react";
import QRCode from "qrcode";
import { Icon } from "../Icon";
import { Btn } from "../ui/Btn";
import { Select } from "../ui/Select";
import { Seg } from "../ui/Seg";
import { InputPane, OutputPane } from "../ui/Panes";
import { CopyButton } from "../ui/CopyButton";
import { toast } from "../ui/toast";
import { uuidv4, randomBytesHex, downloadBlob } from "../../lib/crypto";

/* ===================== UUID / Bytes ===================== */
export function UuidTool() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>(() => Array.from({ length: 5 }, uuidv4));
  const [byteLen, setByteLen] = useState(32);
  const [bytes, setBytes] = useState<string>(() => randomBytesHex(32));

  return (
    <div className="tool-fade">
      <div className="ws-toolbar">
        <span className="pill"><Icon name="shield" style={{ width: 13, height: 13 }} />crypto.getRandomValues · cryptographically secure</span>
      </div>

      <div className="result-row" style={{ marginBottom: 10 }}>
        <span className="rr-tag">UUID v4<span className="sub">RFC 4122</span></span>
        <div className="row grow gap8">
          <span className="fld-label">Count</span>
          <Select value={String(count)} onChange={(v) => setCount(parseInt(v))} options={[1, 3, 5, 10, 25].map((n) => ({ value: String(n), label: String(n) }))} />
        </div>
        <span className="rr-acts">
          <CopyButton text={uuids.join("\n")} onDone="Copied all UUIDs" />
          <Btn icon="refresh" size="sm" onClick={() => { setUuids(Array.from({ length: count }, uuidv4)); toast(`Generated ${count} UUID${count > 1 ? "s" : ""}`, "ok"); }}>Regenerate</Btn>
        </span>
      </div>
      <div className="rows" style={{ marginBottom: 22 }}>
        {uuids.map((u, i) => (
          <div className="result-row" key={i}>
            <span className="rr-bar" style={{ background: "#7fd8ff" }} />
            <span className="rr-tag faint" style={{ width: 28 }}>{String(i + 1).padStart(2, "0")}</span>
            <span className="rr-val">{u}</span>
            <span className="rr-acts"><CopyButton text={u} /></span>
          </div>
        ))}
      </div>

      <div className="result-row">
        <span className="rr-tag">Random bytes<span className="sub">hex</span></span>
        <div className="row grow gap8">
          <span className="fld-label">Length</span>
          <Select value={String(byteLen)} onChange={(v) => setByteLen(parseInt(v))} options={[8, 16, 24, 32, 48, 64].map((n) => ({ value: String(n), label: n + " B" }))} />
        </div>
        <span className="rr-acts">
          <CopyButton text={bytes} />
          <Btn icon="refresh" size="sm" onClick={() => { setBytes(randomBytesHex(byteLen)); toast(`Generated ${byteLen} random bytes`, "ok"); }}>Regenerate</Btn>
        </span>
      </div>
      <div className="rows" style={{ marginTop: 10 }}>
        <div className="result-row">
          <span className="rr-bar" style={{ background: "#a78bfa" }} />
          <span className="rr-val">{bytes}</span>
          <span className="rr-acts"><CopyButton text={bytes} /></span>
        </div>
      </div>
    </div>
  );
}

/* ===================== Password ===================== */
const SETS = { lower: "abcdefghijklmnopqrstuvwxyz", upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", digits: "0123456789", symbols: "!@#$%^&*()-_=+[]{};:,.<>?" };
function genPassword(len: number, sets: Record<keyof typeof SETS, boolean>): string {
  const pool = (Object.keys(SETS) as (keyof typeof SETS)[]).filter((k) => sets[k]).map((k) => SETS[k]).join("");
  if (!pool) return "";
  const rnd = new Uint32Array(len);
  crypto.getRandomValues(rnd);
  return Array.from(rnd, (r) => pool[r % pool.length]).join("");
}
export function PasswordTool() {
  const [len, setLen] = useState(20);
  const [sets, setSets] = useState({ lower: true, upper: true, digits: true, symbols: true });
  const [count, setCount] = useState(5);
  const [pws, setPws] = useState<string[]>([]);

  const regen = () => setPws(Array.from({ length: count }, () => genPassword(len, sets)));
  useEffect(() => { regen(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="tool-fade">
      <div className="ws-toolbar">
        <div className="row gap8"><span className="fld-label">Length</span>
          <Select value={String(len)} onChange={(v) => setLen(parseInt(v))} options={[8, 12, 16, 20, 24, 32, 48, 64].map((n) => ({ value: String(n), label: String(n) }))} /></div>
        <div className="row gap8"><span className="fld-label">Count</span>
          <Select value={String(count)} onChange={(v) => setCount(parseInt(v))} options={[1, 3, 5, 10].map((n) => ({ value: String(n), label: String(n) }))} /></div>
        <span className="spacer" />
        <Btn variant="primary" icon="refresh" onClick={regen}>Generate</Btn>
      </div>
      <div className="row wrap gap8" style={{ marginBottom: 16 }}>
        {(Object.keys(SETS) as (keyof typeof SETS)[]).map((k) => (
          <button key={k} className={"pill" + (sets[k] ? " accent" : "")} onClick={() => setSets((s) => ({ ...s, [k]: !s[k] }))} style={{ cursor: "pointer", textTransform: "capitalize" }}>
            <Icon name={sets[k] ? "check" : "x"} style={{ width: 12, height: 12 }} />{k}
          </button>
        ))}
      </div>
      <div className="rows">
        {pws.map((p, i) => (
          <div className="result-row" key={i}>
            <span className="rr-bar" style={{ background: "#7fd8ff" }} />
            <span className="rr-val" style={{ fontSize: 14 }}>{p || "— pick at least one character set —"}</span>
            <span className="rr-acts">{p && <CopyButton text={p} />}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== Lorem Ipsum ===================== */
const LOREM = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");
const pick = () => LOREM[(Math.random() * LOREM.length) | 0];
function sentence() {
  const n = 8 + ((Math.random() * 10) | 0);
  const words = Array.from({ length: n }, pick);
  words[0] = words[0][0].toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
}
function paragraph() {
  return Array.from({ length: 4 + ((Math.random() * 3) | 0) }, sentence).join(" ");
}
export function LoremTool() {
  const [unit, setUnit] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [count, setCount] = useState(3);
  const [text, setText] = useState("");
  const gen = () => {
    if (unit === "words") setText(Array.from({ length: count }, pick).join(" "));
    else if (unit === "sentences") setText(Array.from({ length: count }, sentence).join(" "));
    else setText(Array.from({ length: count }, paragraph).join("\n\n"));
  };
  useEffect(() => { gen(); /* eslint-disable-next-line */ }, []);
  return (
    <div className="tool-fade">
      <div className="ws-toolbar">
        <Seg value={unit} onChange={(v) => setUnit(v as typeof unit)} accent options={[{ value: "paragraphs", label: "Paragraphs" }, { value: "sentences", label: "Sentences" }, { value: "words", label: "Words" }]} />
        <div className="row gap8"><span className="fld-label">Count</span>
          <Select value={String(count)} onChange={(v) => setCount(parseInt(v))} options={[1, 2, 3, 5, 8, 12].map((n) => ({ value: String(n), label: String(n) }))} /></div>
        <span className="spacer" />
        <Btn variant="primary" icon="refresh" onClick={gen}>Generate</Btn>
      </div>
      <div className="panes stack">
        <OutputPane title="Lorem ipsum" value={text} copyText={text} />
      </div>
    </div>
  );
}

/* ===================== QR Code ===================== */
export function QrTool() {
  const [text, setText] = useState("https://toolbox.dev");
  const [ecc, setEcc] = useState("M");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!text) { setUrl(""); return; }
    QRCode.toDataURL(text, { errorCorrectionLevel: ecc as "L" | "M" | "Q" | "H", width: 320, margin: 2 })
      .then(setUrl)
      .catch(() => setUrl(""));
  }, [text, ecc]);

  return (
    <div className="tool-fade">
      <div className="ws-toolbar">
        <div className="row gap8"><span className="fld-label">Error correction</span>
          <Select value={ecc} onChange={setEcc} options={[{ value: "L", label: "Low" }, { value: "M", label: "Medium" }, { value: "Q", label: "Quartile" }, { value: "H", label: "High" }]} /></div>
        <span className="spacer" />
        <Btn icon="download" onClick={() => { if (url) { fetch(url).then((r) => r.blob()).then((b) => downloadBlob("qrcode.png", b)); toast("Saved qrcode.png", "ok"); } }} disabled={!url}>Save PNG</Btn>
      </div>
      <div className="panes">
        <InputPane title="Text / URL" value={text} onChange={setText} onClear={() => setText("")} placeholder="Type text or a URL to encode as a QR code…" />
        <div className="swap-col" />
        <div className="pane out">
          <div className="pane-head"><span className="pane-title"><span className="dot" />QR code</span></div>
          <div className="pane-body" style={{ alignItems: "center", justifyContent: "center", padding: 22, background: "var(--bg-0)" }}>
            {url ? <img src={url} alt="QR code" style={{ width: 280, height: 280, borderRadius: 8, background: "#fff", padding: 8 }} /> : <pre className="out-area empty">QR code appears here</pre>}
          </div>
          <div className="pane-foot"><span className="faint">{text.length} chars encoded</span></div>
        </div>
      </div>
    </div>
  );
}

/* ===================== Regex Tester ===================== */
export function RegexTool() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [test, setTest] = useState("");

  const { matches, error } = useMemo(() => {
    if (!pattern) return { matches: [] as RegExpMatchArray[], error: "" };
    try {
      const re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      return { matches: [...test.matchAll(re)], error: "" };
    } catch (e) {
      return { matches: [] as RegExpMatchArray[], error: (e as Error).message };
    }
  }, [pattern, flags, test]);

  const highlighted = useMemo(() => {
    if (!matches.length) return [test];
    const out: ReactNode[] = [];
    let last = 0;
    matches.forEach((m, i) => {
      const start = m.index ?? 0;
      if (start > last) out.push(test.slice(last, start));
      out.push(<mark key={i} style={{ background: "var(--accent-soft)", color: "var(--accent)", borderRadius: 3, padding: "0 1px" }}>{m[0]}</mark>);
      last = start + m[0].length;
    });
    if (last < test.length) out.push(test.slice(last));
    return out;
  }, [matches, test]);

  return (
    <div className="tool-fade">
      <div className="ws-toolbar">
        <div className="fld grow" style={{ minWidth: 240, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <span className="fld-label">/</span>
          <input className="input mono grow" value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="\\b\\w+@\\w+\\.\\w+\\b" spellCheck={false} />
          <span className="fld-label">/</span>
          <input className="input mono" style={{ width: 70 }} value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="gim" spellCheck={false} />
        </div>
        <span className="spacer" />
        <span className="pill">{error ? <span className="bad"><Icon name="alert" style={{ width: 12, height: 12 }} />invalid</span> : `${matches.length} match${matches.length !== 1 ? "es" : ""}`}</span>
      </div>
      <div className="panes stack" style={{ marginBottom: 14 }}>
        <InputPane title="Test string" value={test} onChange={setTest} onClear={() => setTest("")} placeholder="Paste text to test the pattern against…" error={!!error} />
      </div>
      <div className="pane out">
        <div className="pane-head"><span className="pane-title"><span className="dot" />Matches</span></div>
        <div className="pane-body" style={{ display: "block", overflow: "auto", maxHeight: "30vh", padding: 14 }}>
          {error ? (
            <span className="bad"><Icon name="alert" /> {error}</span>
          ) : (
            <pre className="code-view" style={{ padding: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{highlighted}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
