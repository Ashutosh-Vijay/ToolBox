import { CopyButton } from "./CopyButton";

/* One algorithm row: colored bar + label/sub + hash value + copy button. */
export function HashResultRow({
  tag,
  sub,
  value,
  color,
  copyLabel,
}: {
  tag: string;
  sub?: string;
  value: string;
  color?: string;
  copyLabel?: string;
}) {
  return (
    <div className="result-row">
      {color && <span className="rr-bar" style={{ background: color }} />}
      <span className="rr-tag">
        {tag}
        {sub && <span className="sub">{sub}</span>}
      </span>
      <span className="rr-val">{value}</span>
      <span className="rr-acts">
        <CopyButton text={value} onDone={copyLabel} />
      </span>
    </div>
  );
}
