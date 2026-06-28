/**
 * Patches Android project for cleartext HTTP (local dev) and network security.
 */
const fs = require("fs");
const path = require("path");

const androidDir = path.join(__dirname, "..", "android");
if (!fs.existsSync(androidDir)) {
  console.log("Android project not found. Run: npm run android:setup");
  process.exit(0);
}

const manifestPath = path.join(
  androidDir,
  "app",
  "src",
  "main",
  "AndroidManifest.xml"
);

if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, "utf8");

  if (!manifest.includes("networkSecurityConfig")) {
    manifest = manifest.replace(
      "<application",
      '<application\n        android:networkSecurityConfig="@xml/network_security_config"\n        android:usesCleartextTraffic="true"'
    );
    fs.writeFileSync(manifestPath, manifest);
    console.log("✓ Patched AndroidManifest.xml for HTTP dev server");
  }
}

const xmlDir = path.join(androidDir, "app", "src", "main", "res", "xml");
fs.mkdirSync(xmlDir, { recursive: true });

const srcConfig = path.join(__dirname, "..", "android-config", "network_security_config.xml");
const destConfig = path.join(xmlDir, "network_security_config.xml");
fs.copyFileSync(srcConfig, destConfig);
console.log("✓ Copied network_security_config.xml");

// App icon colors in styles
const valuesDir = path.join(androidDir, "app", "src", "main", "res", "values");
const colorsPath = path.join(valuesDir, "colors.xml");
if (fs.existsSync(colorsPath)) {
  let colors = fs.readFileSync(colorsPath, "utf8");
  if (!colors.includes("recommendme_primary")) {
    colors = colors.replace(
      "</resources>",
      '    <color name="recommendme_primary">#DF5F50</color>\n    <color name="recommendme_background">#0F1524</color>\n</resources>'
    );
    fs.writeFileSync(colorsPath, colors);
    console.log("✓ Updated brand colors");
  }
}

console.log("Android patch complete.");
