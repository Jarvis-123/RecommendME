# Build APK via GitHub Actions (no Android Studio)

Follow these steps in order. Total time: ~30 minutes first time.

---

## Phase 1 — Deploy the web app to Vercel (15 min)

The APK loads your live website. Deploy first so you have a URL.

### Step 1.1 — Create a GitHub account (if needed)
Go to [github.com](https://github.com) and sign up.

### Step 1.2 — Create a new repository
1. GitHub → **+** → **New repository**
2. Name: `RecommendME`
3. Set to **Private** (keeps your code private)
4. Do **not** add README (you already have one)
5. Click **Create repository**
6. Copy the repo URL, e.g. `https://github.com/YOUR_USERNAME/RecommendME.git`

### Step 1.3 — Push your code to GitHub

Open PowerShell in your project folder and run:

```powershell
cd "c:\Users\AmitSingh\OneDrive - RateGain Travel Technologies Ltd\Desktop\Cursor\RecommendME"

git init
git add .
git commit -m "Initial commit — RecommendME app with Android build"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/RecommendME.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username. Sign in if prompted.

### Step 1.4 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → sign up with **GitHub**
2. Click **Add New…** → **Project**
3. Import your **RecommendME** repository
4. Keep default settings (Next.js auto-detected)
5. Expand **Environment Variables** and add:

| Name | Value |
|------|-------|
| `OMDB_API_KEY` | your OMDb key |
| `MOVIE_PROVIDER` | `omdb` |
| `MOVIE_REGION` | `IN` |
| `AI_PROVIDER` | `gemini` |
| `GEMINI_API_KEY` | your Gemini key (if you have one) |

6. Click **Deploy**
7. Wait ~2 minutes until status is **Ready**
8. Copy your live URL, e.g. `https://recommendme-abc123.vercel.app`

### Step 1.5 — Test the live URL
Open the Vercel URL in your phone browser. Search for a movie — confirm it works before building the APK.

---

## Phase 2 — Build APK on GitHub Actions (10 min)

### Step 2.1 — Open Actions
1. Go to your repo on GitHub
2. Click the **Actions** tab
3. If prompted to enable workflows, click **I understand my repositories, go ahead and enable them**

### Step 2.2 — Run the build workflow
1. Left sidebar → **Build Android APK**
2. Click **Run workflow** (dropdown on the right)
3. In **server_url**, paste your **Vercel URL**:
   ```
   https://recommendme-abc123.vercel.app
   ```
   No trailing slash.
4. Click green **Run workflow**

### Step 2.3 — Wait for build
1. Click the running workflow (yellow dot)
2. Click **build** job
3. Wait ~5–10 minutes (first run downloads Android SDK + Gradle)
4. Green checkmark = success

### Step 2.4 — Download the APK
1. Scroll to **Artifacts** at the bottom of the completed run
2. Click **RecommendME-debug-apk** to download a `.zip`
3. Unzip → you get **`app-debug.apk`**

---

## Phase 3 — Install on your Android phone (5 min)

### Step 3.1 — Transfer APK to phone
- Email it to yourself, or
- Google Drive / OneDrive, or
- USB cable → copy to Downloads folder

### Step 3.2 — Install
1. Open **Files** → **Downloads** → tap `app-debug.apk`
2. If asked, allow **Install unknown apps** for your file manager
3. Tap **Install**
4. Open **RecommendME**

### Step 3.3 — Verify
The app should load your Vercel site inside a native shell. Try Mood Match or Search.

---

## When you update the app later

| What changed | What to do |
|--------------|------------|
| Code / features | `git push` → Vercel auto-redeploys → APK picks up changes automatically (same URL) |
| New Vercel URL | Re-run **Build Android APK** workflow with new URL |
| API keys only | Update in Vercel dashboard → no APK rebuild needed |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Actions tab empty | Push code first; workflow file must be on `main` branch |
| Workflow fails at `npm ci` | Ensure `package-lock.json` is committed (`git add package-lock.json`) |
| White screen in APK | Wrong `server_url` — must be exact Vercel URL with `https://` |
| Vercel build fails | Check env vars; OMDB key required |
| Can't install APK | Settings → Security → allow unknown sources |
| Git push rejected | Use Personal Access Token instead of password for GitHub |

---

## Quick checklist

- [ ] GitHub repo created
- [ ] Code pushed to GitHub
- [ ] Vercel deployed with env vars
- [ ] Live URL works in browser
- [ ] Actions workflow run with Vercel URL
- [ ] APK downloaded from Artifacts
- [ ] APK installed on phone

---

## GitHub login for push (if password fails)

GitHub no longer accepts account passwords for git push.

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token** → check **repo** scope
3. Copy token
4. Use token as password when `git push` asks for credentials
