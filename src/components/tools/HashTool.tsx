import { useEffect, useState } from "react";
import { Icon } from "../Icon";
import { Btn } from "../ui/Btn";
import { InputPane } from "../ui/Panes";
import { FileDropZone } from "../ui/FileDropZone";
import { HashResultRow } from "../ui/HashResultRow";
import { toast } from "../ui/toast";
import { allHashes, type HashSet } from "../../lib/crypto";

const HASH_META: Record<keyof HashSet, { bits: number; color: string; note: string }> = {
  MD5: { bits: 128, color: "#ff6b7a", note: "legacy · not collision-safe" },
  "SHA-1": { bits: 160, color: "#ffc24b", note: "legacy · avoid for security" },
  "SHA-256": { bits: 256, color: "#46e08a", note: "recommended" },
  "SHA-384": { bits: 384, color: "#2fe6d2", note: "" },
  "SHA-512": { bits: 512, color: "#7fd8ff", note: "" },
};

export function HashTool() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<HashSet | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!input) {
      setHashes(null);
      return;
    }
    allHashes(input).then((h) => {
      if (!cancelled) setHashes(h);
    });
    return () => {
      cancelled = true;
    };
  }, [input]);

  const onFile = (file: File) => {
    const r = new FileReader();
    r.onerror = () => toast(`Couldn't read ${file.name}`, "err");
    r.onload = () => {
      setInput(r.result as string);
      toast(`Loaded ${file.name}`, "ok");
    };
    r.readAsText(file);
  };

  return (
    <div className="tool-fade">
      <div className="ws-toolbar">
        <span className="pill">
          <Icon name="hash" style={{ width: 13, height: 13 }} />5 algorithms, computed live
        </span>
        <span className="spacer" />
        <Btn icon="trash" variant="danger" onClick={() => setInput("")} disabled={!input}>
          Clear
        </Btn>
      </div>

      <div className="panes stack" style={{ marginBottom: 16 }}>
        <InputPane
          title="Input text"
          value={input}
          onChange={setInput}
          onClear={() => setInput("")}
          placeholder="Type or paste text to hash — every digest updates as you type…"
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <FileDropZone
          onFile={onFile}
          label="Drop a file to hash its contents"
          hint="Read locally — useful for checksum verification"
        />
      </div>

      {hashes ? (
        <div className="rows">
          {(Object.entries(hashes) as [keyof HashSet, string][]).map(([algo, val]) => {
            const m = HASH_META[algo];
            return (
              <HashResultRow
                key={algo}
                tag={algo}
                sub={`${m.bits}-bit${m.note ? " · " + m.note : ""}`}
                value={val}
                color={m.color}
                copyLabel={`Copied ${algo}`}
              />
            );
          })}
        </div>
      ) : (
        <div className="result-row" style={{ justifyContent: "center", color: "var(--text-3)", padding: 26 }}>
          Enter text above to generate hashes
        </div>
      )}
    </div>
  );
}
