window.ExtIsFirstRun = false;
window.ExtCheckForUpdatesOnStartup = false;
window.ExtUseGenerateThumbnails = true;
// ExtAI is defined but has no enabled engine, so getDefaultAIProvider()
// resolves to undefined and the selector path is fully deterministic
// (it ignores any redux-persisted provider). This drives the
// "no AI provider configured" guard in the AI generation dialog.
// The location is created by the spec via createPwLocation().
window.ExtAI = {
  defaultEngine: '',
  engines: [],
};
