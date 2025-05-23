import {
  AIProvider,
  ChatRequest, // Used in newOpenRouterMessage
  Message, // Used to type messages within ChatRequest
  ModelResponse, 
} from './ChatTypes'; // Adjust path as necessary

// Define a type for the response from OpenRouter's model endpoint
// (e.g., https://openrouter.ai/api/v1/models)
interface OpenRouterModel {
  id: string;
  name?: string;
  description?: string;
  pricing?: {
    prompt: string;
    completion: string;
  };
  context_length?: number;
  architecture?: {
    modality: string;
    tokenizer: string;
    instruct_type: string | null;
  };
  top_provider?: {
    max_completion_tokens: number | null;
    is_moderated: boolean;
  };
  // Add other relevant fields from the API response
}

interface OpenRouterModelResponse {
  data: OpenRouterModel[];
}


export class OpenRouterClient {
  private providerConfig: AIProvider;

  constructor(providerConfig: AIProvider) {
    this.providerConfig = providerConfig;
  }

  private getApiUrl(): string {
    return this.providerConfig.url.endsWith('/')
      ? this.providerConfig.url
      : `${this.providerConfig.url}/`;
  }

  private getApiKey(): string {
    if (!this.providerConfig.apiKey) {
      throw new Error('OpenRouter API key is not configured.');
    }
    return this.providerConfig.apiKey;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.getApiKey()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://tagspaces.org/', // Or your app's URL
      'X-Title': 'TagSpaces', // Or your app's name
    };
  }

  async getOpenRouterModels(): Promise<ModelResponse[]> {
    const apiUrl = `${this.getApiUrl()}models`;
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          // As per OpenRouter docs, /models endpoint does not require auth.
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        console.error('Failed to fetch OpenRouter models:', errorData);
        throw new Error(`Failed to fetch models: ${errorData.message || response.statusText}`);
      }

      const modelData: OpenRouterModelResponse = await response.json();

      return modelData.data.map((model) => ({
        name: model.id, 
        details: { 
          // Example: you can populate these from model.architecture or model.top_provider if needed
          // parameter_size: model.architecture?.modality, // This is just an example
          // quantization_level: model.top_provider?.max_completion_tokens?.toString(), // Example
        }
      }));
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error);
      throw error;
    }
  }

  async newOpenRouterMessage(
    request: ChatRequest, // Using ChatRequest as defined in the prompt
    chatMessageHandler?: (contentChunk: string, isLastChunk: boolean, error?: Error) => void
  ): Promise<string | undefined> {
    const apiUrl = `${this.getApiUrl()}chat/completions`;
    const headers = this.getHeaders();

    const openRouterRequest = {
      model: request.model,
      messages: request.messages.map((msg: Message) => ({ // Explicitly typing msg as Message
        role: msg.role,
        content: msg.content,
      })),
      stream: request.stream,
      temperature: request.temperature,
      max_tokens: request.max_tokens,
      top_p: request.top_p,
      // Other OpenRouter specific parameters can be added if they are part of ChatRequest
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(openRouterRequest),
      });

      if (!response.ok) {
        let errorPayload: any = { message: response.statusText };
        try {
          errorPayload = await response.json();
        } catch (e) { /* Ignore if error response is not JSON */ }
        const errorMessage = errorPayload?.error?.message || errorPayload?.message || response.statusText;
        console.error('OpenRouter API error:', errorMessage, errorPayload);
        if (chatMessageHandler) {
          chatMessageHandler('', true, new Error(`API Error: ${errorMessage}`));
        }
        throw new Error(`OpenRouter API Error: ${errorMessage}`);
      }

      if (request.stream && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let content = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // Process any remaining data in buffer
            if (buffer.startsWith('data: ')) {
                const dataContent = buffer.substring('data: '.length).trim();
                if (dataContent && dataContent !== '[DONE]') {
                    try {
                        const json = JSON.parse(dataContent);
                        const chunkContent = json.choices?.[0]?.delta?.content;
                        if (chunkContent) {
                            content += chunkContent;
                            if (chatMessageHandler) chatMessageHandler(chunkContent, false);
                        }
                    } catch (e) {
                        console.warn('Error parsing final stream data JSON:', e, dataContent);
                    }
                }
            }
            if (chatMessageHandler) chatMessageHandler('', true);
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          
          let eolIndex;
          // SSE events are separated by double newlines
          while ((eolIndex = buffer.indexOf('\n\n')) >= 0) { 
            const line = buffer.substring(0, eolIndex).trim();
            buffer = buffer.substring(eolIndex + 2); // Consume the event including \n\n

            if (line.startsWith('data: ')) {
              const dataContent = line.substring('data: '.length).trim();
              if (dataContent === '[DONE]') {
                if (chatMessageHandler) chatMessageHandler('', true);
                return content;
              }
              try {
                const json = JSON.parse(dataContent);
                const chunkContent = json.choices?.[0]?.delta?.content;
                if (chunkContent) {
                  content += chunkContent;
                  if (chatMessageHandler) chatMessageHandler(chunkContent, false);
                }
              } catch (e) {
                console.warn('Error parsing stream data JSON:', e, dataContent);
              }
            }
          }
        }
        return content;
      } else {
        // Non-streaming response
        const responseData = await response.json();
        const messageContent = responseData.choices?.[0]?.message?.content;
        if (chatMessageHandler) {
          chatMessageHandler(messageContent || '', true);
        }
        return messageContent;
      }
    } catch (error) {
      console.error('Error in newOpenRouterMessage:', error);
      if (chatMessageHandler) {
        chatMessageHandler('', true, error as Error);
      }
      throw error;
    }
  }

  async checkProviderAlive(): Promise<boolean> {
    try {
      await this.getOpenRouterModels(); // Uses the already defined model fetching logic
      return true;
    } catch (error) {
      console.error('Failed provider alive check for OpenRouter:', error);
      return false;
    }
  }
}

