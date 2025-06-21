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

import AppConfig from '-/AppConfig';
import {
  AIProvider,
  ChatImage,
  ChatItem,
  ChatMode,
  ChatRole,
  HistoryModel,
  PullModelResponse,
  ChatRequest as CommonChatRequest, // Renamed to avoid conflict with Ollama's ChatRequest
  Message as CommonMessage, // Renamed
  ModelResponse, // Using our ModelResponse
} from '-/components/chat/ChatTypes';
import {
  deleteOllamaModel,
  getOllamaModels,
  newOllamaMessage,
  pullOllamaModel,
} from '-/components/chat/OllamaClient';
import { OpenRouterClient } from '-/components/chat/OpenRouterClient'; // Added import
import { generateOptionType } from '-/components/dialogs/hooks/AiGenerationDialogContextProvider';
import { useFileUploadDialogContext } from '-/components/dialogs/hooks/useFileUploadDialogContext';
import { TabNames } from '-/hooks/EntryPropsTabsContextProvider';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { usePlatformFacadeContext } from '-/hooks/usePlatformFacadeContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { Pro } from '-/pro';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import {
  actions as SettingsActions,
  getDefaultAIProvider,
  getEntryContainerTab,
  getTagColor,
  getTagTextColor,
} from '-/reducers/settings';
import { getTagColors, getTagLibrary } from '-/services/taglibrary-utils';
import { extractPDFcontent } from '-/services/thumbsgenerator';
import { toBase64Image } from '-/services/utils-io';
import {
  StructuredDataProps,
  getZodDescription,
  getZodTags,
} from '-/services/zodObjects';
import { TS } from '-/tagspaces.namespace';
import { formatDateTime } from '@tagspaces/tagspaces-common/misc';
import {
  extractFileExtension,
  getMetaDirectoryPath,
} from '@tagspaces/tagspaces-common/paths';
import {
  extractTextContent,
  getUuid,
  loadJSONString,
} from '@tagspaces/tagspaces-common/utils-io';
import { format } from 'date-fns';
import { Ollama } from 'ollama';
import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { zodToJsonSchema } from 'zod-to-json-schema';
import useFirstRender from '-/utils/useFirstRender';
import { useEditedTagLibraryContext } from '-/hooks/useEditedTagLibraryContext';

type ChatData = {
  models: ModelResponse[];
  images: ChatImage[];
  currentModel: ModelResponse | undefined;
  chatHistoryItems: ChatItem[];
  isTyping: boolean;
  checkActiveProviderModels: () => Promise<boolean>;
  refreshAIModels: (
    provider: AIProvider,
    modelName?: string,
  ) => Promise<boolean>;
  setModel: (model: ModelResponse | string) => Promise<boolean>;
  setImages: (imagesPaths: string[]) => void;
  removeImage: (uuid: string) => void;
  unloadCurrentModel: () => void;
  removeModel: (modelName: string) => void;
  findModel: (modelName: string) => ModelResponse | undefined;
  getHistoryFilePath: (name?: string) => string;
  changeCurrentModel: (
    newModelName: string,
    confirmCallback?: () => void,
  ) => Promise<boolean>;
  getModel: (modelName: string) => Promise<ModelResponse | undefined>;
  addChatHistory: (txt: string, replace?: boolean) => ChatItem[];
  newChatMessage: (
    msg?: string,
    unload?: boolean,
    role?: ChatRole,
    mode?: ChatMode,
    model?: string,
    stream?: boolean,
    images?: string[],
    includeHistory?: boolean,
  ) => Promise<any>;
  cancelMessage: () => void;
  generate: (
    fileContent: 'text' | 'image',
    mode: ChatMode,
    modelName: string,
    entry: TS.FileSystemEntry,
  ) => Promise<string>;
  initHistory: () => void;
  deleteHistory: () => Promise<boolean>;
  checkAIProviderAlive: (provider: AIProvider) => Promise<boolean>;
  getAIClient: (
    // Renamed
    provider: AIProvider,
  ) => Promise<Ollama | OpenRouterClient | undefined>;
  getEntryModel: (
    entryName: string,
    aiProvider: AIProvider,
  ) => ModelResponse | undefined;
  tagsGenerate: (
    entry: TS.FileSystemEntry,
    fromDescription?: boolean,
  ) => Promise<boolean>;
  descriptionGenerate: (
    entry: TS.FileSystemEntry,
  ) => Promise<TS.FileSystemEntry | undefined>;
  generationSettings: GenerationSettings;
  setGenerationSettings: (genSettings: any) => void;
  resetGenerationSettings: (option: generateOptionType) => void;
};

export const ChatContext = createContext<ChatData>({} as ChatData);

export type ChatContextProviderProps = {
  children: React.ReactNode;
};

export type GenerationSettings = {
  option: generateOptionType;
  maxTags: number;
  maxChars: number;
  tagsFromLibrary: boolean;
  tagGroupsIds: string[];
  fromDescription: boolean;
  structuredDataProps: StructuredDataProps;
  appendToDescription: boolean;
  appendAnalysisToDescription: boolean;
  language: string;
};

