import { useEffect, useState } from "react";
import * as openpgp from "openpgp";
import { Icon } from "../Icon";
import { Btn } from "../ui/Btn";
import { Seg } from "../ui/Seg";
import { Select } from "../ui/Select";
import { InputPane, OutputPane } from "../ui/Panes";
import { CopyButton } from "../ui/CopyButton";
import { toast } from "../ui/toast";
import { aesProcess, bytesToB64, randomBytesHex } from "../../lib/crypto";

/* ===================== AES ===================== */
export function AesTool() {
  const [op, setOp] = useState<"encrypt" | "decrypt">("encrypt");
  const [mode, setMode] = useState<"CBC" | "GCM" | "CTR">("CBC");
  const [keyHex, setKeyHex] = useState("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f");
  const [ivHex, setIvHex] = useState("0f0e0d0c0b0a09080706050403020100");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setOutput("");
    setError("");
  }, [op, mode]);

  const run = async () => {
    setError("");
    if (!input) {
      setOutput("");
      return;
    }
    try {
      setOutput(await aesProcess({ mode, op, keyHex, ivHex, input }));
      toast(op === "encrypt" ? "Encrypted" : "Decrypted", "ok");
    } catch (e) {
      setOutput("");
      setError((e as Error).message || "AES operation failed");
    }
  };

  return (
    <div className="tool-fade">
      <div className="ws-toolbar">
        <Seg
          value={op}
          onChange={(v) => setOp(v as "encrypt" | "decrypt")}
          accent
          options={[
            { value: "encrypt", label: "Encrypt", icon: "lock" },
            { value: "decrypt", label: "Decrypt", icon: "unlock" },
          ]}
        />
        <div className="row gap8">
          <span className="fld-label">Mode</span>
          <Select value={mode} onChange={(v) => setMode(v as "CBC" | "GCM" | "CTR")} options={[
            { value: "CBC", label: "AES-CBC" },
            { value: "GCM", label: "AES-GCM" },
            { value: "CTR", label: "AES-CTR" },
          ]} />
        </div>
        <span className="spacer" />
        <Btn variant="primary" icon={op === "encrypt" ? "lock" : "unlock"} onClick={run} disabled={!input}>
          {op === "encrypt" ? "Encrypt" : "Decrypt"}
        </Btn>
      </div>

      <div className="row wrap gap14" style={{ marginBottom: 14 }}>
        <div className="fld grow" style={{ minWidth: 280 }}>
          <label className="fld-label">Key <span className="faint">(hex — 16/24/32 bytes)</span></label>
          <div className="row gap6">
            <input className="input mono grow" value={keyHex} onChange={(e) => setKeyHex(e.target.value.trim())} spellCheck={false} />
            <Btn iconOnly icon="refresh" onClick={() => { setKeyHex(randomBytesHex(32)); toast("Generated 256-bit key", "ok"); }} title="Generate key" />
            <CopyButton text={keyHex} />
          </div>
        </div>
        <div className="fld grow" style={{ minWidth: 240 }}>
          <label className="fld-label">{mode === "GCM" ? "Nonce / IV" : "IV"} <span className="faint">(hex — {mode === "GCM" ? "12" : "16"} bytes)</span></label>
          <div className="row gap6">
            <input className="input mono grow" value={ivHex} onChange={(e) => setIvHex(e.target.value.trim())} spellCheck={false} />
            <Btn iconOnly icon="refresh" onClick={() => { setIvHex(randomBytesHex(mode === "GCM" ? 12 : 16)); toast("Generated random IV", "ok"); }} title="Generate IV" />
            <CopyButton text={ivHex} />
          </div>
        </div>
      </div>

      <div className="panes">
        <InputPane title={op === "encrypt" ? "Plaintext" : "Ciphertext (Base64)"} value={input} onChange={setInput} onClear={() => setInput("")} placeholder={op === "encrypt" ? "Secret message to encrypt…" : "Paste Base64 ciphertext…"} />
        <div className="swap-col">
          <button className="swap-btn" onClick={run} title="Run" disabled={!input}>
            <Icon name="arrowRight" />
          </button>
        </div>
        <OutputPane title={op === "encrypt" ? "Ciphertext (Base64)" : "Plaintext"} value={output} error={error} footExtra={<span className="faint">{mode === "GCM" ? "GCM appends a 16-byte auth tag" : mode + " mode"}</span>} />
      </div>
    </div>
  );
}

