import {
  Ollama,
  ListResponse,
  ModelResponse,
  ChatRequest,
  ChatResponse,
} from 'ollama';

export async function getOllamaModels(
  ollama: Ollama,
): Promise<ModelResponse[]> {
  //'http://localhost:11434'
  //const ollama = new Ollama({ host: ollamaApiUrl });
  if (ollama) {
    const response: ListResponse = await ollama.list();
    if (response) {
      return response.models;
    }
  }
  return [];
}

export async function newOllamaMessage(
  ollama: Ollama,
  msg: ChatRequest,
  chatMessageHandler?: (msgContent: string) => void,
): Promise<string | undefined> {
  //const ollama = new Ollama({ host: ollamaApiUrl });
  if (ollama) {
    if (msg.stream) {
      // Handle the case where `stream` is true
      ollama
        .chat(msg as ChatRequest & { stream: true })
        .then(async (response) => {
          if (chatMessageHandler) {
            for await (const part of response) {
              chatMessageHandler(part.message.content);
            }
          }
        });

      return undefined; // Return undefined for the streaming case if there's no final message content
    } else {
      // Handle the case where `stream` is false or undefined
      const response: ChatResponse = await ollama.chat(
        msg as ChatRequest & { stream?: false },
      );
      return response.message.content;
    }
  }
  return undefined;
}
