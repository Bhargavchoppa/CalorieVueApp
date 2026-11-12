$ErrorActionPreference = 'Stop'
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js 20.19+ is required.' }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'npm is required.' }
Write-Host 'Installing JavaScript/native dependencies...' -ForegroundColor Cyan
npm install
Write-Host 'Checking Expo package compatibility...' -ForegroundColor Cyan
npx expo install --fix
npx expo-doctor
Write-Host 'Generating the native Android project...' -ForegroundColor Cyan
npx expo prebuild --platform android
Write-Host 'Android project generated. Open the android folder in Android Studio and run the app configuration.' -ForegroundColor Green
