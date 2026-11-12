# Offline acceptance checklist

- [ ] Install npm dependencies and run Expo Doctor.
- [ ] Generate `android/` using Expo Prebuild.
- [ ] Sync/build in Android Studio.
- [ ] Complete onboarding with airplane mode enabled.
- [ ] Confirm profile and calculated targets survive app restart.
- [ ] Add a manual meal and verify daily totals.
- [ ] Delete a meal and verify daily totals rollback correctly.
- [ ] Import a compatible GGUF + matching mmproj pair.
- [ ] Run food image inference in airplane mode.
- [ ] Run watch screenshot inference in airplane mode.
- [ ] Verify invalid/unreadable output is rejected, not saved as zeros.
- [ ] Verify three-scan quota; failed inference does not consume quota.
- [ ] Verify images, thumbnails, and SQLite data persist after force-stop/restart.
- [ ] Inspect Android network traffic to confirm no Gemini/Supabase/backend calls.