/* ===================== RSA Keypair ===================== */
const pem = (label: string, buf: ArrayBuffer) => {
  const b64 = bytesToB64(buf);
  const lines = b64.match(/.{1,64}/g)?.join("\n") ?? b64;
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
};

export function RsaTool() {
  const [bits, setBits] = useState("2048");
  const [pub, setPub] = useState("");
  const [priv, setPriv] = useState("");
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    setBusy(true);
    try {
      const kp = await crypto.subtle.generateKey(
        { name: "RSASSA-PKCS1-v1_5", modulusLength: parseInt(bits, 10), publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
        true,
        ["sign", "verify"]
      );
      setPub(pem("PUBLIC KEY", await crypto.subtle.exportKey("spki", kp.publicKey)));
      setPriv(pem("PRIVATE KEY", await crypto.subtle.exportKey("pkcs8", kp.privateKey)));
      toast(`Generated ${bits}-bit RSA keypair`, "ok");
    } catch (e) {
      toast((e as Error).message, "err");
    }
    setBusy(false);
  };

  return (
    <div className="tool-fade">
      <div className="ws-toolbar">
        <div className="row gap8">
          <span className="fld-label">Key size</span>
          <Select value={bits} onChange={setBits} options={["2048", "3072", "4096"].map((b) => ({ value: b, label: b + "-bit" }))} />
        </div>
        <span className="spacer" />
        <Btn variant="primary" icon="refresh" onClick={generate} disabled={busy}>
          {busy ? "Generating…" : "Generate keypair"}
        </Btn>
      </div>
      <div className="panes">
        <OutputPane title="Public key (SPKI / PEM)" value={pub} placeholder="Public key appears here" copyText={pub} />
        <div className="swap-col" />
        <OutputPane title="Private key (PKCS#8 / PEM)" value={priv} placeholder="Private key appears here" copyText={priv} />
      </div>
    </div>
  );
}

