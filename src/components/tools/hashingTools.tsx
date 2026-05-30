import { useEffect, useMemo, useState } from "react";
import bcrypt from "bcryptjs";
import { Icon } from "../Icon";
import { Btn } from "../ui/Btn";
import { Seg } from "../ui/Seg";
import { Select } from "../ui/Select";
import { InputPane } from "../ui/Panes";
import { HashResultRow } from "../ui/HashResultRow";
import { CopyButton } from "../ui/CopyButton";
import { toast } from "../ui/toast";
import { bytesToHex, crc32 } from "../../lib/crypto";

/* ===================== HMAC ===================== */
export function HmacTool() {
  const [key, setKey] = useState("");
  const [msg, setMsg] = useState("");
  const [algo, setAlgo] = useState("SHA-256");
  const [out, setOut] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!key || !msg) {
      setOut("");
      return;
    }
    (async () => {
      const ck = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(key),
        { name: "HMAC", hash: algo },
        false,
        ["sign"]
      );
      const sig = await crypto.subtle.sign("HMAC", ck, new TextEncoder().encode(msg));
      if (!cancelled) setOut(bytesToHex(sig));
    })();
    return () => {
      cancelled = true;
    };
  }, [key, msg, algo]);

  return (
    <div className="tool-fade">
      <div className="ws-toolbar">
        <div className="row gap8">
          <span className="fld-label">Algorithm</span>
          <Select
            value={algo}
            onChange={setAlgo}
            options={["SHA-1", "SHA-256", "SHA-384", "SHA-512"].map((a) => ({ value: a, label: a }))}
          />
        </div>
        <span className="spacer" />
        <Btn icon="trash" variant="danger" onClick={() => { setKey(""); setMsg(""); }} disabled={!key && !msg}>
          Clear
        </Btn>
      </div>
      <div className="row wrap gap14" style={{ marginBottom: 14 }}>
        <div className="fld grow" style={{ minWidth: 260 }}>
          <label className="fld-label">Secret key</label>
          <input className="input mono" value={key} onChange={(e) => setKey(e.target.value)} placeholder="your-secret-key" spellCheck={false} />
        </div>
      </div>
      <div className="panes stack" style={{ marginBottom: 16 }}>
        <InputPane title="Message" value={msg} onChange={setMsg} onClear={() => setMsg("")} placeholder="Type or paste the message to authenticate…" />
      </div>
      {out ? (
        <div className="rows">
          <HashResultRow tag={"HMAC"} sub={algo} value={out} color="#a78bfa" copyLabel="Copied HMAC" />
        </div>
      ) : (
        <div className="result-row" style={{ justifyContent: "center", color: "var(--text-3)", padding: 22 }}>
          Enter a key and a message to compute the HMAC
        </div>
      )}
    </div>
  );
}

/* ===================== CRC32 ===================== */
export function Crc32Tool() {
  const [input, setInput] = useState("");
  const out = useMemo(() => (input ? crc32(input) : ""), [input]);
  return (
    <div className="tool-fade">
      <div className="ws-toolbar">
        <span className="pill">
          <Icon name="shield" style={{ width: 13, height: 13 }} />
          CRC-32 / IEEE 802.3
        </span>
        <span className="spacer" />
        <Btn icon="trash" variant="danger" onClick={() => setInput("")} disabled={!input}>
          Clear
        </Btn>
      </div>
      <div className="panes stack" style={{ marginBottom: 16 }}>
        <InputPane title="Input text" value={input} onChange={setInput} onClear={() => setInput("")} placeholder="Type or paste text — the CRC32 checksum updates live…" />
      </div>
      {out ? (
        <div className="rows">
          <HashResultRow tag="CRC32" sub="hex · 32-bit" value={out} color="#46e08a" />
          <HashResultRow tag="CRC32" sub="unsigned int" value={String(parseInt(out, 16))} color="#7fd8ff" />
        </div>
      ) : (
        <div className="result-row" style={{ justifyContent: "center", color: "var(--text-3)", padding: 22 }}>
          Enter text to compute its CRC32
        </div>
      )}
    </div>
  );
}

/* ===================== bcrypt ===================== */
export function BcryptTool() {
  const [op, setOp] = useState<"hash" | "verify">("hash");
  const [pw, setPw] = useState("");
  const [rounds, setRounds] = useState("10");
  const [hash, setHash] = useState("");
  const [verifyHash, setVerifyHash] = useState("");
  const [verifyResult, setVerifyResult] = useState<null | boolean>(null);
  const [busy, setBusy] = useState(false);

  const doHash = async () => {
    if (!pw) return;
    setBusy(true);
    try {
      const salt = await bcrypt.genSalt(parseInt(rounds, 10));
      setHash(await bcrypt.hash(pw, salt));
      toast("Hashed with bcrypt", "ok");
    } catch (e) {
      toast((e as Error).message, "err");
    }
    setBusy(false);
  };

  const doVerify = async () => {
    if (!pw || !verifyHash) return;
    setBusy(true);
    try {
      setVerifyResult(await bcrypt.compare(pw, verifyHash));
    } catch {
      setVerifyResult(false);
    }
    setBusy(false);
  };

  return (
    <div className="tool-fade">
      <div className="ws-toolbar">
        <Seg
          value={op}
          onChange={(v) => { setOp(v as "hash" | "verify"); setVerifyResult(null); }}
          accent
          options={[{ value: "hash", label: "Hash" }, { value: "verify", label: "Verify" }]}
        />
        {op === "hash" && (
          <div className="row gap8">
            <span className="fld-label">Rounds</span>
            <Select value={rounds} onChange={setRounds} options={[8, 10, 12, 14].map((n) => ({ value: String(n), label: String(n) }))} />
          </div>
        )}
        <span className="spacer" />
        <Btn variant="primary" icon="fingerprint" onClick={op === "hash" ? doHash : doVerify} disabled={busy || !pw}>
          {busy ? "Working…" : op === "hash" ? "Hash" : "Verify"}
        </Btn>
      </div>

      <div className="row wrap gap14" style={{ marginBottom: 14 }}>
        <div className="fld grow" style={{ minWidth: 260 }}>
          <label className="fld-label">Password</label>
          <input className="input mono" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password to hash…" spellCheck={false} />
        </div>
      </div>

      {op === "verify" && (
        <div className="row wrap gap14" style={{ marginBottom: 14 }}>
          <div className="fld grow" style={{ minWidth: 260 }}>
            <label className="fld-label">bcrypt hash to check against</label>
            <input className="input mono" value={verifyHash} onChange={(e) => { setVerifyHash(e.target.value); setVerifyResult(null); }} placeholder="$2a$10$…" spellCheck={false} />
          </div>
        </div>
      )}

      {op === "hash" && hash && (
        <div className="rows">
          <HashResultRow tag="bcrypt" sub={`${rounds} rounds`} value={hash} color="#ff6b7a" />
        </div>
      )}
      {op === "verify" && verifyResult !== null && (
        <div className={"sig-state " + (verifyResult ? "ok" : "warn")}>
          <Icon name={verifyResult ? "check" : "alert"} />
          {verifyResult ? "Match — the password matches this hash" : "No match"}
        </div>
      )}
      <div className="row gap8" style={{ marginTop: 12 }}>
        {op === "hash" && hash && <CopyButton text={hash} onDone="Copied hash" />}
      </div>
    </div>
  );
}