export const ChatContextProvider = ({ children }: ChatContextProviderProps) => {
  const { t } = useTranslation();
  const { showNotification } = useNotificationContext();
  const { deleteDirectory } = useIOActionsContext();
  const { addTagsToFsEntry } = useTaggingActionsContext();
  const { tagGroups } = useEditedTagLibraryContext();
  const { openFileUploadDialog } = useFileUploadDialogContext();
  const { selectedEntries } = useSelectedEntriesContext();
  const { findLocation } = useCurrentLocationContext();
  const { saveFilePromise, deleteEntriesPromise } = usePlatformFacadeContext();
  const { openedEntry } = useOpenedEntryContext();
  const models = useRef<ModelResponse[]>([]);
  const defaultAiProvider: AIProvider = useSelector(getDefaultAIProvider);
  const selectedTabName = useSelector(getEntryContainerTab);
  const defaultBackgroundColor = useSelector(getTagColor);
  const defaultTextColor = useSelector(getTagTextColor);
  const currentModel = useRef<ModelResponse | undefined>(undefined);
  const generationSettings = useRef<GenerationSettings>(
    getGenerationSettings(),
  );
  const images = useRef<ChatImage[]>([]);
  const chatHistoryItems = useRef<ChatItem[]>([]);
  const DEFAULT_QUESTION_PROMPT =
    Pro && Pro.UI ? Pro.UI.DEFAULT_QUESTION_PROMPT : false;
  const DEFAULT_SYSTEM_PROMPT =
    Pro && Pro.UI ? Pro.UI.DEFAULT_SYSTEM_PROMPT : false;
  const SUMMARIZE_PROMPT = Pro && Pro.UI ? Pro.UI.SUMMARIZE_PROMPT : false;
  const IMAGE_DESCRIPTION = Pro && Pro.UI ? Pro.UI.IMAGE_DESCRIPTION : false;
  const IMAGE_DESCRIPTION_STRUCTURED =
    Pro && Pro.UI ? Pro.UI.IMAGE_DESCRIPTION_STRUCTURED : false;
  const TEXT_DESCRIPTION = Pro && Pro.UI ? Pro.UI.TEXT_DESCRIPTION : false;
  const GENERATE_TAGS = Pro && Pro.UI ? Pro.UI.GENERATE_TAGS : false;
  const GENERATE_IMAGE_TAGS =
    Pro && Pro.UI ? Pro.UI.GENERATE_IMAGE_TAGS : false;
  const isTyping = useRef<boolean>(false);
  const aiClient = useRef<Ollama | OpenRouterClient | undefined>(undefined); // Generalized
  const dispatch: AppDispatch = useDispatch();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const currentLocation = findLocation();
  const firstRender = useFirstRender();

  useEffect(() => {
    images.current = [];
    if (
      !firstRender &&
      defaultAiProvider &&
      openedEntry &&
      !openedEntry.isFile &&
      selectedTabName === TabNames.aiTab
    ) {
      checkActiveProviderModels().then(() => initHistory()); // Updated
    }
  }, [defaultAiProvider, openedEntry, selectedTabName, firstRender]);

  function getGenerationSettings(
    option: generateOptionType = 'tags',
  ): GenerationSettings {
    const item = Pro
      ? localStorage.getItem(Pro.keys.generationSettingsKey)
      : undefined;
    const storedObj = item ? JSON.parse(item) : {};
    return {
      option: option,
      structuredDataProps: { name: true, summary: true },
      maxTags: 4,
      maxChars: undefined,
      tagsFromLibrary: false,
      fromDescription: false,
      tagGroupsIds: [],
      appendToDescription: true,
      appendAnalysisToDescription: true,
      language: 'English',
      ...storedObj,
    };
  }

  // Renamed and generalized
  async function getAIClient(
    provider: AIProvider,
  ): Promise<Ollama | OpenRouterClient | undefined> {
    if (!provider || !provider.url) {
      console.warn('AI Provider or URL is not defined:', provider);
      return undefined;
    }
    try {
      if (provider.engine === 'ollama') {
        //@ts-ignore
        const { Ollama } = await import('ollama/browser');
        return new Ollama({ host: provider.url });
      } else if (provider.engine === 'openrouter') {
        return new OpenRouterClient(provider);
      } else {
        console.error('Unknown AI engine type:', provider.engine);
        return undefined;
      }
    } catch (error) {
      console.error('Failed to load AI client module:', error);
    }
    return undefined;
  }

  function initHistory() {
    if (openedEntry) {
      if (
        !openedEntry.isFile &&
        !openedEntry.path.endsWith(AppConfig.metaFolder)
      ) {
        images.current = [];
        loadHistory().then((historyItems) => {
          chatHistoryItems.current = historyItems;
          forceUpdate();
        });
      }
    }
  }

  function getEntryModel(
    fileName: string,
    aiProvider: AIProvider,
  ): ModelResponse | undefined {
    if (fileName && aiProvider) {
      const ext = extractFileExtension(fileName).toLowerCase();
      let modelName = aiProvider.defaultTextModel;
      if (AppConfig.aiSupportedFiletypes.text.includes(ext)) {
        modelName = aiProvider.defaultTextModel;
      } else if (AppConfig.aiSupportedFiletypes.image.includes(ext)) {
        modelName = aiProvider.defaultImageModel;
      }
      if (modelName) {
        return findModel(modelName);
      }
    }
    return undefined;
  }

  function deleteHistory(): Promise<boolean> {
    const historyFilePath = getHistoryMetaDir();
    return deleteDirectory(historyFilePath).then((success) => {
      if (success) {
        chatHistoryItems.current = [];
        forceUpdate();
        return true;
      }
      return success;
    });
  }

  function loadHistory(): Promise<ChatItem[]> {
    const historyFilePath = getHistoryFilePath();
    if (currentLocation) {
      return currentLocation
        .loadTextFilePromise(historyFilePath)
        .then((jsonContent) => {
          if (jsonContent) {
            const historyModel = loadJSONString(jsonContent) as HistoryModel;
            if (historyModel) {
              if (
                defaultAiProvider &&
                historyModel.engine === defaultAiProvider.engine
              ) {
                refreshAIModels(defaultAiProvider, historyModel.lastModelName);
              } else if (defaultAiProvider) {
                refreshAIModels(defaultAiProvider);
              }
              return historyModel.history ? historyModel.history : [];
            }
          }
          return [];
        })
        .catch((e) => {
          console.log('cannot load json:' + historyFilePath, e);
          if (currentModel.current === undefined && defaultAiProvider) {
            setModel(defaultAiProvider.defaultTextModel || '');
          }
          return [];
        });
    }
    return Promise.resolve([]);
  }

  // Updated
  async function checkAIProviderAlive(provider: AIProvider): Promise<boolean> {
    const client = await getAIClient(provider);
    if (!client) {
      console.warn(`Could not initialize AI client for ${provider.name}`);
      return false;
    }

    try {
      if (client instanceof Ollama) {
        const m = await getOllamaModels(client);
        return !!m && m.length > 0;
      } else if (client instanceof OpenRouterClient) {
        return client.checkProviderAlive();
      }
    } catch (error) {
      console.error(
        `Error checking AI provider ${provider.name} aliveness:`,
        error,
      );
      return false;
    }
    return false;
  }

  // Renamed and updated
  async function checkActiveProviderModels(): Promise<boolean> {
    if (!defaultAiProvider) {
      console.warn('No default AI provider configured.');
      models.current = [];
      currentModel.current = undefined;
      aiClient.current = undefined;
      forceUpdate();
      return false;
    }

    const client = await getAIClient(defaultAiProvider);
    if (!client) {
      showNotification(
        `Failed to initialize AI client for ${defaultAiProvider.name}.`,
      );
      models.current = [];
      currentModel.current = undefined;
      aiClient.current = undefined;
      forceUpdate();
      return false;
    }
    aiClient.current = client; // Store the client for the default provider
    return refreshAIModels(defaultAiProvider);
  }

  // Renamed and generalized
  async function refreshAIModels(
    provider: AIProvider,
    modelNameToSelect?: string,
  ): Promise<boolean> {
    if (!provider) return Promise.resolve(false);

    let clientToUse = aiClient.current;
    // Re-initialize client if the provider is different from the current default,
    // or if the engine type of the current client doesn't match the provider's engine,
    // or if aiClient.current is not set (e.g. first time or after an error).
    if (
      !clientToUse ||
      (defaultAiProvider && provider.id !== defaultAiProvider.id) ||
      (clientToUse instanceof Ollama && provider.engine !== 'ollama') ||
      (clientToUse instanceof OpenRouterClient &&
        provider.engine !== 'openrouter')
    ) {
      clientToUse = await getAIClient(provider);
      if (!clientToUse) {
        console.warn('Could not get AI client for provider:', provider.name);
        models.current = [];
        if (defaultAiProvider && provider.id === defaultAiProvider.id)
          currentModel.current = undefined;
        forceUpdate();
        return false;
      }
      // If this refresh is for the default provider, update the main aiClient.current
      if (defaultAiProvider && provider.id === defaultAiProvider.id) {
        aiClient.current = clientToUse;
      }
    }

    let fetchedModels: ModelResponse[] | undefined;
    try {
      if (clientToUse instanceof Ollama) {
        fetchedModels = await getOllamaModels(clientToUse);
      } else if (clientToUse instanceof OpenRouterClient) {
        fetchedModels = await clientToUse.getOpenRouterModels();
      }

      if (fetchedModels) {
        models.current = fetchedModels;
        let modelToSet = findModel(
          modelNameToSelect || provider.defaultTextModel || '',
        );
        if (!modelToSet && fetchedModels.length > 0) {
          modelToSet = fetchedModels[0];
        }

        if (defaultAiProvider && provider.id === defaultAiProvider.id) {
          // Only set currentModel if it's for the default provider
          if (modelToSet) {
            await setModel(modelToSet);
          } else {
            currentModel.current = undefined;
          }
        }
        forceUpdate(); // Always force update to reflect changes in models.current for UI lists
        return true;
      }
      return false; // No models fetched
    } catch (error) {
      console.error(
        'Error refreshing AI models for provider ' + provider.name + ':',
        error,
      );
      models.current = [];
      if (defaultAiProvider && provider.id === defaultAiProvider.id) {
        currentModel.current = undefined;
      }
      forceUpdate();
      return false;
    }
  }

  async function setModel(m: ModelResponse | string): Promise<boolean> {
    const model = typeof m === 'string' ? findModel(m) : m;
    if (
      model &&
      (!currentModel.current || currentModel.current.name !== model.name)
    ) {
      currentModel.current = model;
      // Ensure aiClient corresponds to the model's provider engine
      if (
        defaultAiProvider &&
        model.engine &&
        defaultAiProvider.engine !== model.engine
      ) {
        console.warn(
          `Selected model ${model.name} (${model.engine}) differs from default provider engine (${defaultAiProvider.engine}). Re-initializing client.`,
        );
        const modelProviderConfig: AIProvider = {
          ...defaultAiProvider,
          id: `provider-for-${model.engine}-${model.name}`,
          name: `Provider for ${model.engine} - ${model.name}`,
          engine: model.engine as 'ollama' | 'openrouter',
          defaultTextModel: model.name,
          defaultImageModel: model.engine === 'ollama' ? model.name : undefined,
        };
        const clientForModel = await getAIClient(modelProviderConfig);
        if (clientForModel) {
          if (defaultAiProvider.engine === model.engine)
            aiClient.current = clientForModel;
        } else {
          console.error(
            "Failed to initialize AI client for model's engine:",
            model.engine,
          );
          currentModel.current = undefined;
          forceUpdate();
          return false;
        }
      } else if (!aiClient.current && defaultAiProvider) {
        const client = await getAIClient(defaultAiProvider);
        if (client) aiClient.current = client;
        else {
          console.error('Failed to initialize default AI client in setModel.');
          currentModel.current = undefined;
          forceUpdate();
          return false;
        }
      }

      forceUpdate();

      if (model.engine === 'ollama') {
        return newChatMessage(
          undefined,
          false,
          'system',
          undefined,
          model.name,
          false,
          [],
          false,
        )
          .then(() => {
            showNotification(
              `${format(new Date(), 'dd.MM.yyyy HH:mm:ss')} Model ${model.name} selected.`,
            );
            return true;
          })
          .catch(() => {
            showNotification(
              `${format(new Date(), 'dd.MM.yyyy HH:mm:ss')} Model ${model.name} selected. (Note: Initial ping failed, model might be unavailable)`,
            );
            return true;
          });
      } else {
        showNotification(
          `${format(new Date(), 'dd.MM.yyyy HH:mm:ss')} Model ${model.name} selected.`,
        );
        return Promise.resolve(true);
      }
    }
    return Promise.resolve(false);
  }

  function removeImage(uuid: string) {
    const img = images.current.find((i) => i.uuid === uuid);
    if (img) {
      images.current = images.current.filter((i) => i.uuid !== uuid);
      if (currentLocation) {
        deleteEntriesPromise(currentLocation.toFsEntry(img.path, true));
      }
      forceUpdate();
    }
  }

  function setImages(imagesPaths: string[]) {
    if (imagesPaths.length > 0 && currentLocation) {
      imagesPaths.forEach((path) => {
        currentLocation
          .getFileContentPromise(path, 'arraybuffer')
          .then((uint8Array) => {
            const base64Img = toBase64Image(uint8Array);
            if (images.current.some((i) => i.base64 === base64Img)) return;
            const imageUuid = getUuid();
            const imageHistoryPath =
              imageUuid + '.' + extractFileExtension(path);
            const image: ChatImage = {
              uuid: imageUuid,
              path: imageHistoryPath,
              base64: base64Img,
            };
            images.current = [...images.current, image];
            saveFilePromise(
              { path: getHistoryFilePath(imageHistoryPath) },
              uint8Array,
              true,
              false,
            );
            forceUpdate();
          });
      });
    }
  }

  function unloadCurrentModel() {
    if (currentModel.current && defaultAiProvider?.engine === 'ollama') {
      newChatMessage(undefined, true).then(
        () => (currentModel.current = undefined),
      );
    } else {
      currentModel.current = undefined;
      forceUpdate();
    }
  }

  async function removeModel(modelName: string) {
    if (defaultAiProvider?.engine === 'ollama') {
      const model = findModel(modelName);
      if (model && aiClient.current instanceof Ollama) {
        const result = confirm(
          'Do you want to remove ' + model.name + ' model?',
        );
        if (result) {
          showNotification('Deleting ' + model.name + '...');
          deleteOllamaModel(aiClient.current as Ollama, model.name).then(
            (response) => {
              console.log('deleteOllamaModel response:' + response);
              if (response) {
                showNotification(model.name + ' deleted successfully.');
                if (model.name === currentModel.current?.name) {
                  currentModel.current = undefined;
                }
                refreshAIModels(defaultAiProvider);
              } else {
                showNotification('Failed to delete ' + model.name);
              }
            },
          );
        }
      }
    } else {
      showNotification(
        `Model removal is not supported for ${defaultAiProvider?.engine} provider.`,
      );
    }
  }

  function findModel(modelName: string): ModelResponse | undefined {
    if (!modelName) return undefined;
    return models.current?.find(
      (m) => m.name === modelName || m.name === modelName + ':latest',
    );
  }

  async function getModel(
    modelName: string,
  ): Promise<ModelResponse | undefined> {
    if (!modelName || !defaultAiProvider) {
      return Promise.resolve(undefined);
    }
    await refreshAIModels(defaultAiProvider);
    return findModel(modelName);
  }

  async function changeCurrentModel(
    newModelName: string,
    confirmCallback?: () => void,
  ): Promise<boolean> {
    if (!defaultAiProvider) return false;

    let model = findModel(newModelName);

    if (!model && defaultAiProvider.engine === 'ollama') {
      const result = confirm(
        `Model ${newModelName} is not downloaded for Ollama. Do you want to download and install it?`,
      );
      if (result) {
        if (confirmCallback) confirmCallback();
        openFileUploadDialog(newModelName, 'downloadChatModel');

        if (!(aiClient.current instanceof Ollama)) {
          const client = await getAIClient(defaultAiProvider);
          if (!(client instanceof Ollama)) {
            showNotification(
              'Failed to initialize Ollama client for download.',
            );
            return false;
          }
          aiClient.current = client;
        }

        const onProgressHandler = (message: PullModelResponse) => {
          if (message.status) {
            dispatch(
              AppActions.onUploadProgress(
                {
                  key: message.model || message.status,
                  loaded: message.completed,
                  total: message.total,
                },
                undefined,
                message.model,
              ),
            );
          }
        };
        try {
          await pullOllamaModel(
            aiClient.current as Ollama,
            newModelName,
            onProgressHandler,
          );
          await refreshAIModels(defaultAiProvider, newModelName);
          return true;
        } catch (error) {
          console.error('Error pulling Ollama model:', error);
          showNotification(`Failed to download model ${newModelName}.`);
          return false;
        }
      } else {
        return false;
      }
    } else if (!model && defaultAiProvider.engine === 'openrouter') {
      const confirmSwitch = confirm(
        `Model ${newModelName} is not in the cached list for OpenRouter. Do you want to attempt to use it anyway?`,
      );
      if (confirmSwitch) {
        if (confirmCallback) confirmCallback();
        return setModel({
          name: newModelName,
          engine: 'openrouter',
          details: {},
        });
      }
      return false;
    } else if (model) {
      return setModel(model);
    }

    showNotification(`Model ${newModelName} not found or action cancelled.`);
    return false;
  }

  function addHistoryItem(txt: string, role: ChatRole) {
    if (txt) {
      const newItem: ChatItem = {
        engine: defaultAiProvider?.engine || 'ollama',
        modelName: currentModel.current?.name || 'unknown',
        role: role,
        request: txt,
        timestamp: new Date().getTime(),
        imagePaths: images.current.map((i) => i.path),
      };
      if (role === 'user') {
        saveHistoryItems([newItem, ...chatHistoryItems.current]);
      } else {
        chatHistoryItems.current = [newItem, ...chatHistoryItems.current];
      }
      images.current = [];
      forceUpdate();
    }
  }

  function getHistoryFilePath(name?: string) {
    const dirSeparator = currentLocation
      ? currentLocation.getDirSeparator()
      : AppConfig.dirSeparator;
    const metaFolder = openedEntry
      ? getMetaDirectoryPath(openedEntry.path, dirSeparator)
      : '';
    const fileName = name ? name : 'tsc.json';
    return (
      metaFolder + dirSeparator + AppConfig.aiFolder + dirSeparator + fileName
    );
  }

  function getHistoryMetaDir() {
    const dirSeparator = currentLocation
      ? currentLocation.getDirSeparator()
      : AppConfig.dirSeparator;
    const metaFolder = openedEntry
      ? getMetaDirectoryPath(openedEntry.path, dirSeparator)
      : '';
    return metaFolder + dirSeparator + AppConfig.aiFolder;
  }

  function saveHistoryItems(items?: ChatItem[]) {
    if (items) {
      chatHistoryItems.current = items;
    }
    if (chatHistoryItems.current.length > 0 && openedEntry) {
      const model: HistoryModel = {
        history: chatHistoryItems.current,
        lastModelName: currentModel.current?.name || '',
        engine: defaultAiProvider?.engine || 'ollama',
      };
      saveFilePromise(
        { path: getHistoryFilePath() },
        JSON.stringify(model, null, 2),
        true,
      )
        .then((fsEntry: TS.FileSystemEntry) => {
          console.log(t('core:fileCreateSuccessfully') + ' ' + fsEntry.path);
        })
        .catch((err) => {
          console.log('File creation failed', err);
        });
    }
  }

  function addTimeLineResponse(txt: string) {
    if (!chatHistoryItems.current.length) return;
    const [first, ...rest] = chatHistoryItems.current;
    if (first) {
      chatHistoryItems.current = [
        { ...first, response: (first.response || '') + txt },
        ...rest,
      ];
      forceUpdate();
    }
  }

  function addChatHistory(txt: string, replace = false): ChatItem[] {
    if (txt && chatHistoryItems.current.length > 0) {
      const firstItem = chatHistoryItems.current[0];
      if (firstItem) {
        firstItem.response =
          (!replace && firstItem.response ? firstItem.response : '') + txt;
      }
    }
    return chatHistoryItems.current;
  }

  function getProviderMessages(
    items: ChatItem[],
    modelName: string,
    providerEngine: AIProvider['engine'],
  ): CommonMessage[] {
    const messages: CommonMessage[] = [];
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (item.modelName === modelName && item.engine === providerEngine) {
        if (item.request) {
          messages.unshift({
            role: 'user',
            content: item.request,
            ...(item.imagePaths &&
            item.imagePaths.length > 0 &&
            providerEngine === 'ollama'
              ? {
                  images: images.current
                    .filter((img) => item.imagePaths?.includes(img.path))
                    .map((img) => img.base64)
                    .filter((b64) => !!b64) as string[],
                }
              : {}),
          });
        }
        if (item.response) {
          messages.unshift({
            role: 'assistant',
            content: item.response,
          });
        }
      }
    }
    return messages;
  }

  function getMessage(msg: string, mode: ChatMode) {
    if (mode === 'helpful') {
      if (DEFAULT_SYSTEM_PROMPT) {
        return DEFAULT_SYSTEM_PROMPT.replace('{question}', msg);
      }
    } else if (mode === 'summary') {
      if (SUMMARIZE_PROMPT) {
        let prompt = SUMMARIZE_PROMPT.replace('{summarize_text}', msg);
        if (
          selectedEntries &&
          selectedEntries.length > 0 &&
          selectedEntries[0]
        ) {
          prompt = prompt.replace(
            '{file_path}',
            ' of ' + selectedEntries[0].name,
          );
        } else {
          prompt = prompt.replace('{file_path}', '');
        }
        if (generationSettings.current.maxChars) {
          prompt = prompt.replace(
            '{max_chars}',
            'maximal ' +
              generationSettings.current.maxChars +
              ' characters long ',
          );
        } else {
          prompt = prompt.replace('{max_chars}', '');
        }
        if (generationSettings.current.language) {
          prompt = prompt.replace(
            '{language}',
            generationSettings.current.language,
          );
        } else {
          prompt = prompt.replace('{language}', 'native');
        }
        return prompt;
      }
    } else if (mode === 'description') {
      if (msg) {
        return TEXT_DESCRIPTION?.replace('{input_text}', msg)
          .replace(
            '{max_chars}',
            generationSettings.current.maxChars
              ? 'max ' + generationSettings.current.maxChars + ' characters'
              : '',
          )
          .replace(
            '{language}',
            generationSettings.current.language
              ? generationSettings.current.language
              : 'native',
          );
      } else {
        if (
          generationSettings.current.option === 'analyseImages' &&
          IMAGE_DESCRIPTION_STRUCTURED
        ) {
          return IMAGE_DESCRIPTION_STRUCTURED;
        }
        return IMAGE_DESCRIPTION?.replace(
          '{file_name}',
          openedEntry ? openedEntry.name : '',
        ).replace(
          '{language}',
          generationSettings.current.language
            ? generationSettings.current.language
            : 'English',
        );
      }
    } else if (mode === 'tags') {
      if (msg) {
        if (GENERATE_TAGS && openedEntry) {
          return GENERATE_TAGS.replace('{input_text}', msg);
        }
      } else {
        if (GENERATE_IMAGE_TAGS && openedEntry) {
          return GENERATE_IMAGE_TAGS;
        }
      }
    } else if (mode === 'rephrase') {
      if (DEFAULT_QUESTION_PROMPT) {
        const historyMap = chatHistoryItems.current.map((item) =>
          item.role !== 'system'
            ? `${item.request ? 'Human: ' + item.request : ''}${item.response ? ' Assistant: ' + item.response : ''}`
            : '',
        );
        return DEFAULT_QUESTION_PROMPT.replace('{question}', msg).replace(
          '{chat_history}',
          historyMap.join(' '),
        );
      }
    }
    return msg;
  }

  const chatMessageHandler = useMemo(() => {
    return (
      contentChunk: string,
      isLastChunk: boolean,
      error?: Error,
    ): void => {
      if (error) {
        console.error('Chat stream error:', error);
        showNotification(`Chat error: ${error.message}`);
        isTyping.current = false;
        forceUpdate();
        if (chatHistoryItems.current.length > 0) {
          const lastItem = chatHistoryItems.current[0];
          if (lastItem) {
            lastItem.response =
              (lastItem.response || '') + `\n\n**Error:** ${error.message}`;
            saveHistoryItems();
          }
        }
        return;
      }

      if (!isLastChunk) {
        isTyping.current = true;
        addTimeLineResponse(contentChunk);
      } else {
        isTyping.current = false;
        if (contentChunk) {
          addTimeLineResponse(contentChunk);
        }
        saveHistoryItems();
        forceUpdate();
      }
    };
  }, [chatHistoryItems, defaultAiProvider]);

  function getTagsFromLibrary(): string[] {
    const tagsFromLibrary: string[] = [];
    if (
      generationSettings.current.tagsFromLibrary &&
      generationSettings.current.tagGroupsIds.length > 0
    ) {
      generationSettings.current.tagGroupsIds.forEach((tagGroupId) => {
        const tagGroup = tagGroups.find((tg) => tg.uuid === tagGroupId);
        if (tagGroup) {
          tagsFromLibrary.push(...tagGroup.children.map((tag) => tag.title));
        }
      });
    }
    return tagsFromLibrary;
  }

  async function newChatMessage(
    msg: string = '',
    unload = false,
    role: ChatRole = 'user',
    mode: ChatMode | undefined = undefined,
    modelName: string = currentModel.current?.name || '',
    stream: boolean = false,
    imgArray: string[] = [],
    includeHistory = true,
  ): Promise<any> {
    if (!modelName) {
      showNotification(t('core:chooseModel'));
      return Promise.resolve(false);
    }
    if (!defaultAiProvider || !aiClient.current) {
      showNotification('AI Provider or Client not initialized.');
      return Promise.resolve(false);
    }

    const msgContent = mode ? getMessage(msg, mode) : msg;
    const imagesBase64 = (
      imgArray.length > 0
        ? imgArray
        : images.current.map((i) => i.base64).filter((b) => !!b)
    ) as string[];

    const messagesForAPI: CommonMessage[] =
      msgContent || unload
        ? [
            ...getProviderMessages(
              includeHistory ? chatHistoryItems.current : [],
              modelName,
              defaultAiProvider.engine,
            ),
            {
              role: role,
              content: msgContent,
              ...(imagesBase64.length > 0 &&
                defaultAiProvider.engine === 'ollama' && {
                  images: imagesBase64,
                }),
            },
          ]
        : [];

    if (includeHistory && msgContent && !unload) {
      addHistoryItem(msg, role);
    }

    let formatOption: any = undefined;
    if (mode === 'tags') {
      const tagsFromLibrary = getTagsFromLibrary();
      formatOption = {
        format: zodToJsonSchema(
          getZodTags(generationSettings.current.maxTags, tagsFromLibrary),
        ),
      };
      if (imagesBase64.length > 0) {
        formatOption = {
          format: zodToJsonSchema(
            getZodDescription(generationSettings.current.structuredDataProps),
          ),
        };
      }
    } else if (
      (mode === 'description' || mode === 'summary') &&
      imagesBase64.length > 0 &&
      generationSettings.current.option === 'analyseImages'
    ) {
      formatOption = {
        format: zodToJsonSchema(
          getZodDescription(generationSettings.current.structuredDataProps),
        ),
      };
    }

    const request: CommonChatRequest = {
      model: modelName,
      messages: messagesForAPI,
      stream: stream,
      ...(unload && defaultAiProvider.engine === 'ollama' && { keep_alive: 0 }),
      ...(formatOption &&
        defaultAiProvider.engine === 'ollama' && {
          format: formatOption.format,
        }),
    };

    try {
      let apiResponse: string | undefined;
      if (
        defaultAiProvider.engine === 'ollama' &&
        aiClient.current instanceof Ollama
      ) {
        apiResponse = await newOllamaMessage(
          aiClient.current as Ollama,
          request as any,
          chatMessageHandler,
        );
      } else if (
        defaultAiProvider.engine === 'openrouter' &&
        aiClient.current instanceof OpenRouterClient
      ) {
        apiResponse = await (
          aiClient.current as OpenRouterClient
        ).newOpenRouterMessage(request, chatMessageHandler);
      } else {
        throw new Error(
          `Unsupported AI engine: ${defaultAiProvider.engine} or client not initialized.`,
        );
      }

      isTyping.current = false;
      forceUpdate();

      if (apiResponse === undefined && stream === false && !unload) {
        showNotification(
          'Error: No response from AI service. Check connection and service status.',
        );
        return undefined;
      }

      if (msgContent && includeHistory && !unload) {
        saveHistoryItems();
      }

      if (mode === 'tags') {
        let tags: string[] = [];
        if (apiResponse) {
          try {
            const parsedResponse = JSON.parse(apiResponse);
            tags = parsedResponse.topics || parsedResponse.tags || [];
          } catch (e) {
            if (typeof apiResponse === 'string') {
              tags = apiResponse
                .split(/[\s,;]+/)
                .filter((tag) => tag.length > 0);
            }
            console.warn(
              'AI response for tags was not JSON, attempting fallback parsing:',
              apiResponse,
            );
          }
        }
        return tags.slice(0, generationSettings.current.maxTags);
      } else if (mode === 'description' || mode === 'summary') {
        if (
          formatOption &&
          defaultAiProvider.engine === 'ollama' &&
          apiResponse
        ) {
          const response = JSON.parse(apiResponse);
          const arrReturn = [];
          if (
            generationSettings.current.structuredDataProps.name &&
            response.name
          ) {
            arrReturn.push('**Name:** ' + response.name);
          }
          return arrReturn.join('\n\n') + '\n\n';
        }
        return apiResponse;
      }
      return stream ? true : apiResponse;
    } catch (error) {
      console.error('Error in newChatMessage:', error);
      showNotification(`Error communicating with AI: ${error.message}`);
      isTyping.current = false;
      forceUpdate();
      return undefined;
    }
  }

  function cancelMessage() {
    if (aiClient.current instanceof Ollama) {
      (aiClient.current as Ollama).abort();
    } else if (aiClient.current instanceof OpenRouterClient) {
      console.log('Cancellation not implemented for OpenRouterClient yet.');
    }
    isTyping.current = false;
    if (
      chatHistoryItems.current.length > 0 &&
      chatHistoryItems.current[0]?.response
    ) {
      saveHistoryItems();
    }
    forceUpdate();
  }

  function getFileContent(
    entry: TS.FileSystemEntry,
    content: any,
  ): Promise<string> {
    if (entry.path.endsWith('.pdf')) {
      return extractPDFcontent(content);
    } else if (entry.path.endsWith('.html')) {
      return extractTextContent(entry.name, content);
    }
    return Promise.resolve(content as string);
  }

  function getImageArray(
    fileContent: 'text' | 'image',
    content: ArrayBuffer,
  ): string[] {
    if (fileContent === 'image') {
      const base64 = toBase64Image(content);
      if (base64) {
        return [base64];
      }
    }
    return [];
  }

  async function generate(
    fileContent: 'text' | 'image',
    mode: ChatMode,
    modelName: string,
    entry: TS.FileSystemEntry,
  ): Promise<string> {
    if (!modelName) {
      showNotification('Model not found, try selecting one first.');
      return Promise.resolve('');
    }

    if (!defaultAiProvider) {
      showNotification('Default AI provider not configured.');
      return Promise.resolve('');
    }

    if (entry.isFile && currentLocation) {
      try {
        const contentBufferOrText = await currentLocation.getFileContentPromise(
          entry.path,
          fileContent === 'text' && !entry.path.endsWith('.pdf')
            ? 'text'
            : 'arraybuffer',
        );

        let processedContent: string;
        let imagesForApi: string[] = [];

        if (
          fileContent === 'image' &&
          contentBufferOrText instanceof ArrayBuffer
        ) {
          processedContent = '';
          imagesForApi = getImageArray('image', contentBufferOrText);
        } else if (typeof contentBufferOrText === 'string') {
          processedContent = await getFileContent(entry, contentBufferOrText);
        } else if (
          contentBufferOrText instanceof ArrayBuffer &&
          entry.path.endsWith('.pdf')
        ) {
          processedContent = await getFileContent(entry, contentBufferOrText);
        } else {
          throw new Error('Unsupported content type or state for generation.');
        }

        return newChatMessage(
          processedContent,
          false,
          'user',
          mode,
          modelName,
          false,
          imagesForApi,
          false,
        );
      } catch (e) {
        console.log('Error processing file for AI generation:', e);
        showNotification(`Error processing file: ${e.message}`);
        return Promise.resolve('');
      }
    } else if (!entry.isFile) {
      return newChatMessage(
        entry.name,
        false,
        'user',
        mode,
        modelName,
        false,
        [],
        false,
      );
    }

    showNotification('Generation pre-conditions not met.');
    return Promise.resolve('');
  }

  async function descriptionGenerate(
    entry: TS.FileSystemEntry,
  ): Promise<TS.FileSystemEntry | undefined> {
    const modelsAvailable = await checkActiveProviderModels();
    if (!modelsAvailable || !defaultAiProvider) {
      showNotification(
        'AI models not loaded or provider not set. Check AI settings.',
      );
      return undefined;
    }

    const entryModel = getEntryModel(entry.name, defaultAiProvider);
    if (!entryModel) {
      showNotification(
        `No suitable AI model found for ${entry.name} with provider ${defaultAiProvider.name}. Check default models in AI settings.`,
      );
      return undefined;
    }

    const ext = extractFileExtension(entry.name).toLowerCase();
    let fileContentType: 'text' | 'image' | undefined;

    if (AppConfig.aiSupportedFiletypes.image.includes(ext)) {
      fileContentType = 'image';
    } else if (
      AppConfig.aiSupportedFiletypes.text.includes(ext) ||
      ext === '' /*folders*/
    ) {
      fileContentType = 'text';
    }

    if (!fileContentType) {
      showNotification(
        `File type of ${entry.name} is not supported for description generation.`,
      );
      return undefined;
    }

    try {
      const results = await generate(
        fileContentType,
        'description',
        entryModel.name,
        entry,
      );
      if (results) {
        return handleGenDescResults(
          entry,
          results,
          generationSettings.current.appendToDescription,
        );
      }
    } catch (error) {
      showNotification(
        `Error generating description for ${entry.name}: ${error.message}`,
      );
    }
    return undefined;
  }

  function handleGenDescResults(
    entry: TS.FileSystemEntry,
    response: string,
    append: boolean,
  ): TS.FileSystemEntry | undefined {
    if (response) {
      const generatedDesc =
        response +
        '\\\n *Generated with AI on ' +
        formatDateTime(new Date(), true) +
        '* \n';
      entry.meta.description =
        entry.meta?.description && append
          ? entry.meta.description + '\n---\n' + generatedDesc
          : generatedDesc;
      return entry;
    }
    return undefined;
  }

  async function tagsGenerate(
    entry: TS.FileSystemEntry,
    fromDescription: boolean = false,
  ): Promise<boolean> {
    if (!defaultAiProvider) {
      showNotification('Default AI provider not configured.');
      return false;
    }
    const entryModel = getEntryModel(entry.name, defaultAiProvider);
    if (!entryModel) {
      showNotification(
        'Tags generation not supported for:' +
          entry.name +
          ' with current provider.',
      );
      return false;
    }

    const textModelName = defaultAiProvider.defaultTextModel || entryModel.name;

    if (
      (fromDescription || generationSettings.current.fromDescription) &&
      entry.meta.description
    ) {
      try {
        const results = await newChatMessage(
          entry.meta.description,
          false,
          'user',
          'tags',
          textModelName,
          false,
          [],
          false,
        );
        return handleGenTagsResults(entry, results);
      } catch (e) {
        console.error('Error generating tags from description:', e);
        return false;
      }
    } else {
      const ext = extractFileExtension(entry.name).toLowerCase();
      let fileContentType: 'text' | 'image' | undefined;
      if (AppConfig.aiSupportedFiletypes.image.includes(ext)) {
        fileContentType = 'image';
      } else if (
        AppConfig.aiSupportedFiletypes.text.includes(ext) ||
        ext === ''
      ) {
        fileContentType = 'text';
      }

      if (fileContentType) {
        try {
          const results = await generate(
            fileContentType,
            'tags',
            entryModel.name,
            entry,
          );
          return handleGenTagsResults(entry, results);
        } catch (e) {
          console.error(`Error generating tags from ${fileContentType}:`, e);
          return false;
        }
      } else {
        showNotification(
          'File type of ' +
            entry.name +
            ' not supported for direct tag generation.',
        );
      }
    }
    return false;
  }

  async function handleGenTagsResults(
    entry: TS.FileSystemEntry,
    response: string[] | string,
  ): Promise<boolean> {
    if (response && response.length > 0) {
      try {
        const tagsArray = Array.isArray(response)
          ? response
          : typeof response === 'string'
            ? response.split(/[\s,;]+/)
            : [];

        const uniqueTags: TS.Tag[] = tagsArray
          .map((tagStr) => {
            if (tagStr && typeof tagStr === 'string') {
              const tagTitle = tagStr
                .replace(/[-/=[\]{}!@#$%^&*(),.?":{}|<>]/g, ' ')
                .toLowerCase()
                .split(' ')
                .filter((str) => str.trim() !== '')
                .slice(0, 3)
                .join('-');
              if (tagTitle) {
                return {
                  title: tagTitle,
                  ...getTagColors(
                    tagTitle,
                    defaultTextColor,
                    defaultBackgroundColor,
                  ),
                };
              }
            }
            return undefined;
          })
          .filter(
            (tag): tag is TS.Tag =>
              tag !== undefined &&
              ((self) =>
                self.findIndex((t) => t?.title === tag.title) ===
                self.indexOf(tag))(
                tagsArray
                  .map((tempTagStr) => {
                    if (tempTagStr && typeof tempTagStr === 'string') {
                      const tempTitle = tempTagStr
                        .toLowerCase()
                        .split(' ')
                        .filter((s) => s.trim() !== '')
                        .slice(0, 3)
                        .join('-');
                      return { title: tempTitle };
                    }
                    return undefined;
                  })
                  .filter((t) => t !== undefined) as { title: string }[],
              ),
          );

        if (uniqueTags.length > 0) {
          await addTagsToFsEntry(entry, uniqueTags);
          dispatch(
            SettingsActions.setEntryContainerTab(TabNames.propertiesTab),
          );
          return true;
        }
      } catch (e) {
        console.error('Error processing tags response: ' + response, e);
      }
    } else {
      console.log('No tags generated or empty response.');
    }
    return false;
  }

  function setGenerationSettings(genSettings: any) {
    generationSettings.current = {
      ...generationSettings.current,
      ...genSettings,
    };
    if (Pro) {
      localStorage.setItem(
        Pro.keys.generationSettingsKey,
        JSON.stringify(generationSettings.current),
      );
    }
    forceUpdate();
  }

  function resetGenerationSettings(option: generateOptionType) {
    generationSettings.current = getGenerationSettings(option);
    if (Pro) {
      localStorage.setItem(
        Pro.keys.generationSettingsKey,
        JSON.stringify(generationSettings.current),
      );
    }
    forceUpdate();
  }

  const context = useMemo(() => {
    return {
      isTyping: isTyping.current,
      models: models.current,
      images: images.current,
      currentModel: currentModel.current,
      chatHistoryItems: chatHistoryItems.current,
      generationSettings: generationSettings.current,
      checkActiveProviderModels,
      refreshAIModels,
      getHistoryFilePath,
      setModel,
      setImages,
      removeImage,
      unloadCurrentModel,
      removeModel,
      changeCurrentModel,
      getModel,
      addChatHistory,
      newChatMessage,
      cancelMessage,
      findModel,
      generate,
      initHistory,
      deleteHistory,
      checkAIProviderAlive,
      getAIClient,
      getEntryModel,
      tagsGenerate,
      descriptionGenerate,
      setGenerationSettings,
      resetGenerationSettings,
    };
  }, [
    defaultAiProvider,
    isTyping.current,
    models.current,
    images.current,
    currentModel.current,
    chatHistoryItems.current,
    generationSettings.current,
    openedEntry,
    selectedEntries,
    currentLocation,
    tagGroups,
  ]);

  return (
    <ChatContext.Provider value={context}>{children}</ChatContext.Provider>
  );
};
