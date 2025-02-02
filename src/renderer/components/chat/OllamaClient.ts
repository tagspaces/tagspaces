import {
  Ollama,
  ListResponse,
  ModelResponse,
  ChatRequest,
  ChatResponse,
  ProgressResponse,
  StatusResponse,
} from 'ollama';

export async function getOllamaModels(
  ollama: Ollama,
): Promise<ModelResponse[]> {
  //'http://localhost:11434'
  //const ollama = new Ollama({ host: ollamaApiUrl });
  if (ollama) {
    try {
      const response: ListResponse = await ollama.list();
      if (response) {
        return response.models;
      }
    } catch (e) {
      console.log('getOllamaModels', e);
    }
  }
  return undefined;
}

export async function deleteOllamaModel(
  ollama: Ollama,
  model: string,
): Promise<string> {
  if (ollama) {
    const response: StatusResponse = await ollama.delete({ model });
    return response.status;
  }
  return '';
}

export async function pullOllamaModel(
  ollama: Ollama,
  model: string,
  progress: (part: any) => void,
): Promise<boolean> {
  if (ollama) {
    let lastPercents = 0;
    const stream = await ollama.pull({ model: model, stream: true });
    for await (const part of stream) {
      if (part.digest) {
        let percent = 0;
        if (part.completed && part.total) {
          percent = Math.round((part.completed / part.total) * 100);
        }
        if (lastPercents !== percent) {
          progress({ ...part, model });
          lastPercents = percent;
        }
        /*if (percent === 100) {
          console.log('Download completed ' + model);
        }*/
      } else {
        console.log(part.status);
        //progress(part);
      }
    }
    return true;
  }
  return false;
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
      return ollama
        .chat(msg as ChatRequest & { stream: true })
        .then(async (response) => {
          if (chatMessageHandler) {
            for await (const part of response) {
              chatMessageHandler(part.message.content);
            }
          }
          return undefined; // Return undefined for the streaming case if there's no final message content
        })
        .catch((e) => {
          console.error('newOllamaMessage error', e);
        });
    } else {
      // Handle the case where `stream` is false or undefined
      try {
        const response: ChatResponse = await ollama.chat(
          msg as ChatRequest & { stream?: false },
        );
        return response.message.content;
      } catch (e) {
        console.error('newOllamaMessage error', e);
      }
    }
  }
  return undefined;
}
