// Test fixture: simulates a deployer (enterprise admin / Linux distro
// packager) who wants to suppress update-server calls by setting the
// ExtCheckForUpdatesOnStartup flag to false. The selector
// getCheckForUpdateOnStartup honors this regardless of the user's own
// state.settings.checkForUpdates preference, so initApp must NOT
// dispatch checkForUpdate() and no XHR should hit the update server.
//
// Used by tests/e2e/update-check.pw.e2e.js (TST93).
window.ExtIsFirstRun = false;
window.ExtCheckForUpdatesOnStartup = false;
