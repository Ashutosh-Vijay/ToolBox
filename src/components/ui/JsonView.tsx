import { useMemo } from "react";
import { tokenizeJson } from "../../lib/crypto";

export function JsonView({ text }: { text: string }) {
  const tokens = useMemo(() => tokenizeJson(text), [text]);
  return (
    <pre className="code-view">
      {tokens.map((tk, i) =>
        tk.t === "ws" || tk.t === "punc" ? tk.v : <span key={i} className={"tok-" + tk.t}>{tk.v}</span>
      )}
    </pre>
  );
}
