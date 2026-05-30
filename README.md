# ToolBox

**Offline-first, all-in-one developer & analyst toolbox.** Dark-mode-first desktop
app — 100% local, no network calls for any tool, no telemetry. Built with
**Tauri v2 + React + TypeScript + Vite + Tailwind**.

Made by **Ashutosh Vijay**.

## Tools (24)

- **Encoding** — Base64 (text + files, with file-type preview/save), URL, Hex↔Text, HTML Entities, Unicode Escape, Base58
- **Hashing** — Hash Generator (MD5/SHA-1/256/384/512), HMAC, bcrypt, CRC32
- **Crypto** — AES (CBC/GCM/CTR), JWT Decoder, RSA Keypair, PGP (generate/encrypt/decrypt)
- **Formatters** — JSON (incl. **Java/Mule `toString()` → JSON**), XML, SQL, YAML↔JSON, Text Diff
- **Generators** — UUID/Bytes, Password, Lorem Ipsum, QR Code, Regex Tester
- **Date & Time** — World Clock (IST/UTC/GMT/local + epoch s·ms + ISO/RFC, live, plus a timestamp converter)

⌘K opens a command palette. Pinned tools persist (Tauri store). Tool state survives tab switches.

## Run / build

```bash
npm install
npm run tauri dev      # desktop app with hot reload
npm run dev            # frontend only (browser; localStorage fallback)
npm run tauri build    # full bundle
npx tauri build --no-bundle   # just the standalone exe (what CI ships)
```

## Architecture

One registry drives everything: [`src/lib/tools.tsx`](src/lib/tools.tsx). Each tool is a
config object (`id, name, icon, cat, status, component`). Add a tool = drop a component
in `src/components/tools/` + one registry entry.

```
src/
  components/  layout/ tools/ ui/  + Icon, Loaders, SplashLoader, AboutModal, Updater
  lib/         crypto.ts (pure offline logic), tools.tsx (registry)
  store/       toolStore.ts (zustand, persisted via Tauri store plugin)
  styles.css   design system
src-tauri/     Rust shell + self-updater (src/lib.rs)
```

## Releases & auto-update

CI ([`.github/workflows/release.yml`](.github/workflows/release.yml)) triggers on a `v*.*.*`
git tag and publishes a GitHub Release with a **standalone `ToolBox.exe` (no installer)**, a
**zip**, and a **`latest.json`** manifest.

The app checks `latest.json` shortly after launch (silent if offline/blocked). If a newer
version exists it offers a one-click **Download & install** with a progress bar; it swaps the
running exe and relaunches automatically.

**To cut a release:** bump the version in [`src/version.ts`](src/version.ts) *and*
[`src-tauri/tauri.conf.json`](src-tauri/tauri.conf.json), commit, then:

```bash
git tag v0.1.1 && git push origin v0.1.1
```
