/**
 * Build Android APK from command line — no Android Studio needed.
 * Requires: Java JDK 17 + Android SDK (command-line tools only).
 *
 * Usage: npm run android:apk
 */
const { execSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const root = path.join(__dirname, "..");
const androidDir = path.join(root, "android");
const apkOut = path.join(androidDir, "app", "build", "outputs", "apk", "debug", "app-debug.apk");
const distDir = path.join(root, "dist");

function findAndroidSdk() {
  const candidates = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    path.join(os.homedir(), "Android", "Sdk"),
    path.join(os.homedir(), "AppData", "Local", "Android", "Sdk"),
    "C:\\Android\\sdk",
  ].filter(Boolean);

  for (const c of candidates) {
    if (fs.existsSync(path.join(c, "platform-tools"))) return c;
  }
  return null;
}

function findJava() {
  try {
    execSync("java -version", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function writeLocalProperties(sdkPath) {
  const propsPath = path.join(androidDir, "local.properties");
  const content = `sdk.dir=${sdkPath.replace(/\\/g, "/")}\n`;
  fs.writeFileSync(propsPath, content);
  console.log(`✓ Wrote local.properties → ${sdkPath}`);
}

function main() {
  console.log("\n🔨 RecommendME — CLI APK Builder\n");

  if (!fs.existsSync(androidDir)) {
    console.error("❌ android/ folder missing. Run: npm run android:setup");
    process.exit(1);
  }

  const sdk = findAndroidSdk();
  if (!sdk) {
    console.error("❌ Android SDK not found.\n");
    console.log("Option A — No install at all (recommended):");
    console.log("  Push to GitHub → Actions → 'Build Android APK' → download artifact\n");
    console.log("Option B — Install SDK only (no Android Studio):");
    console.log("  npm run android:sdk-setup\n");
    process.exit(1);
  }

  if (!findJava()) {
    console.error("❌ Java JDK 17 not found.\n");
    console.log("Install with: winget install Microsoft.OpenJDK.17");
    console.log("Or run GitHub Actions build (no Java needed locally).\n");
    process.exit(1);
  }

  writeLocalProperties(sdk);

  // Sync Capacitor if server URL set
  if (process.env.CAPACITOR_SERVER_URL) {
    console.log(`✓ Server URL: ${process.env.CAPACITOR_SERVER_URL}`);
    execSync("npx cap sync android", {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    });
  } else {
    console.log("⚠ CAPACITOR_SERVER_URL not set — APK will show loading shell only.");
    console.log("  Set it to your Vercel URL or LAN dev server before building.\n");
    execSync("npx cap sync android", { cwd: root, stdio: "inherit" });
  }

  execSync("node scripts/patch-android.js", { cwd: root, stdio: "inherit" });

  console.log("\n⏳ Building APK (first run downloads Gradle — may take 5-10 min)...\n");

  const gradlew = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
  const result = spawnSync(gradlew, ["assembleDebug"], {
    cwd: androidDir,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, ANDROID_HOME: sdk, ANDROID_SDK_ROOT: sdk },
  });

  if (result.status !== 0) {
    console.error("\n❌ Build failed.");
    process.exit(1);
  }

  if (!fs.existsSync(apkOut)) {
    console.error("❌ APK not found at expected path.");
    process.exit(1);
  }

  fs.mkdirSync(distDir, { recursive: true });
  const dest = path.join(distDir, "RecommendME-debug.apk");
  fs.copyFileSync(apkOut, dest);

  const sizeMb = (fs.statSync(dest).size / 1024 / 1024).toFixed(1);
  console.log(`\n✅ APK built successfully!`);
  console.log(`   📦 ${dest}`);
  console.log(`   Size: ${sizeMb} MB`);
  console.log(`\nInstall on phone: copy APK → open on Android → allow unknown sources\n`);
}

main();
