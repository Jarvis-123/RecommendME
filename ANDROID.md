# RecommendME — Android App Build Guide

Turn RecommendME into a standalone Android APK.

## Build WITHOUT Android Studio

You have **3 options** — pick what fits you:

---

### Option 1: GitHub Actions (easiest — zero local install)

No Java, no SDK, no Android Studio on your PC. GitHub builds the APK in the cloud.

1. Push this project to GitHub
2. Go to **Actions** → **Build Android APK** → **Run workflow**
3. Enter your app URL:
   - **Production:** `https://your-app.vercel.app` (deploy first)
   - **Dev testing:** `http://YOUR_PC_IP:3000` (PC running `npm run dev`)
4. Wait ~5 minutes → download **RecommendME-debug-apk** from Artifacts
5. Copy APK to phone → install (enable "Install unknown apps")

---

### Option 2: Command line on your PC (no Android Studio GUI)

Install only the **SDK command-line tools** (~150 MB, not the full 1 GB Studio).

**One-time setup (PowerShell as Admin):**
```powershell
npm run android:sdk-setup
```
Restart terminal, then:

```powershell
# Point APK to your deployed app or local dev server
$env:CAPACITOR_SERVER_URL="https://your-app.vercel.app"
npm run android:apk
```

APK output: **`dist/RecommendME-debug.apk`**

**Manual SDK install (if script fails):**
```powershell
winget install Microsoft.OpenJDK.17
# Download command-line tools: https://developer.android.com/studio#command-line-tools-only
```

---

### Option 3: Android Studio (optional GUI)

Only if you prefer a visual IDE. See original steps below.

---

## How the APK works

The APK is a native shell that loads your RecommendME web app from a URL:

| URL type | Example | When |
|----------|---------|------|
| Production | `https://recommendme.vercel.app` | Share with anyone |
| Dev | `http://192.168.1.5:3000` | Test while `npm run dev` runs |

API keys stay on the server (Vercel) — not embedded in the APK.

---

## Deploy web app first (for production APK)

```bash
# Push to GitHub, connect to Vercel, add env vars:
# OMDB_API_KEY, GEMINI_API_KEY, MOVIE_REGION=IN
```

Your Vercel URL becomes the `CAPACITOR_SERVER_URL`.

---

## Useful commands

| Command | Description |
|---------|-------------|
| `npm run android:apk` | Build APK via Gradle CLI → `dist/RecommendME-debug.apk` |
| `npm run android:sdk-setup` | Install JDK + SDK tools (no Studio) |
| `npm run android:dev` | Show LAN IP for dev testing |
| `npm run cap:sync` | Sync web assets to Android project |

---

## Install APK on phone

1. Copy `dist/RecommendME-debug.apk` to phone (USB, email, Drive)
2. Open the file on Android
3. Allow **Install from unknown sources** if prompted
4. Open **RecommendME**

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Android SDK not found` | Run `npm run android:sdk-setup` OR use GitHub Actions |
| `Java not found` | `winget install Microsoft.OpenJDK.17` |
| White screen in APK | Set `CAPACITOR_SERVER_URL` to a working URL |
| Gradle build slow | First run downloads ~500MB of deps — normal |
| Module 611.js error | `Remove-Item -Recurse -Force .next` then restart dev server |

---

## App details

- **Package ID:** `com.recommendme.app`
- **App name:** RecommendME
- **Min SDK:** Android 5.1+
