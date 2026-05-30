/* Tiny global toast bus — fire `toast(msg)` from anywhere; <ToastHost/> renders. */
export type ToastType = "ok" | "err" | "info";
export type ToastItem = { id: number; msg: string; type: ToastType; out?: boolean };

const listeners = new Set<(t: ToastItem) => void>();
let nextId = 0;

export function toast(msg: string, type: ToastType = "ok") {
  const t: ToastItem = { id: ++nextId, msg, type };
  listeners.forEach((fn) => fn(t));
}

export function subscribeToasts(fn: (t: ToastItem) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
