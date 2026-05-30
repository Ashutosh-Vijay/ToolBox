import { useEffect, useState } from "react";
import { Icon } from "../Icon";
import { subscribeToasts, type ToastItem } from "./toast";

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => {
    return subscribeToasts((t) => {
      setItems((cur) => [...cur, t]);
      setTimeout(() => setItems((cur) => cur.map((x) => (x.id === t.id ? { ...x, out: true } : x))), 2000);
      setTimeout(() => setItems((cur) => cur.filter((x) => x.id !== t.id)), 2280);
    });
  }, []);
  return (
    <div className="toast-wrap">
      {items.map((t) => (
        <div key={t.id} className={"toast " + t.type + (t.out ? " out" : "")}>
          <span className="t-ico">
            <Icon name={t.type === "ok" ? "check" : t.type === "err" ? "alert" : "info"} />
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
