import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Icon } from "./Icon";
import { Btn } from "./ui/Btn";
import { toast } from "./ui/toast";
import { setUpdateChecker } from "../lib/updater";
import { APP_VERSION, GITHUB_REPO } from "../version";

type UpdateInfo = { version: string; notes: string };
type Phase = "idle" | "available" | "downloading";

const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
const MANIFEST_URL = `https://github.com/${GITHUB_REPO}/releases/latest/download/latest.json`;
const EXE_URL = `https://github.com/${GITHUB_REPO}/releases/latest/download/ToolBox.exe`;

export function Updater() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [info, setInfo] = useState<UpdateInfo | null>(null);
  const [pct, setPct] = useState(0);
  const checking = useRef(false);

  // download progress events from Rust
  useEffect(() => {
    if (!isTauri) return;
    const un = listen<{ downloaded: number; total: number }>("update-progress", (e) => {
      const { downloaded, total } = e.payload;
      setPct(total > 0 ? Math.round((downloaded / total) * 100) : 0);
    });
    return () => {
      un.then((f) => f());
    };
  }, []);

  // register the manual-check trigger + run one silent check on launch
  useEffect(() => {
    const check = async (manual: boolean) => {
      if (!isTauri || checking.current) return;
      checking.current = true;
      try {
        const found = await invoke<UpdateInfo | null>("check_update", { manifestUrl: MANIFEST_URL, current: APP_VERSION });
        if (found) {
          setInfo(found);
          setPhase("available");
        } else if (manual) {
          toast("You're on the latest version", "ok");
        }
      } catch {
        // offline / blocked / no release yet — stay silent on auto, notify on manual
        if (manual) toast("Couldn't reach GitHub — check your network or download from the Releases page", "err");
      } finally {
        checking.current = false;
      }
    };
    setUpdateChecker(check);
    const t = setTimeout(() => check(false), 2500); // silent check shortly after launch
    return () => {
      clearTimeout(t);
      setUpdateChecker(null);
    };
  }, []);

  const download = async () => {
    setPhase("downloading");
    setPct(0);
    try {
      await invoke("install_update", { exeUrl: EXE_URL });
      // on success the app relaunches; this line is usually not reached
    } catch (e) {
      setPhase("available");
      toast("Update failed: " + (e as string), "err");
    }
  };

  if (phase === "idle" || !info) return null;

  return (
    <div className="update-card">
      <div className="uc-head">
        <Icon name={phase === "downloading" ? "download" : "refresh"} />
        {phase === "downloading" ? `Updating to v${info.version}…` : `Update available · v${info.version}`}
      </div>
      <div className="uc-sub">{phase === "downloading" ? `${pct}% — the app will restart automatically` : info.notes || "A new version is ready to install."}</div>
      {phase === "downloading" ? (
        <div className="uc-bar"><div className="uc-fill" style={{ width: `${pct}%` }} /></div>
      ) : (
        <div className="uc-actions">
          <Btn size="sm" onClick={() => setPhase("idle")}>Later</Btn>
          <Btn size="sm" variant="primary" icon="download" onClick={download}>Download &amp; install</Btn>
        </div>
      )}
    </div>
  );
}
