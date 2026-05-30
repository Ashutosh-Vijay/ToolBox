import { useMemo, useState } from "react";
import yaml from "js-yaml";
import { format as formatSql } from "sql-formatter";
import { Icon } from "../Icon";
import { Btn } from "../ui/Btn";
import { Seg } from "../ui/Seg";
import { Select } from "../ui/Select";
import { InputPane, OutputPane, SwapDivider } from "../ui/Panes";
import { CopyButton } from "../ui/CopyButton";
import { ErrorBanner } from "../ui/ErrorBanner";
import { JsonView } from "../ui/JsonView";
import { fmtBytes, jsonErrorInfo, parseJavaToString } from "../../lib/crypto";

/* ===================== JSON ===================== */
type JsonMode = "beautify" | "minify" | "java";
export function JsonTool() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState("2");
  const [mode, setMode] = useState<JsonMode>("beautify");

  const result = useMemo<
    | { kind: "empty" }
    | { kind: "ok"; out: string; size: number; minSize: number; type: string }
    | { kind: "error"; info: ReturnType<typeof jsonErrorInfo> }
  >(() => {
    if (!input.trim()) return { kind: "empty" };
    try {
      const parsed = mode === "java" ? parseJavaToString(input) : JSON.parse(input);
      const out = mode === "minify" ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent === "tab" ? "\t" : parseInt(indent, 10));
      return {
        kind: "ok",
        out,
        size: new Blob([input]).size,
        minSize: new Blob([JSON.stringify(parsed)]).size,
        type: Array.isArray(parsed) ? "array" : typeof parsed,
      };
    } catch (e) {
      // Java parsing has no character positions to report, so just show the message.
      if (mode === "java") return { kind: "error", info: { msg: (e as Error).message, line: null, col: null } };
      return { kind: "error", info: jsonErrorInfo(input, e as Error) };
    }
  }, [input, indent, mode]);

  const javaSample = "{message={message=world}, messageId=world, attributes={headers={host=localhost}, statusCode=200}, tags=[a, b, c]}";

  return (
    <div className="tool-fade">
      <div className="ws-toolbar">
        <Seg value={mode} onChange={(v) => setMode(v as JsonMode)} accent options={[{ value: "beautify", label: "Beautify" }, { value: "minify", label: "Minify" }, { value: "java", label: "Java → JSON" }]} />
        {mode !== "minify" && (
          <div className="row gap8">
            <span className="fld-label">Indent</span>
            <Select value={indent} onChange={setIndent} options={[{ value: "2", label: "2 spaces" }, { value: "4", label: "4 spaces" }, { value: "tab", label: "Tabs" }]} />
          </div>
        )}
        <span className="spacer" />
        <Btn icon="refresh" onClick={() => setInput(mode === "java" ? javaSample : '{"app":"ToolBox","version":1,"offline":true,"tools":["base64","jwt","json"],"meta":{"stars":4096}}')}>Sample</Btn>
        <Btn icon="trash" variant="danger" onClick={() => setInput("")} disabled={!input}>Clear</Btn>
      </div>

      <div className="panes">
        <InputPane title={mode === "java" ? "Java / Mule map" : "JSON input"} value={input} onChange={setInput} onClear={() => setInput("")} placeholder={mode === "java" ? "{message={message=world}, messageId=world}" : 'Paste JSON — e.g. {"hello":"world"}'} error={result.kind === "error"} />
        <SwapDivider onSwap={() => { if (result.kind === "ok") setInput(result.out); }} />
        <div className={"pane out" + (result.kind === "error" ? " err" : "")}>
          <div className="pane-head">
            <span className="pane-title"><span className="dot" />{mode === "minify" ? "Minified" : "Formatted"}</span>
            {result.kind === "ok" && <span className="meta">{result.type}</span>}
            <span className="acts">{result.kind === "ok" && <CopyButton text={result.out} />}</span>
          </div>
          <div className="pane-body">
            {result.kind === "ok" ? (
              <JsonView text={result.out} />
            ) : result.kind === "error" ? (
              <div style={{ padding: 14, width: "100%" }}>
                <ErrorBanner title={mode === "java" ? "Couldn't parse Java map" : "Invalid JSON"}>
                  {result.info.msg}
                  {result.info.line ? ` (line ${result.info.line}, column ${result.info.col})` : ""}
                </ErrorBanner>
              </div>
            ) : (
              <pre className="out-area empty">Formatted JSON appears here</pre>
            )}
          </div>
          <div className="pane-foot">
            {result.kind === "error" ? (
              <span className="bad"><Icon name="alert" />Parse error</span>
            ) : result.kind === "ok" ? (
              <>
                <span className="ok"><Icon name="check" />{mode === "java" ? "Parsed to JSON" : "Valid JSON"}</span>
                <span className="sep" />
                <span>{fmtBytes(result.size)} → {fmtBytes(result.minSize)} minified</span>
              </>
            ) : (
              <span>Idle</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== XML ===================== */
function formatXml(xml: string): string {
  const withBreaks = xml.replace(/>\s*</g, ">\n<").trim();
  let pad = 0;
  return withBreaks
    .split("\n")
    .map((node) => {
      if (/^<\/\w/.test(node) && pad > 0) pad--;
      const line = "  ".repeat(pad) + node;
      if (/^<\w[^>]*[^/]>$/.test(node) && !/^<.*<\/.*>$/.test(node)) pad++;
      return line;
    })
    .join("\n");
}
export function XmlTool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"beautify" | "minify">("beautify");
  const result = useMemo<{ kind: "empty" } | { kind: "ok"; out: string } | { kind: "error" }>(() => {
    if (!input.trim()) return { kind: "empty" };
    const doc = new DOMParser().parseFromString(input, "application/xml");
    if (doc.querySelector("parsererror")) return { kind: "error" };
    const out = mode === "minify" ? input.replace(/>\s+</g, "><").trim() : formatXml(input);
    return { kind: "ok", out };
  }, [input, mode]);

  return (
    <div className="tool-fade">
      <div className="ws-toolbar">
        <Seg value={mode} onChange={(v) => setMode(v as "beautify" | "minify")} accent options={[{ value: "beautify", label: "Beautify" }, { value: "minify", label: "Minify" }]} />
        <span className="spacer" />
        <Btn icon="trash" variant="danger" onClick={() => setInput("")} disabled={!input}>Clear</Btn>
      </div>
      <div className="panes">
        <InputPane title="XML input" value={input} onChange={setInput} onClear={() => setInput("")} placeholder="<root><item>value</item></root>" error={result.kind === "error"} />
        <SwapDivider onSwap={() => { if (result.kind === "ok") setInput(result.out); }} />
        <OutputPane title={mode === "minify" ? "Minified" : "Formatted"} value={result.kind === "ok" ? result.out : ""} error={result.kind === "error" ? "Invalid XML" : undefined} />
      </div>
    </div>
  );
}

/* ===================== SQL ===================== */
export function SqlTool() {
  const [input, setInput] = useState("");
  const [dialect, setDialect] = useState("sql");
  const result = useMemo(() => {
    if (!input.trim()) return "";
    try {
      return formatSql(input, { language: dialect as never });
    } catch (e) {
      return "-- " + (e as Error).message;
    }
  }, [input, dialect]);
  return (
    <div className="tool-fade">
      <div className="ws-toolbar">
        <div className="row gap8">
          <span className="fld-label">Dialect</span>
          <Select value={dialect} onChange={setDialect} options={["sql", "postgresql", "mysql", "sqlite", "mariadb", "bigquery"].map((d) => ({ value: d, label: d }))} />
        </div>
        <span className="spacer" />
        <Btn icon="trash" variant="danger" onClick={() => setInput("")} disabled={!input}>Clear</Btn>
      </div>
      <div className="panes">
        <InputPane title="SQL input" value={input} onChange={setInput} onClear={() => setInput("")} placeholder="select * from users where id=1 and active=true order by name" />
        <SwapDivider onSwap={() => result && setInput(result)} />
        <OutputPane title="Formatted SQL" value={result} />
      </div>
    </div>
  );
}

/* ===================== YAML ↔ JSON ===================== */
export function YamlTool() {
  const [input, setInput] = useState("");
  const [dir, setDir] = useState<"y2j" | "j2y">("y2j");
  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      if (dir === "y2j") return { output: JSON.stringify(yaml.load(input), null, 2), error: "" };
      return { output: yaml.dump(JSON.parse(input)), error: "" };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, dir]);
  return (
    <div className="tool-fade">
      <div className="ws-toolbar">
        <Seg value={dir} onChange={(v) => setDir(v as "y2j" | "j2y")} accent options={[{ value: "y2j", label: "YAML → JSON" }, { value: "j2y", label: "JSON → YAML" }]} />
        <span className="spacer" />
        <Btn icon="trash" variant="danger" onClick={() => setInput("")} disabled={!input}>Clear</Btn>
      </div>
      <div className="panes">
        <InputPane title={dir === "y2j" ? "YAML" : "JSON"} value={input} onChange={setInput} onClear={() => setInput("")} placeholder={dir === "y2j" ? "name: ToolBox\noffline: true" : '{"name":"ToolBox","offline":true}'} error={!!error} />
        <SwapDivider onSwap={() => { if (output) { setInput(output); setDir((d) => (d === "y2j" ? "j2y" : "y2j")); } }} />
        <OutputPane title={dir === "y2j" ? "JSON" : "YAML"} value={error ? "" : output} error={error} />
      </div>
    </div>
  );
}

