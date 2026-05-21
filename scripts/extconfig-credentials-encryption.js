// Extconfig used by tests/e2e/credentials-encryption-web.pw.e2e.js (TST91).
//
// The test creates its own S3 location at runtime and then exercises the
// at-rest credentials-encryption feature, so we deliberately:
//   • set `ExtSaveLocationsInBrowser=true` so the `locations` redux slice
//     is persisted on web (the encryption feature only matters then), and
//   • do NOT set `ExtLocations` — when that is set, the locations reducer
//     becomes a constant function and the test can't add/encrypt
//     credentials.
window.ExtIsFirstRun = false;
window.ExtCheckForUpdatesOnStartup = false;
window.ExtUseGenerateThumbnails = true;
window.ExtSaveLocationsInBrowser = true;
