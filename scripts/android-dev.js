/**
 * Configures Capacitor to load the Next.js dev server on your LAN IP.
 * Usage: npm run android:dev
 * Then: npm run cap:sync && npm run cap:open
 */
const os = require("os");
const fs = require("fs");
const path = require("path");

const isProduction = process.argv.includes("--production");
const port = process.env.PORT || "3000";

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

const serverUrl = isProduction
  ? process.env.CAPACITOR_PRODUCTION_URL || "https://your-app.vercel.app"
  : `http://${getLocalIp()}:${port}`;

console.log(`\n📱 Capacitor server URL: ${serverUrl}\n`);
process.env.CAPACITOR_SERVER_URL = serverUrl;

const { execSync } = require("child_process");

if (isProduction) {
  console.log("Deploy to Vercel first, then set CAPACITOR_PRODUCTION_URL.\n");
} else {
  console.log("Dev mode — next steps:");
  console.log("  1. npm run dev          (separate terminal)");
  console.log("  2. npm run cap:sync");
  console.log("  3. npm run cap:open");
  console.log("  4. Run in Android Studio\n");
  console.log("Phone & PC must be on same Wi-Fi.\n");
}

// Auto-sync if android folder exists
const androidDir = path.join(__dirname, "..", "android");
if (fs.existsSync(androidDir)) {
  try {
    execSync("npx cap sync android", {
      cwd: path.join(__dirname, ".."),
      env: { ...process.env, CAPACITOR_SERVER_URL: serverUrl },
      stdio: "inherit",
    });
    execSync("node scripts/patch-android.js", {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit",
    });
  } catch {
    console.log("Sync skipped — run manually after setup.");
  }
}
