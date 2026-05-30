import { useEffect } from "react";
import { Icon } from "./Icon";
import { Btn } from "./ui/Btn";
import { toast } from "./ui/toast";
import { APP_VERSION, APP_AUTHOR, APP_TAGLINE, GITHUB_REPO } from "../version";
import { LIVE_COUNT } from "../lib/tools";

export function AboutModal({ onClose, onCheckUpdate }: { onClose: () => void; onCheckUpdate: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const repoUrl = `https://github.com/${GITHUB_REPO}`;
  const openRepo = () => {
    window.open(repoUrl, "_blank");
    toast("Opening GitHub…", "info");
  };

  return (
    <div className="cmdk-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()} style={{ paddingTop: "10vh" }}>
      <div className="cmdk" role="dialog" aria-label="About ToolBox" style={{ width: "min(440px, 92vw)", padding: 22 }}>
        <div className="about-art"><Icon name="grid" strokeWidth={2.2} /></div>
        <div className="about-name">Tool<b>Box</b></div>
        <div className="about-ver"><span className="pill accent"><span className="pdot" />v{APP_VERSION}</span></div>
        <div className="about-desc">{APP_TAGLINE}</div>

        <div className="about-rows">
          <div className="about-row"><span className="ar-k">Made by</span><span className="ar-v">{APP_AUTHOR}</span></div>
          <div className="about-row"><span className="ar-k">Tools</span><span className="ar-v">{LIVE_COUNT} utilities · 100% offline · no telemetry</span></div>
          <div className="about-row"><span className="ar-k">Source</span><span className="ar-v link" onClick={openRepo}>github.com/{GITHUB_REPO}</span></div>
          <div className="about-row"><span className="ar-k">Privacy</span><span className="ar-v">Everything runs locally — your data never leaves this machine.</span></div>
        </div>

        <div className="about-foot">
          <Btn icon="refresh" onClick={onCheckUpdate}>Check for updates</Btn>
          <Btn variant="primary" icon="check" onClick={onClose}>Close</Btn>
        </div>
      </div>
    </div>
  );
}