/* ===================== PGP ===================== */
export function PgpTool() {
  const [tab, setTab] = useState<"generate" | "encrypt" | "decrypt">("generate");
  const [busy, setBusy] = useState(false);

  // generate
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [genPub, setGenPub] = useState("");
  const [genPriv, setGenPriv] = useState("");

  // encrypt
  const [recipKey, setRecipKey] = useState("");
  const [plain, setPlain] = useState("");
  const [cipher, setCipher] = useState("");

  // decrypt
  const [privKey, setPrivKey] = useState("");
  const [decPass, setDecPass] = useState("");
  const [ct, setCt] = useState("");
  const [decrypted, setDecrypted] = useState("");

  const generate = async () => {
    setBusy(true);
    try {
      const { privateKey, publicKey } = await openpgp.generateKey({
        type: "ecc",
        userIDs: [{ name: name || "ToolBox User", email: email || undefined }],
        passphrase: passphrase || undefined,
      });
      setGenPub(publicKey);
      setGenPriv(privateKey);
      toast("Generated PGP keypair", "ok");
    } catch (e) {
      toast((e as Error).message, "err");
    }
    setBusy(false);
  };

  const encrypt = async () => {
    setBusy(true);
    try {
      const key = await openpgp.readKey({ armoredKey: recipKey });
      const enc = await openpgp.encrypt({ message: await openpgp.createMessage({ text: plain }), encryptionKeys: key });
      setCipher(enc as string);
      toast("Encrypted", "ok");
    } catch (e) {
      toast((e as Error).message, "err");
    }
    setBusy(false);
  };

  const decrypt = async () => {
    setBusy(true);
    try {
      let key = await openpgp.readPrivateKey({ armoredKey: privKey });
      if (!key.isDecrypted()) key = await openpgp.decryptKey({ privateKey: key, passphrase: decPass });
      const { data } = await openpgp.decrypt({ message: await openpgp.readMessage({ armoredMessage: ct }), decryptionKeys: key });
      setDecrypted(data as string);
      toast("Decrypted", "ok");
    } catch (e) {
      toast((e as Error).message, "err");
    }
    setBusy(false);
  };

  return (
    <div className="tool-fade">
      <div className="ws-toolbar">
        <Seg
          value={tab}
          onChange={(v) => setTab(v as "generate" | "encrypt" | "decrypt")}
          accent
          options={[
            { value: "generate", label: "Generate" },
            { value: "encrypt", label: "Encrypt" },
            { value: "decrypt", label: "Decrypt" },
          ]}
        />
        <span className="spacer" />
      </div>

      {tab === "generate" && (
        <>
          <div className="row wrap gap14" style={{ marginBottom: 14 }}>
            <div className="fld grow" style={{ minWidth: 180 }}>
              <label className="fld-label">Name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" />
            </div>
            <div className="fld grow" style={{ minWidth: 180 }}>
              <label className="fld-label">Email</label>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ada@toolbox.dev" />
            </div>
            <div className="fld grow" style={{ minWidth: 180 }}>
              <label className="fld-label">Passphrase <span className="faint">(optional)</span></label>
              <input className="input" type="password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder="protect the private key" />
            </div>
            <div className="fld" style={{ justifyContent: "flex-end" }}>
              <Btn variant="primary" icon="key" onClick={generate} disabled={busy}>{busy ? "Generating…" : "Generate"}</Btn>
            </div>
          </div>
          <div className="panes">
            <OutputPane title="Public key" value={genPub} placeholder="Public key (share this)" copyText={genPub} />
            <div className="swap-col" />
            <OutputPane title="Private key" value={genPriv} placeholder="Private key (keep secret)" copyText={genPriv} />
          </div>
        </>
      )}

      {tab === "encrypt" && (
        <>
          <div className="row wrap gap14" style={{ marginBottom: 14 }}>
            <div className="fld grow" style={{ minWidth: 280 }}>
              <label className="fld-label">Recipient public key (armored)</label>
              <textarea className="input mono" style={{ height: 90, padding: 10, resize: "vertical" }} value={recipKey} onChange={(e) => setRecipKey(e.target.value)} placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----" spellCheck={false} />
            </div>
          </div>
          <div className="panes">
            <InputPane title="Message" value={plain} onChange={setPlain} onClear={() => setPlain("")} placeholder="Secret message…" />
            <div className="swap-col">
              <button className="swap-btn" onClick={encrypt} title="Encrypt" disabled={busy || !plain || !recipKey}><Icon name="arrowRight" /></button>
            </div>
            <OutputPane title="PGP message" value={cipher} placeholder="Encrypted output appears here" />
          </div>
        </>
      )}

      {tab === "decrypt" && (
        <>
          <div className="row wrap gap14" style={{ marginBottom: 14 }}>
            <div className="fld grow" style={{ minWidth: 280 }}>
              <label className="fld-label">Your private key (armored)</label>
              <textarea className="input mono" style={{ height: 90, padding: 10, resize: "vertical" }} value={privKey} onChange={(e) => setPrivKey(e.target.value)} placeholder="-----BEGIN PGP PRIVATE KEY BLOCK-----" spellCheck={false} />
            </div>
            <div className="fld" style={{ minWidth: 180 }}>
              <label className="fld-label">Passphrase</label>
              <input className="input" type="password" value={decPass} onChange={(e) => setDecPass(e.target.value)} placeholder="if key is protected" />
            </div>
          </div>
          <div className="panes">
            <InputPane title="PGP message" value={ct} onChange={setCt} onClear={() => setCt("")} placeholder="-----BEGIN PGP MESSAGE-----" error={false} />
            <div className="swap-col">
              <button className="swap-btn" onClick={decrypt} title="Decrypt" disabled={busy || !ct || !privKey}><Icon name="arrowRight" /></button>
            </div>
            <OutputPane title="Decrypted message" value={decrypted} placeholder="Plaintext appears here" />
          </div>
        </>
      )}
    </div>
  );
}
