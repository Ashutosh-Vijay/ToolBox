import { catById } from "../../lib/tools";

/* Category pill — each category carries its own hue (encoding=teal,
   hashing=violet, crypto=amber, formatters=green, generators=blue). */
export function CategoryPill({ catId }: { catId: string }) {
  const cat = catById(catId);
  return (
    <span
      className="pill"
      style={{ borderColor: "transparent", background: cat.color + "1f", color: cat.color }}
    >
      <span className="pdot" />
      {cat.name}
    </span>
  );
}
