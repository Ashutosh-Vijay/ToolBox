import { useState } from "react";
import { Icon } from "../Icon";
import { toast } from "./toast";

export function CopyButton({
  text,
  title = "Copy",
  onDone,
}: {
  text: string | number | null | undefined;
  title?: string;
  onDone?: string;
}) {
  const [done, setDone] = useState(false);
  const click = () => {
    if (text == null || text === "") return;
    navigator.clipboard
      ?.writeText(String(text))
      .then(() => {
        setDone(true);
        toast(onDone || "Copied to clipboard", "ok");
        setTimeout(() => setDone(false), 1200);
      })
      .catch(() => toast("Copy failed", "err"));
  };
  return (
    <button className={"copy-btn" + (done ? " done" : "")} onClick={click} title={title} aria-label={title}>
      <Icon name={done ? "check" : "copy"} />
    </button>
  );
}
