import type { ReactNode } from "react";
import { Icon } from "../Icon";
import { CopyButton } from "./CopyButton";

/* The TwoPane pattern is composed from these primitives: an InputPane on the
   left, a SwapDivider in the middle, and an OutputPane on the right — wrapped
   in <div className="panes">. Each pane shows a char/line counter in its foot. */

export function InputPane({
  title = "Input",
  value,
  onChange,
  placeholder,
  meta,
  extraActions,
  onClear,
  error,
}: {
  title?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  meta?: ReactNode;
  extraActions?: ReactNode;
  onClear?: () => void;
  error?: boolean;
}) {
  return (
    <div className={"pane in" + (error ? " err" : "")}>
      <div className="pane-head">
        <span className="pane-title">
          <span className="dot" />
          {title}
        </span>
        {meta && <span className="meta">{meta}</span>}
        <span className="acts">
          {extraActions}
          {value ? (
            <button className="copy-btn" onClick={onClear} title="Clear">
              <Icon name="x" />
            </button>
          ) : null}
        </span>
      </div>
      <div className="pane-body">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
        />
      </div>
      <div className="pane-foot">
        <span>{value.length.toLocaleString()} chars</span>
        {value && (
          <>
            <span className="sep" />
            <span>{value.split(/\n/).length} lines</span>
          </>
        )}
      </div>
    </div>
  );
}

export function OutputPane({
  title = "Output",
  value,
  placeholder = "Output appears here",
  meta,
  error,
  children,
  copyText,
  footExtra,
}: {
  title?: string;
  value?: string;
  placeholder?: string;
  meta?: ReactNode;
  error?: string;
  children?: ReactNode;
  copyText?: string | false;
  footExtra?: ReactNode;
}) {
  const has = value != null && value !== "";
  return (
    <div className={"pane out" + (error ? " err" : "")}>
      <div className="pane-head">
        <span className="pane-title">
          <span className="dot" />
          {title}
        </span>
        {meta && <span className="meta">{meta}</span>}
        <span className="acts">
          {has && copyText !== false && <CopyButton text={copyText != null ? copyText : value} />}
        </span>
      </div>
      <div className="pane-body">
        {children ? (
          children
        ) : (
          <pre className={"out-area" + (has ? "" : " empty")}>{has ? value : placeholder}</pre>
        )}
      </div>
      <div className="pane-foot">
        {error ? (
          <span className="bad">
            <Icon name="alert" />
            {error}
          </span>
        ) : has ? (
          <span className="ok">
            <Icon name="check" />
            Done · {String(value).length.toLocaleString()} chars
          </span>
        ) : (
          <span>Idle</span>
        )}
        {footExtra && (
          <>
            <span className="sep" />
            {footExtra}
          </>
        )}
      </div>
    </div>
  );
}

export function SwapDivider({ onSwap }: { onSwap: () => void }) {
  return (
    <div className="swap-col">
      <button className="swap-btn" onClick={onSwap} title="Swap input / output">
        <Icon name="swap" />
      </button>
    </div>
  );
}
