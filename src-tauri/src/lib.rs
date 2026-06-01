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

/// Read the Windows system proxy (the one the browser uses) from the registry,
/// so the updater can get out through a corporate proxy. None = go direct.
#[cfg(windows)]
fn system_proxy() -> Option<String> {
    use winreg::enums::HKEY_CURRENT_USER;
    use winreg::RegKey;
    let key = RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey("Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings")
        .ok()?;
    let enable: u32 = key.get_value("ProxyEnable").ok()?;
    if enable == 0 {
        return None;
    }
    let server: String = key.get_value("ProxyServer").ok()?;
    if server.trim().is_empty() {
        return None;
    }
    // "host:port"  or  "http=host:port;https=host:port"
    let pick = if server.contains('=') {
        server.split(';').find_map(|p| {
            let p = p.trim();
            p.strip_prefix("https=").or_else(|| p.strip_prefix("http=")).map(str::to_string)
        })?
    } else {
        server.trim().to_string()
    };
    Some(if pick.starts_with("http") { pick } else { format!("http://{pick}") })
}
#[cfg(not(windows))]
fn system_proxy() -> Option<String> {
    None
}

/// Build an HTTP client that behaves like the user's browser: OS certificate
/// store (native TLS) + system proxy. Falls back to env-var proxies / direct.
fn http_client() -> Result<reqwest::Client, String> {
    let mut b = reqwest::Client::builder()
        .user_agent("ToolBox-Updater")
        .timeout(std::time::Duration::from_secs(25));
    if let Some(p) = system_proxy() {
        if let Ok(proxy) = reqwest::Proxy::all(&p) {
            b = b.proxy(proxy);
        }
    }
    b.build().map_err(|e| e.to_string())
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
    let client = http_client()?;
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

    let client = http_client()?;
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
