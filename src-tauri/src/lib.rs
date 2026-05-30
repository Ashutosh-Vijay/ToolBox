use futures_util::StreamExt;
use serde::Serialize;
use std::io::Write;
use tauri::Emitter;

#[derive(Serialize, Clone)]
pub struct UpdateInfo {
    version: String,
    notes: String,
}

#[derive(Serialize, Clone)]
struct Progress {
    downloaded: u64,
    total: u64,
}

/// Parse "1.2.3" / "v1.2.3" into a comparable tuple.
fn parse_ver(v: &str) -> (u64, u64, u64) {
    let v = v.trim().trim_start_matches('v');
    let mut it = v.split('.').map(|p| p.trim().parse::<u64>().unwrap_or(0));
    (it.next().unwrap_or(0), it.next().unwrap_or(0), it.next().unwrap_or(0))
}

/// Fetch the release manifest and return update info if a newer version exists.
#[tauri::command]
async fn check_update(manifest_url: String, current: String) -> Result<Option<UpdateInfo>, String> {
    let client = reqwest::Client::builder()
        .user_agent("ToolBox-Updater")
        .timeout(std::time::Duration::from_secs(15))
        .build()
        .map_err(|e| e.to_string())?;
    let resp = client.get(&manifest_url).send().await.map_err(|e| e.to_string())?;
    if !resp.status().is_success() {
        return Err(format!("manifest HTTP {}", resp.status()));
    }
    let text = resp.text().await.map_err(|e| e.to_string())?;
    let json: serde_json::Value = serde_json::from_str(&text).map_err(|e| e.to_string())?;
    let version = json.get("version").and_then(|v| v.as_str()).unwrap_or("").to_string();
    let notes = json.get("notes").and_then(|v| v.as_str()).unwrap_or("").to_string();
    if version.is_empty() {
        return Err("manifest missing version".into());
    }
    if parse_ver(&version) > parse_ver(&current) {
        Ok(Some(UpdateInfo { version, notes }))
    } else {
        Ok(None)
    }
}

/// Download the new portable exe (emitting progress), then swap it in for the
/// running exe and relaunch. Works on Windows because a running exe can be
/// renamed; the new copy takes its place and is launched fresh.
#[tauri::command]
async fn install_update(app: tauri::AppHandle, exe_url: String) -> Result<(), String> {
    let current = std::env::current_exe().map_err(|e| e.to_string())?;
    let dir = current.parent().ok_or("no exe dir")?.to_path_buf();
    let new_path = dir.join("ToolBox-new.exe");
    let old_path = current.with_extension("old");

    let client = reqwest::Client::builder()
        .user_agent("ToolBox-Updater")
        .build()
        .map_err(|e| e.to_string())?;
    let resp = client.get(&exe_url).send().await.map_err(|e| e.to_string())?;
    if !resp.status().is_success() {
        return Err(format!("download HTTP {}", resp.status()));
    }
    let total = resp.content_length().unwrap_or(0);
    let mut file = std::fs::File::create(&new_path).map_err(|e| e.to_string())?;
    let mut downloaded: u64 = 0;
    let mut stream = resp.bytes_stream();
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?;
        file.write_all(&chunk).map_err(|e| e.to_string())?;
        downloaded += chunk.len() as u64;
        let _ = app.emit("update-progress", Progress { downloaded, total });
    }
    file.flush().map_err(|e| e.to_string())?;
    drop(file);

    // swap: rename running exe out of the way, move the new one into place
    let _ = std::fs::remove_file(&old_path);
    std::fs::rename(&current, &old_path).map_err(|e| format!("rename current: {e}"))?;
    if let Err(e) = std::fs::rename(&new_path, &current) {
        // best-effort rollback
        let _ = std::fs::rename(&old_path, &current);
        return Err(format!("install: {e}"));
    }

    let _ = app.emit("update-done", ());
    std::process::Command::new(&current).spawn().map_err(|e| e.to_string())?;
    app.exit(0);
    Ok(())
}

pub fn run() {
    // Clean up a leftover .old file from a previous self-update.
    if let Ok(exe) = std::env::current_exe() {
        let _ = std::fs::remove_file(exe.with_extension("old"));
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![check_update, install_update])
        .setup(|_app| Ok(()))
        .run(tauri::generate_context!())
        .expect("error while running ToolBox");
}
