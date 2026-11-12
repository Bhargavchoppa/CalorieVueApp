#!/usr/bin/env bash
set -euo pipefail
node --version
npm install
npx expo install --fix
npx expo-doctor
npx expo prebuild --platform android
echo 'Android project generated. Open ./android in Android Studio.'
