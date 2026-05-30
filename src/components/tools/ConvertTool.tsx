import { useMemo, useState } from "react";
import { Seg } from "../ui/Seg";
import { Btn } from "../ui/Btn";
import { InputPane, OutputPane, SwapDivider } from "../ui/Panes";
import { toast } from "../ui/toast";

/* Generic two-pane Encode/Decode tool. Shared by URL, Hex, HTML entities,
   Unicode escape and Base58 — they only differ in the transform functions. */
export function ConvertTool(props: {
  encodeTitle: string;
  decodeTitle: string;
  encode: (s: string) => string;
  decode: (s: string) => string;
  encodePlaceholder?: string;
  decodePlaceholder?: string;
}) {
  const [dir, setDir] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      return { output: dir === "encode" ? props.encode(input) : props.decode(input), error: "" };
    } catch (e) {
      return { output: "", error: (e as Error).message || "Conversion failed" };
    }
  }, [dir, input, props]);

  const swap = () => {
    if (!output) return;
    setInput(output);
    setDir((d) => (d === "encode" ? "decode" : "encode"));
    toast("Swapped encode ↔ decode", "info");
  };

  return (
    <div className="tool-fade">
      <div className="ws-toolbar">
        <Seg
          value={dir}
          onChange={(v) => setDir(v as "encode" | "decode")}
          accent
          options={[
            { value: "encode", label: "Encode", icon: "upload" },
            { value: "decode", label: "Decode", icon: "download" },
          ]}
        />
        <span className="spacer" />
        <Btn icon="trash" variant="danger" onClick={() => setInput("")} disabled={!input}>
          Clear
        </Btn>
      </div>
      <div className="panes">
        <InputPane
          title={dir === "encode" ? props.encodeTitle : props.decodeTitle}
          value={input}
          onChange={setInput}
          onClear={() => setInput("")}
          placeholder={dir === "encode" ? props.encodePlaceholder : props.decodePlaceholder}
          error={!!error}
        />
        <SwapDivider onSwap={swap} />
        <OutputPane title={dir === "encode" ? props.decodeTitle : props.encodeTitle} value={error ? "" : output} error={error} />
      </div>
    </div>
  );
}
