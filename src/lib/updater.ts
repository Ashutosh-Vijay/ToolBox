/* Small bus so the About modal can trigger a manual update check that the
   <Updater/> component (mounted once) handles. */
type Handler = (manual: boolean) => void;
let handler: Handler | null = null;

export function setUpdateChecker(fn: Handler | null) {
  handler = fn;
}
export function requestUpdateCheck(manual = true) {
  handler?.(manual);
}
