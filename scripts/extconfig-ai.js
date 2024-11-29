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
    /*{
      type: 'chatgpt',
      name: 'ChatGpt',
      id: 'internalTSEngineId3',
      url: 'https://api.openai.com',
      apiKey: 'blablabla',
      enabled: false,
    },*/
  ],
};
