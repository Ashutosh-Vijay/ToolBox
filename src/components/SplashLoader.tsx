import { useMemoRandom } from "../lib/useMemoRandom";
import { Icon } from "./Icon";
import { LOADERS, LOADER_LABELS } from "./Loaders";

/* Full-screen splash shown while the app boots. Picks a random loader each
   launch and fades out once the app is ready. */
export function SplashLoader({ leaving }: { leaving: boolean }) {
  const idx = useMemoRandom(LOADERS.length);
  const Loader = LOADERS[idx];
  const label = LOADER_LABELS[idx];
  return (
    <div className={"splash" + (leaving ? " leaving" : "")}>
      <div className="splash-loader">
        <Loader accent="#2fe6d2" fg="#e9eef6" size={300} />
      </div>
      <div className="splash-brand">
        <span className="brand-mark"><Icon name="grid" strokeWidth={2.2} /></span>
        <span className="splash-name">Tool<b>Box</b></span>
      </div>
      <div className="splash-label">
        <em>{label}</em>
        <span className="splash-dot" />
        ready in a moment
      </div>
    </div>
  );
}
