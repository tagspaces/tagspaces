window.ExtIsFirstRun = false;
window.ExtCheckForUpdatesOnStartup = false;
window.ExtUseGenerateThumbnails = true;
window.ExtAI = {
  defaultEngine: 'internalTSEngineId1',
  engines: [
    {
      id: 'internalTSEngineId1',
      engine: 'ollama',
      name: 'Olama Local',
      url: 'http://localhost:11434',
      defaultTextModel: 'llama3.2', // optional
      defaultImageModel: 'llava', // optional
      enable: true,
    },
    {
      id: 'internalTSEngineId2',
      engine: 'ollama',
      name: 'Olama Remote',
      url: 'http://192.168.178.234:11432',
      enable: false,
      /* authKey: '', // optional*/
    },
    {
      id: 'openRouterDefault', // Or generate a unique ID
      engine: 'openrouter',
      name: 'OpenRouter', // User-friendly display name
      url: 'https://openrouter.ai/api/v1', // Official OpenRouter API base URL
      // apiKey: '', // API key will be managed via settings UI, not hardcoded here
      defaultTextModel: 'gryphe/mythomax-l2-13b', // Example: Specify a popular default model
      // defaultImageModel: 'openrouter/some-image-model', // If applicable
      enable: true, // Or false by default
    },
    /*{
      type: 'chatgpt',
      name: 'ChatGpt',
      id: 'internalTSEngineId3',
      url: 'https://api.openai.com',
      apiKey: 'blablabla',
      defaultImageModel: 'chatGptInternalModelID',
      defaultTextModel: 'chatGptInternalModelID',
      enabled: false,
    },*/
  ],
};
