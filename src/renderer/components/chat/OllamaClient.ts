import { Ollama, ListResponse, ModelResponse } from 'ollama/dist/browser';

export async function getOllamaModels(ollamaApiUrl): Promise<ModelResponse[]> {
  //'http://localhost:11434'
  const ollama = new Ollama({ host: ollamaApiUrl });
  const response: ListResponse = await ollama.list();
  if (response) {
    return response.models;
  }
  return [];
}
