/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2024-present TagSpaces GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

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
  //alive?: boolean;
  defaultImageModel?: string;
  defaultTextModel?: string;
};

/*export type Model = {
  name: string;
  engine: AIProviders;
  modified_at?: string;
  size?: number;
  digest?: string;
  details?: ModelDetails;
};*/

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
  model: string;
  total: string;
  completed: string;
  status: string;
};
