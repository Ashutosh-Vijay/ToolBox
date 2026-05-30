import { useState } from "react";

/** Picks a random integer in [0, n) once, stable for the component's lifetime. */
export function useMemoRandom(n: number): number {
  const [v] = useState(() => Math.floor(Math.random() * n));
  return v;
}
