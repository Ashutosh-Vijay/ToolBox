// ToolBox is, by design, 100% local. Every tool processes input in-process
// with the Web Crypto API or pure JS — there is no network code anywhere in
// this app, and this flag is the architectural statement of that contract.
export const OFFLINE_ONLY = true;

// Persistence file used by the Tauri store plugin.
export const STORE_FILE = "toolbox.json";
