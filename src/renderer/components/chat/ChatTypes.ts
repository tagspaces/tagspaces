export type AIProviders = 'ollama' | 'node-lama' | 'chatgpt';
export type ChatRole = 'user' | 'system' | 'assistant' | 'tool';
export type ChatMode =
  | 'summary'
  | 'helpful'
  | 'rephrase'
  | 'description'
  | 'tags';

export type AIProvider = {
  id: string;
  engine: AIProviders;
  name: string;
  enable: boolean;
  url: string;
  alive?: boolean;
  defaultImageModel?: string;
  defaultTextModel?: string;
};

export type Model = {
  name: string;
  engine: AIProviders;
  modified_at?: string;
  size?: number;
  digest?: string;
  details?: ModelDetails;
};

export type ChatItem = {
  request: string;
  response?: string;
  timestamp: number;
  role: ChatRole;
  imagePaths?: string[];
  modelName: string;
  engine: AIProviders;
};

export type HistoryModel = {
  history: ChatItem[];
  lastModelName: string;
  engine: AIProviders;
};

export type ChatImage = {
  uuid: string;
  path: string;
  base64?: string;
};

export type ModelDetails = {
  format: string;
  family?: string;
  families?: string | null;
  parameter_size?: string;
  quantization_level?: string;
};

export type PullModelResponse = {
  name: string;
  total: string;
  completed: string;
  status: string;
};
