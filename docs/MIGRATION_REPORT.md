# CalorieVue migration report

## Source audit
The supplied archive was a hybrid project: a Vite/React DOM application, an Expo Router shell, and a separate Kotlin/Compose WebView wrapper. The Expo shell still imported Supabase auth, while the main web application used Supabase CRUD/storage and Gemini image analysis/coach services. The Android Gradle task built a Vite bundle and copied it into WebView assets; it was not a React Native Android application.

## Removed from the native runtime
- `@google/genai`, Gemini service and Gemini environment-key wiring.
- `@supabase/supabase-js`, Supabase client/configuration, auth/session routing and remote CRUD.
- React DOM, Vite, Recharts web implementation, Stripe web SDK and Capacitor wrapper.
- Remote video background from the native welcome screen.

## Implemented native application
- Expo Router + React Native + NativeWind v4 configuration.
- Local profile onboarding and editable profile.
- Deterministic Mifflin–St Jeor calorie and macro targets.
- SQLite profile, meal, daily totals, watch-analysis and scan quota tables.
- Atomic meal + daily-total insert/delete transactions.
- Three-scan daily quota with reservation/commit/release.
- Native image selection/camera capture, image processing and permanent local file cache.
- Local vision runtime integration using `llama.rn`, multimodal projector loading, strict JSON validation, and local model import/download manager.
- Native dashboard chart via react-native-gifted-charts.
- Local rule-based nutrition coach (not a generative AI service).

## Intentionally not included
- Cloud accounts, Supabase auth, remote sync, password reset, OAuth.
- Stripe checkout, subscriptions and remote entitlement validation.
- Bundled GGUF weights. These are large, model-license-dependent files and must be imported/downloaded as a verified matching pair.

## Build caveat
The current build environment did not have network access to npm registries or Android SDK/Gradle artifacts. Therefore dependencies and native binaries could not be installed here, Expo prebuild could not be executed, and an APK could not be compiled in this environment. Run the commands in README on a machine with Android Studio/SDK and network access for initial dependency setup. This is a source/config migration package, not a verified APK.