/* ===================== Text Diff ===================== */
function lineDiff(a: string, b: string) {
  const x = a.split("\n");
  const y = b.split("\n");
  const n = x.length;
  const m = y.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--) dp[i][j] = x[i] === y[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const rows: { type: "same" | "add" | "del"; text: string }[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (x[i] === y[j]) {
      rows.push({ type: "same", text: x[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      rows.push({ type: "del", text: x[i++] });
    } else {
      rows.push({ type: "add", text: y[j++] });
    }
  }
  while (i < n) rows.push({ type: "del", text: x[i++] });
  while (j < m) rows.push({ type: "add", text: y[j++] });
  return rows;
}
export function DiffTool() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const rows = useMemo(() => (a || b ? lineDiff(a, b) : []), [a, b]);
  const adds = rows.filter((r) => r.type === "add").length;
  const dels = rows.filter((r) => r.type === "del").length;
  return (
    <div className="tool-fade">
      <div className="ws-toolbar">
        <span className="pill"><span className="pdot" style={{ background: "#46e08a" }} />{adds} added</span>
        <span className="pill"><span className="pdot" style={{ background: "#ff6b7a" }} />{dels} removed</span>
        <span className="spacer" />
        <Btn icon="trash" variant="danger" onClick={() => { setA(""); setB(""); }} disabled={!a && !b}>Clear</Btn>
      </div>
      <div className="panes" style={{ marginBottom: 16 }}>
        <InputPane title="Original" value={a} onChange={setA} onClear={() => setA("")} placeholder="Paste the original text…" />
        <SwapDivider onSwap={() => { const t = a; setA(b); setB(t); }} />
        <InputPane title="Changed" value={b} onChange={setB} onClear={() => setB("")} placeholder="Paste the changed text…" />
      </div>
      <div className="pane out">
        <div className="pane-head"><span className="pane-title"><span className="dot" />Diff</span></div>
        <div className="pane-body" style={{ display: "block", overflow: "auto", maxHeight: "44vh" }}>
          {rows.length ? (
            <pre className="code-view" style={{ padding: 12 }}>
              {rows.map((r, i) => (
                <div key={i} style={{
                  background: r.type === "add" ? "var(--success-soft)" : r.type === "del" ? "var(--danger-soft)" : "transparent",
                  color: r.type === "add" ? "var(--success)" : r.type === "del" ? "var(--danger)" : "var(--text-1)",
                  whiteSpace: "pre-wrap", wordBreak: "break-word",
                }}>
                  {r.type === "add" ? "+ " : r.type === "del" ? "- " : "  "}{r.text}
                </div>
              ))}
            </pre>
          ) : (
            <pre className="out-area empty">Enter text in both panes to see the diff</pre>
          )}
        </div>
      </div>
    </div>
  );
}
