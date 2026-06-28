# Install Android SDK command-line tools ONLY (no Android Studio GUI)
# Run in PowerShell as Administrator: npm run android:sdk-setup

$ErrorActionPreference = "Stop"
$sdkRoot = "$env:LOCALAPPDATA\Android\Sdk"
$cmdlineDir = "$sdkRoot\cmdline-tools\latest"

Write-Host "`nRecommendME — Android SDK CLI Setup`n" -ForegroundColor Cyan

# 1. Java JDK 17
Write-Host "Step 1: Checking Java JDK 17..."
try {
    java -version 2>&1 | Out-Null
    Write-Host "  Java already installed" -ForegroundColor Green
} catch {
    Write-Host "  Installing OpenJDK 17 via winget..."
    winget install --id Microsoft.OpenJDK.17 -e --accept-source-agreements --accept-package-agreements
    Write-Host "  Restart terminal after install, then re-run this script." -ForegroundColor Yellow
}

# 2. Android SDK directory
New-Item -ItemType Directory -Force -Path $sdkRoot | Out-Null

# 3. Download command-line tools
$zipUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
$zipPath = "$env:TEMP\android-cmdline-tools.zip"

if (-not (Test-Path "$cmdlineDir\bin\sdkmanager.bat")) {
    Write-Host "`nStep 2: Downloading Android command-line tools (~150 MB)..."
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing

    Write-Host "  Extracting..."
    $extractTemp = "$env:TEMP\android-cmdline-extract"
    Remove-Item -Recurse -Force $extractTemp -ErrorAction SilentlyContinue
    Expand-Archive -Path $zipPath -DestinationPath $extractTemp -Force

    New-Item -ItemType Directory -Force -Path "$sdkRoot\cmdline-tools" | Out-Null
    Move-Item -Force "$extractTemp\cmdline-tools" $cmdlineDir
    Remove-Item $zipPath -Force
    Write-Host "  Command-line tools installed" -ForegroundColor Green
} else {
    Write-Host "`nStep 2: Command-line tools already present" -ForegroundColor Green
}

# 4. Install required SDK packages
Write-Host "`nStep 3: Installing SDK packages (platform, build-tools)..."
$env:ANDROID_HOME = $sdkRoot
$env:ANDROID_SDK_ROOT = $sdkRoot

$sdkmanager = "$cmdlineDir\bin\sdkmanager.bat"
& $sdkmanager --sdk_root=$sdkRoot "platform-tools" "platforms;android-35" "build-tools;35.0.0" "platforms;android-34" "build-tools;34.0.0"

# 5. Set user environment variables permanently
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdkRoot, "User")
[Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $sdkRoot, "User")

$path = [Environment]::GetEnvironmentVariable("Path", "User")
if ($path -notlike "*$sdkRoot\platform-tools*") {
    [Environment]::SetEnvironmentVariable("Path", "$path;$sdkRoot\platform-tools;$cmdlineDir\bin", "User")
}

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "   ANDROID_HOME = $sdkRoot"
Write-Host "`nRestart your terminal, then run:"
Write-Host "   npm run android:apk`n" -ForegroundColor Yellow
