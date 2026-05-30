import { Icon } from "../Icon";

export type SegOption = { value: string; label: string; icon?: string };

export function Seg({
  value,
  onChange,
  options,
  accent,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SegOption[];
  accent?: boolean;
}) {
  return (
    <div className={"seg" + (accent ? " accent" : "")}>
      {options.map((o) => (
        <button key={o.value} className={value === o.value ? "on" : ""} onClick={() => onChange(o.value)}>
          {o.icon && <Icon name={o.icon} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}
