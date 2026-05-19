window.ExtIsFirstRun = false;
window.ExtCheckForUpdatesOnStartup = false;
window.ExtUseGenerateThumbnails = true;
// A single enabled Ollama provider pointing at a host the e2e suite
// intercepts via Playwright route() (see tests/e2e/ai.helpers.js). No real
// Ollama service is contacted. The location is created by the spec via
// createPwLocation(), so no ExtLocations here.
window.ExtAI = {
  defaultEngine: 'e2eMockEngine',
  engines: [
    {
      id: 'e2eMockEngine',
      engine: 'ollama',
      name: 'E2E Mock Ollama',
      url: 'http://127.0.0.1:11434',
      defaultTextModel: 'llama3.2',
      defaultImageModel: 'llava',
      enable: true,
    },
  ],
};
