# CalorieVue — Offline Android Edition

CalorieVue has been migrated from the supplied Google AI Studio/Vite/Supabase web application into an Expo + React Native Android application.

## Offline and privacy architecture

- **No Gemini SDK or Gemini API calls.** The `@google/genai` dependency and original Gemini service were removed.
- **No Supabase or remote database.** Supabase SDK, client files, auth/session checks, and database queries were removed. Profiles, meals, daily totals, watch metrics, and scan quota are stored in `expo-sqlite` on the device.
- **No Express/backend requirement** for nutrition logging, target calculations, history, or the local coach insights.
- **On-device vision:** `llama.rn` runs a compatible GGUF model and matching `mmproj` file locally. The app does not ship multi-gigabyte model weights. Import both files in Settings, or optionally download them from a verified HTTPS URL. After the files are present, inference is local and does not need internet access.
- **No cloud login or sync.** The previous Supabase authentication and cloud sync features are intentionally removed in this private/offline edition.
- **Subscriptions/payment:** the previous Stripe/payment and remote subscription-gating features are not included in this offline build. Do not represent the app as having active subscription billing.

## Requirements

- Node.js 20.19+ (Node 22 LTS recommended)
- npm 10+
- Android Studio with Android SDK and an Android emulator, or a physical Android device
- JDK 17 (use the JDK version required by the generated Gradle/AGP combination)
- Internet for the first dependency install and native prebuild; internet is not required for core app use after install/model setup

## Generate the Android Studio project (Windows PowerShell)

From this folder:

```powershell
npm install
npx expo install --check
npx expo-doctor
npx expo prebuild --platform android
```

Then open the generated `android` folder in Android Studio and allow Gradle sync to finish. Run the `app` configuration on an emulator or device.

Alternatively:

```powershell
npx expo run:android
```

The `android` folder is generated from Expo config so native module settings stay aligned with the installed Expo SDK. Do not edit generated native files unless necessary; prefer Expo config plugins.

## Start Metro

```powershell
npx expo start --dev-client
```

## On-device vision setup

1. Open Settings.
2. Import a multimodal GGUF language model.
3. Import the exact matching `mmproj` projector from the same model release.
4. Restart/reopen Settings if needed, then capture/select an image from Log Activity.
5. Use airplane mode to verify inference after the model files have been imported.

The app deliberately does not hard-code an unverified model download URL or pair arbitrary GGUF files. Model/projector compatibility and device RAM must be verified for the target Android device. `llama.rn` requires React Native New Architecture and a native development/build project; Expo Go is not sufficient.

## Nutrition JSON contracts

Food analysis:

```json
{
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "description": "Concise meal name"
}
```

Watch screenshot analysis:

```json
{
  "calories": 0,
  "exercise": 0,
  "stand": 0
}
```

The app validates these shapes and rejects malformed model output.

## Database behavior

- `meals` and `daily_totals` update inside one exclusive SQLite transaction.
- Daily AI scan quota is three successful/reserved scans per local calendar day, shared by food and watch scans.
- A failed inference releases its reservation.
- Food images are resized to max 384 px; watch images to max 512 px; thumbnails are center-cropped to 140 × 140 px and stored in app-private persistent storage.
- Macro targets use deterministic Mifflin–St Jeor calculations.

## Important status

This ZIP contains the Expo application source and configuration. The `android/` native project is generated locally by `npx expo prebuild --platform android` after dependencies are installed. A prebuilt APK is not included. Physical-device validation of the selected GGUF + projector pair is still required before publishing or claiming production-ready vision inference.

## Verify removal of cloud AI/database integrations

On Windows PowerShell:

```powershell
.\scripts\verify-offline.ps1
```

This checks runtime dependencies and app source for Gemini and Supabase references. The optional model download feature uses an HTTPS file URL only; it is not a database or inference API.