// Example usage (for testing purposes, not part of the class itself)
/*
async function testOpenRouter() {
  const providerConfig: AIProvider = {
    id: 'openrouter-test',
    engine: 'openrouter',
    name: 'OpenRouter Test',
    enable: true,
    url: 'https://openrouter.ai/api/v1',
    apiKey: 'YOUR_OPENROUTER_API_KEY', // Replace with a test key
    defaultTextModel: 'gryphe/mythomax-l2-13b',
  };

  const client = new OpenRouterClient(providerConfig);

  // Test 1: Get Models
  try {
    console.log('Fetching models...');
    const models = await client.getOpenRouterModels();
    console.log('Available Models:', models.slice(0, 5)); // Log first 5 models
  } catch (error) {
    console.error('Error fetching models:', error);
  }

  // Test 2: Send a non-streaming chat message
  try {
    console.log('\nSending non-streaming message...');
    const request: ChatRequest = {
      model: providerConfig.defaultTextModel!,
      messages: [{ role: 'user', content: 'Hello, who are you?', timestamp: Date.now(), engine: 'openrouter', modelName: providerConfig.defaultTextModel! } as Message], // Ensure Message type compatibility
      stream: false,
      // Optional params if your ChatRequest and Message types support them
      // temperature: 0.7, 
      // max_tokens: 100,
    };
    const response = await client.newOpenRouterMessage(request);
    console.log('Non-streaming Response:', response);
  } catch (error) {
    console.error('Error sending non-streaming message:', error);
  }

  // Test 3: Send a streaming chat message
  try {
    console.log('\nSending streaming message...');
    const requestStream: ChatRequest = {
      model: providerConfig.defaultTextModel!,
      messages: [{ role: 'user', content: 'Tell me a short story about a brave explorer.', timestamp: Date.now(), engine: 'openrouter', modelName: providerConfig.defaultTextModel! } as Message], // Ensure Message type
      stream: true,
    };
    let fullStreamedContent = '';
    await client.newOpenRouterMessage(requestStream, (chunk, isLast, err) => {
      if (err) {
        console.error('Stream error:', err);
        return;
      }
      if (chunk) {
        process.stdout.write(chunk); 
        fullStreamedContent += chunk;
      }
      if (isLast) {
        console.log('\nStream finished.');
        // console.log('Full streamed content:', fullStreamedContent);
      }
    });
  } catch (error) {
    console.error('Error sending streaming message:', error);
  }

   // Test 4: Check provider alive
  try {
    console.log('\nChecking provider alive...');
    const isAlive = await client.checkProviderAlive();
    console.log('Provider alive:', isAlive);
  } catch (error) {
    console.error('Error checking provider alive:', error);
  }
}

// testOpenRouter(); // Uncomment to run test (ensure API key is set and Message fields are correctly populated)
*/
