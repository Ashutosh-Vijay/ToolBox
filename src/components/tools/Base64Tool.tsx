import { useEffect, useMemo, useState } from "react";
import { Icon } from "../Icon";
import { Seg } from "../ui/Seg";
import { Btn } from "../ui/Btn";
import { CopyButton } from "../ui/CopyButton";
import { InputPane, OutputPane, SwapDivider } from "../ui/Panes";
import { FileDropZone } from "../ui/FileDropZone";
import { toast } from "../ui/toast";
import {
  b64Encode,
  b64Decode,
  bytesToB64,
  b64ToBytes,
  downloadBlob,
  fmtBytes,
  sniffMime,
  looksBinary,
  type SniffResult,
} from "../../lib/crypto";

type Decoded =
  | { error: string }
  | { bytes: Uint8Array; sniff: SniffResult | null; binary: boolean; text: string };

const kindIcon = (k?: string) => (k === "image" ? "eye" : "file");

export function Base64Tool() {
  const [dir, setDir] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  // When a file is dropped in encode mode we keep its bytes-as-base64 here and
  // show it as the OUTPUT directly — we must NOT feed it back through encode,
  // or we'd double-encode (base64 of base64).
  const [file, setFile] = useState<{ name: string; b64: string; size: number; sniff: SniffResult | null } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const encodeOut = useMemo(() => {
    if (dir !== "encode") return "";
    if (file) return file.b64;
    if (!input) return "";
    try {
      return b64Encode(input);
    } catch {
      return "";
    }
  }, [dir, input, file]);

  const decode = useMemo<Decoded | null>(() => {
    if (dir !== "decode" || !input) return null;
    let bytes: Uint8Array;
    try {
      bytes = b64ToBytes(input);
    } catch {
      return { error: "Input is not valid Base64 — check for stray characters or wrong padding." };
    }
    const sniff = sniffMime(bytes);
    const binary = !!sniff || looksBinary(bytes);
    let text = "";
    if (!binary) {
      try {
        text = b64Decode(input);
      } catch {
        return { bytes, sniff, binary: true, text: "" };
      }
    }
    return { bytes, sniff, binary, text };
  }, [dir, input]);

  const decodeErr = decode && "error" in decode ? decode.error : "";
  const decodedFile = decode && "bytes" in decode && decode.binary ? decode : null;
  const output = dir === "encode" ? encodeOut : decode && "text" in decode ? decode.text : "";

  // The file currently shown (either an encode source or a decode result) — used
  // for the inline preview region.
  const previewFile = dir === "encode" && file ? { bytes: () => b64ToBytes(file.b64), sniff: file.sniff } : decodedFile ? { bytes: () => decodedFile.bytes, sniff: decodedFile.sniff } : null;

  const previewUrl = useMemo(() => {
    if (!showPreview || !previewFile || !previewFile.sniff) return null;
    return URL.createObjectURL(new Blob([previewFile.bytes() as BlobPart], { type: previewFile.sniff.mime }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPreview, dir, file, decodedFile]);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => setShowPreview(false), [input, dir, file]);

  const setText = (v: string) => {
    setInput(v);
    setFile(null);
  };

  const changeDir = (v: "encode" | "decode") => {
    setDir(v);
    setFile(null);
  };

  const swap = () => {
    if (!output) return; // nothing meaningful to move (e.g. a binary decode result)
    setInput(output);
    setDir((d) => (d === "encode" ? "decode" : "encode"));
    setFile(null);
    toast("Swapped encode ↔ decode", "info");
  };

  const onFile = (f: File) => {
    const reader = new FileReader();
    reader.onerror = () => toast(`Couldn't read ${f.name}`, "err");
    if (dir === "encode") {
      reader.onload = () => {
        const buf = reader.result as ArrayBuffer;
        const b64 = bytesToB64(buf);
        setFile({ name: f.name, b64, size: f.size, sniff: sniffMime(new Uint8Array(buf)) });
        setInput("");
        toast(`Encoded ${f.name}`, "ok");
      };
      reader.readAsArrayBuffer(f);
    } else {
      reader.onload = () => {
        setText(reader.result as string);
        toast(`Loaded ${f.name}`, "ok");
      };
      reader.readAsText(f);
    }
  };

  // ---- the file card shown for an encode source or a decode result ----
  const fileCard = (opts: {
    title: string;
    metaExt: string;
    label: string;
    bytesLen: number;
    canPreview: boolean;
    onSave: () => void;
    saveExt: string;
    footLabel: string;
  }) => (
    <div className="pane out">
      <div className="pane-head">
        <span className="pane-title">
          <span className="dot" />
          {opts.title}
        </span>
        <span className="meta">{opts.metaExt}</span>
      </div>
      <div className="pane-body" style={{ alignItems: "center", justifyContent: "center", padding: 22 }}>
        <div className="decoded-file">
          <span className="df-ico">
            <Icon name={kindIcon(opts.label.toLowerCase().includes("image") ? "image" : undefined)} />
          </span>
          <div className="df-title">{opts.label}</div>
          <div className="df-sub">
            {fmtBytes(opts.bytesLen)} · processed locally, never uploaded
          </div>
          <div className="df-actions">
            {opts.canPreview && (
              <Btn icon={showPreview ? "x" : "eye"} onClick={() => setShowPreview((v) => !v)}>
                {showPreview ? "Hide preview" : "Preview"}
              </Btn>
            )}
            <Btn variant="primary" icon="download" onClick={opts.onSave}>
              Save .{opts.saveExt}
            </Btn>
          </div>
          {!opts.canPreview && (
            <div className="df-note">No inline preview for this type — use Save to open it elsewhere.</div>
          )}
        </div>
      </div>
      <div className="pane-foot">
        <span className="ok">
          <Icon name="check" />
          {opts.footLabel}
        </span>
      </div>
    </div>
  );

  const saveBytes = (bytes: Uint8Array, sniff: SniffResult | null, fallbackName: string) => {
    const ext = sniff?.ext ?? "bin";
    const mime = sniff?.mime ?? "application/octet-stream";
    downloadBlob(`${fallbackName}.${ext}`, new Blob([bytes as BlobPart], { type: mime }));
    toast(`Saved ${fallbackName}.${ext}`, "ok");
  };

  return (
    <div className="tool-fade">
      <div className="ws-toolbar">
        <Seg
          value={dir}
          onChange={(v) => changeDir(v as "encode" | "decode")}
          accent
          options={[
            { value: "encode", label: "Encode", icon: "upload" },
            { value: "decode", label: "Decode", icon: "download" },
          ]}
        />
        <span className="spacer" />
        <Btn icon="trash" variant="danger" onClick={() => setText("")} disabled={!input && !file}>
          Clear
        </Btn>
      </div>

      <div style={{ marginBottom: 14 }}>
        <FileDropZone
          onFile={onFile}
          label={dir === "encode" ? "Drop any file to encode → Base64" : "Drop a text file containing Base64"}
          hint="Files are read locally in your browser — never uploaded anywhere"
        />
      </div>

      <div className="panes">
        {dir === "encode" ? (
          <>
            {file ? (
              /* encode source is a file → show it as the source, not as editable text */
              <div className="pane in">
                <div className="pane-head">
                  <span className="pane-title">
                    <span className="dot" />
                    Source file
                  </span>
                  <span className="acts">
                    <button className="copy-btn" onClick={() => setFile(null)} title="Clear">
                      <Icon name="x" />
                    </button>
                  </span>
                </div>
                <div className="pane-body" style={{ alignItems: "center", justifyContent: "center", padding: 22 }}>
                  <div className="decoded-file">
                    <span className="df-ico">
                      <Icon name={kindIcon(file.sniff?.kind)} />
                    </span>
                    <div className="df-title">{file.name}</div>
                    <div className="df-sub">
                      {file.sniff?.label ?? "Binary file"} · {fmtBytes(file.size)}
                    </div>
                    {file.sniff && file.sniff.kind !== "binary" && (
                      <div className="df-actions">
                        <Btn icon={showPreview ? "x" : "eye"} onClick={() => setShowPreview((v) => !v)}>
                          {showPreview ? "Hide preview" : "Preview"}
                        </Btn>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pane-foot">
                  <span>{file.b64.length.toLocaleString()} chars Base64</span>
                </div>
              </div>
            ) : (
              <InputPane
                title="Plain text"
                value={input}
                onChange={setText}
                onClear={() => setText("")}
                placeholder="Type or paste text to encode…  (or drop a file above)"
              />
            )}
            <SwapDivider onSwap={swap} />
            <OutputPane title="Base64" value={encodeOut} />
          </>
        ) : (
          <>
            <InputPane
              title="Base64"
              value={input}
              onChange={setText}
              onClear={() => setText("")}
              placeholder="Paste Base64 to decode…"
              error={!!decodeErr}
            />
            <SwapDivider onSwap={swap} />
            {decodedFile
              ? fileCard({
                  title: "Decoded file",
                  metaExt: decodedFile.sniff?.ext.toUpperCase() ?? "BIN",
                  label: decodedFile.sniff?.label ?? "Binary data",
                  bytesLen: decodedFile.bytes.length,
                  canPreview: !!decodedFile.sniff && decodedFile.sniff.kind !== "binary",
                  saveExt: decodedFile.sniff?.ext ?? "bin",
                  onSave: () => saveBytes(decodedFile.bytes, decodedFile.sniff, "decoded"),
                  footLabel: `${decodedFile.sniff?.label ?? "Binary data"} · ${fmtBytes(decodedFile.bytes.length)}`,
                })
              : (
                <OutputPane title="Plain text" value={decodeErr ? "" : output} error={decodeErr} />
              )}
          </>
        )}
      </div>

      {dir === "encode" && file && (
        <div style={{ marginTop: 12 }} className="row gap8">
          <CopyButton text={file.b64} onDone="Copied Base64" />
          <span className="faint" style={{ fontSize: 12 }}>
            Copy the Base64 above, or use the swap button to send it to Decode.
          </span>
        </div>
      )}

      {showPreview && previewUrl && previewFile?.sniff && (
        <div className="b64-preview">
          <div className="b64-preview-head">
            <span className="pane-title">
              <span className="dot" />
              Preview — {previewFile.sniff.label}
            </span>
            <button className="copy-btn" onClick={() => setShowPreview(false)} title="Close preview">
              <Icon name="x" />
            </button>
          </div>
          <div className="b64-preview-body">
            {previewFile.sniff.kind === "image" && <img src={previewUrl} alt={previewFile.sniff.label} />}
            {previewFile.sniff.kind === "pdf" && <iframe src={previewUrl} title="PDF preview" />}
            {previewFile.sniff.kind === "audio" && <audio src={previewUrl} controls />}
            {previewFile.sniff.kind === "video" && <video src={previewUrl} controls />}
          </div>
        </div>
      )}
    </div>
  );
}
