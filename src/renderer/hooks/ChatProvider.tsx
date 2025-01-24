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
} from '-/components/chat/ChatTypes';
import { useFileUploadDialogContext } from '-/components/dialogs/hooks/useFileUploadDialogContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { usePlatformFacadeContext } from '-/hooks/usePlatformFacadeContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { Pro } from '-/pro';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import {
  getDefaultAIProvider,
  getEntryContainerTab,
} from '-/reducers/settings';
import { extractPDFcontent } from '-/services/thumbsgenerator';
import { toBase64Image } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import {
  extractFileExtension,
  getMetaDirectoryPath,
} from '@tagspaces/tagspaces-common/paths';
import {
  getUuid,
  loadJSONString,
  extractTextContent,
} from '@tagspaces/tagspaces-common/utils-io';
import { format } from 'date-fns';
import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { TabNames } from '-/hooks/EntryPropsTabsContextProvider';
import {
  deleteOllamaModel,
  getOllamaModels,
  newOllamaMessage,
  pullOllamaModel,
} from '-/components/chat/OllamaClient';
import { Ollama, ChatRequest, ModelResponse } from 'ollama';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';

/*export type TimelineItem = {
  request: string;
  response?: string;
};*/

type ChatData = {
  //timelineItems: TimelineItem[];
  models: ModelResponse[];
  images: ChatImage[];
  currentModel: ModelResponse;
  //openedEntryModel: ModelResponse;
  chatHistoryItems: ChatItem[];
  isTyping: boolean;
  refreshOllamaModels: (modelName?: string) => void;
  setModel: (model: ModelResponse | string) => Promise<boolean>;
  setImages: (imagesPaths: string[]) => void;
  removeImage: (uuid: string) => void;
  unloadCurrentModel: () => void;
  removeModel: (modelName: string) => void;
  findModel: (modelName: string) => ModelResponse;
  getHistoryFilePath: (name?: string) => string;
  changeCurrentModel: (
    newModelName: string,
    confirmCallback?: () => void,
  ) => Promise<boolean>;
  getModel: (modelName: string) => Promise<ModelResponse>;
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
  checkProviderAlive: (providerUrl: string) => Promise<boolean>;
  getOllamaClient: (ollamaApiUrl: string) => Promise<Ollama>;
  getEntryModel: (entryName: string, aiProvider: AIProvider) => ModelResponse;
};

export const ChatContext = createContext<ChatData>({
  //timelineItems: [],
  models: [],
  images: [],
  currentModel: undefined,
  //openedEntryModel: undefined,
  chatHistoryItems: [],
  isTyping: false,
  refreshOllamaModels: undefined,
  setModel: undefined,
  setImages: undefined,
  removeImage: undefined,
  unloadCurrentModel: undefined,
  removeModel: undefined,
  findModel: undefined,
  getHistoryFilePath: undefined,
  changeCurrentModel: undefined,
  getModel: undefined,
  addChatHistory: undefined,
  newChatMessage: undefined,
  cancelMessage: undefined,
  generate: undefined,
  initHistory: undefined,
  deleteHistory: undefined,
  checkProviderAlive: undefined,
  getOllamaClient: undefined,
  getEntryModel: undefined,
});

export type ChatContextProviderProps = {
  children: React.ReactNode;
};

export const ChatContextProvider = ({ children }: ChatContextProviderProps) => {
  const { t } = useTranslation();
  const { showNotification } = useNotificationContext();
  const { deleteDirectory } = useIOActionsContext();
  const { openFileUploadDialog } = useFileUploadDialogContext();
  const { selectedEntries } = useSelectedEntriesContext();
  const { currentLocation } = useCurrentLocationContext();
  const { saveFilePromise, deleteEntriesPromise } = usePlatformFacadeContext();
  const { openedEntry } = useOpenedEntryContext();
  const models = useRef<ModelResponse[]>([]);
  const defaultAiProvider: AIProvider = useSelector(getDefaultAIProvider);
  const selectedTabName = useSelector(getEntryContainerTab);
  const currentModel = useRef<ModelResponse>(undefined);
  /*const openedEntryModel = useRef<ModelResponse>(
    getOpenedEntryModel(openedEntry?.name, defaultAiProvider),
  );*/
  const images = useRef<ChatImage[]>([]);
  //const defaultAiProviderId: string = useSelector(getDefaultAIProviderId);
  //const aiProviders: AIProvider[] = useSelector(getAIProviders);getDefaultAIProvider(defaultAiProviderId,aiProviders);
  const chatHistoryItems = useRef<ChatItem[]>([]);
  const DEFAULT_QUESTION_PROMPT =
    Pro && Pro.UI ? Pro.UI.DEFAULT_QUESTION_PROMPT : false;
  const DEFAULT_SYSTEM_PROMPT =
    Pro && Pro.UI ? Pro.UI.DEFAULT_SYSTEM_PROMPT : false;
  const SUMMARIZE_PROMPT = Pro && Pro.UI ? Pro.UI.SUMMARIZE_PROMPT : false;
  const IMAGE_DESCRIPTION = Pro && Pro.UI ? Pro.UI.IMAGE_DESCRIPTION : false;
  const TEXT_DESCRIPTION = Pro && Pro.UI ? Pro.UI.TEXT_DESCRIPTION : false;
  const GENERATE_TAGS = Pro && Pro.UI ? Pro.UI.GENERATE_TAGS : false;
  const GENERATE_IMAGE_TAGS =
    Pro && Pro.UI ? Pro.UI.GENERATE_IMAGE_TAGS : false;
  const isTyping = useRef<boolean>(false);
  //const timelineItems = useRef<TimelineItem[]>([]);
  const ollamaClient = useRef<Ollama>(undefined);
  const dispatch: AppDispatch = useDispatch();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  /*
  useEffect(() => {
      //refreshOllamaModels();
      window.electronIO.ipcRenderer.on(
        'PullModel',
        (message: PullModelResponse) => {
          //console.log('ChatMessage:' + message);
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
        },
      );

      return () => {
        window.electronIO.ipcRenderer.removeAllListeners('ChatMessage');
        unloadCurrentModel();
      };
  }, []);*/

  useEffect(() => {
    if (defaultAiProvider) {
      getOllamaClient(defaultAiProvider.url).then((client) => {
        ollamaClient.current = client;
        refreshOllamaModels();
        //setOpenedEntryModel();
      });
    }
  }, [defaultAiProvider]);

  useEffect(() => {
    //setOpenedEntryModel();
    if (selectedTabName === TabNames.aiTab) {
      initHistory();
    }
  }, [openedEntry]);

  async function getOllamaClient(ollamaApiUrl: string) {
    if (ollamaApiUrl) {
      try {
        //@ts-ignore
        const { Ollama } = await import('ollama/browser');

        return new Ollama({ host: ollamaApiUrl });
      } catch (error) {
        console.error('Failed to load Ollama module:', error);
      }
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

  /* function setOpenedEntryModel() {
    if (openedEntry) {
      const newModel = getOpenedEntryModel(openedEntry.name, defaultAiProvider);
      if (
        !newModel ||
        !openedEntryModel.current ||
        newModel.name !== openedEntryModel.current.name
      ) {
        openedEntryModel.current = newModel;
        forceUpdate();
      }
    }
  }*/

  function getEntryModel(
    fileName: string,
    aiProvider: AIProvider,
  ): ModelResponse {
    if (fileName && aiProvider) {
      const ext = extractFileExtension(fileName).toLowerCase();
      let model;
      if (AppConfig.aiSupportedFiletypes.text.includes(ext)) {
        model = aiProvider.defaultTextModel;
      } else if (AppConfig.aiSupportedFiletypes.image.includes(ext)) {
        model = aiProvider.defaultImageModel;
      }
      if (model) {
        return findModel(model);
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
              refreshOllamaModels(historyModel.lastModelName);
              return historyModel.history ? historyModel.history : [];
            }
          }
          return [];
        })
        .catch((e) => {
          console.log('cannot load json:' + historyFilePath, e);
          if (currentModel.current === undefined) {
            //set defaultTextModel if not currentModel
            setModel(defaultAiProvider.defaultTextModel);
          }
          return [];
        });
    }
    return Promise.resolve([]);
  }

  function checkProviderAlive(providerUrl: string): Promise<boolean> {
    return getOllamaClient(providerUrl).then((client) =>
      getOllamaModels(client).then((m) => {
        return !!m;
      }),
    );
  }

  function refreshOllamaModels(modelName = undefined) {
    if (defaultAiProvider) {
      getOllamaModels(ollamaClient.current)
        .then((m) => {
          if (m) {
            models.current = m;
            const model = findModel(modelName);
            if (model) {
              return setModel(model);
            } else {
              //set defaultTextModel if not found
              const model = findModel(defaultAiProvider.defaultTextModel);
              if (model) {
                return setModel(defaultAiProvider.defaultTextModel);
              }
            }
            return true;
          }
          return false;
        })
        .then((success) => {
          if (success) {
            forceUpdate();
          }
        });
    }
  }

  function setModel(m: ModelResponse | string): Promise<boolean> {
    const model = typeof m === 'string' ? findModel(m) : m;
    if (
      model &&
      (!currentModel.current || currentModel.current.name !== model.name)
    ) {
      currentModel.current = model;
      forceUpdate();
      //load model
      return newChatMessage().then(() => {
        /*const newItem: ChatItem = {
          request: 'Model ' + model.name + ' loaded',
          timestamp: new Date().getTime(),
          role: 'system',
          modelName: currentModel.current?.name,
          engine: 'ollama',
        };*/
        //saveHistoryItems([newItem, ...chatHistoryItems.current]);
        showNotification(
          format(new Date().getTime(), 'dd.MM.yyyy HH:mm:ss') +
            ' Model ' +
            model.name +
            ' loaded',
        );
        //forceUpdate();
        return true;
      });
    }
    return Promise.resolve(false);
  }

  function removeImage(uuid: string) {
    const img = images.current.find((i) => i.uuid === uuid);
    if (img) {
      images.current = images.current.filter((i) => i.uuid !== uuid);
      deleteEntriesPromise(currentLocation.toFsEntry(img.path, true));
      forceUpdate();
    }
  }

  function setImages(imagesPaths: string[]) {
    if (imagesPaths.length > 0) {
      imagesPaths.forEach((path) => {
        currentLocation
          .getFileContentPromise(path, 'arraybuffer')
          .then((uint8Array) => {
            const base64Img = toBase64Image(uint8Array);
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
    if (currentModel.current) {
      //unload model
      newChatMessage(undefined, true).then(
        () => (currentModel.current = undefined),
      );
    }
  }

  function removeModel(modelName: string) {
    const model = findModel(modelName);
    if (model && defaultAiProvider) {
      const result = confirm('Do you want to remove ' + model.name + ' model?');
      if (result) {
        //addTimeLineRequest('deleting ' + model.name, 'system');
        showNotification('deleting ' + model.name + ' succeeded');
        deleteOllamaModel(ollamaClient.current, model.name).then((response) => {
          console.log('deleteOllamaModel response:' + response);
          if (response) {
            if (model.name === currentModel.current?.name) {
              currentModel.current = undefined;
            }
            refreshOllamaModels();
          }
        });
        /*window.electronIO.ipcRenderer
          .invoke('deleteOllamaModel', defaultAiProvider.url, {
            name: model.name,
          })
          .then((response) => {
            console.log('deleteOllamaModel response:' + response);
            if (response) {
              if (model.name === currentModel.current?.name) {
                currentModel.current = undefined;
              }
              refreshOllamaModels();
            }
          });*/
      }
    }
  }

  function findModel(modelName: string) {
    return models.current?.find(
      (m) => m.name === modelName || m.name === modelName + ':latest',
    );
  }

  /**
   * check if model is installed and return details
   * @param modelName
   */
  function getModel(modelName: string): Promise<ModelResponse> {
    if (!modelName || !defaultAiProvider) {
      return Promise.resolve(undefined);
    }
    return getOllamaModels(ollamaClient.current).then((m) => {
      if (m && m.length > 0) {
        return m.find(
          (mm) => mm.name === modelName || mm.name === modelName + ':latest',
        );
      }
      return undefined;
    });
  }

  function changeCurrentModel(
    newModelName: string,
    confirmCallback?,
  ): Promise<boolean> {
    const model = findModel(newModelName);
    if (!model && defaultAiProvider) {
      // return setModel(model);
      // } else {
      const result = confirm(
        'Do you want to download and install ' + newModelName + ' model?',
      );
      if (result) {
        if (confirmCallback) {
          confirmCallback();
        }
        // addTimeLineRequest('downloading ' + newModelName, 'system');
        openFileUploadDialog(newModelName, 'downloadChatModel');
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
        pullOllamaModel(
          ollamaClient.current,
          newModelName,
          onProgressHandler,
        ).then((response) => {
          console.log('pullOllamaModel response:' + response);
          refreshOllamaModels(newModelName);
          return true;
        });
        /*return window.electronIO.ipcRenderer
          .invoke('pullOllamaModel', defaultAiProvider.url, {
            name: newModelName,
            stream: true,
          })
          .then((response) => {
            console.log('pullOllamaModel response:' + response);
            refreshOllamaModels(newModelName);
            return true;
          });*/
      }
    }
    return Promise.resolve(true);
  }

  function addHistoryItem(txt: string, role: ChatRole) {
    if (txt) {
      const newItem: ChatItem = {
        engine: 'ollama',
        modelName: currentModel.current?.name,
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

  /*function getImages() {
    if (images.current.length > 0) {
      const img = images.current.map(
        (i) => '![chat image](data:image/!*;base64,' + i.base64 + ')',
      );
      return img.join(' ');
    }
    return '';
  }*/

  function getHistoryFilePath(name?: string) {
    const dirSeparator = currentLocation
      ? currentLocation.getDirSeparator()
      : AppConfig.dirSeparator;
    const metaFolder = getMetaDirectoryPath(openedEntry.path, dirSeparator);
    const fileName = name ? name : 'tsc.json';
    return (
      metaFolder + dirSeparator + AppConfig.aiFolder + dirSeparator + fileName
    );
  }

  function getHistoryMetaDir() {
    const dirSeparator = currentLocation
      ? currentLocation.getDirSeparator()
      : AppConfig.dirSeparator;
    const metaFolder = getMetaDirectoryPath(openedEntry.path, dirSeparator);
    return metaFolder + dirSeparator + AppConfig.aiFolder;
  }

  function saveHistoryItems(items?: ChatItem[]) {
    if (items) {
      chatHistoryItems.current = items;
    }
    if (chatHistoryItems.current.length > 0) {
      const model: HistoryModel = {
        history: chatHistoryItems.current,
        lastModelName: currentModel.current?.name,
        engine: defaultAiProvider?.engine,
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

  /* function addTimeLineRequest(txt) {
    const newItem: ChatItem = {engine: undefined, modelName: "", role: undefined, timestamp: 0, request: txt };
    chatHistoryItems.current = [newItem, ...timelineItems.current];
    forceUpdate();
  }*/

  function addTimeLineResponse(txt) {
    if (chatHistoryItems.current.length > 0) {
      const firstItem = chatHistoryItems.current.shift();
      firstItem.response = (firstItem.response ? firstItem.response : '') + txt;
      chatHistoryItems.current = [firstItem, ...chatHistoryItems.current];
      forceUpdate();
    }
  }

  function addChatHistory(txt, replace = false): ChatItem[] {
    if (txt && chatHistoryItems.current.length > 0) {
      chatHistoryItems.current[0].response =
        (!replace && chatHistoryItems.current[0].response
          ? chatHistoryItems.current[0].response
          : '') + txt;
      // forceUpdate(); don't refresh chatHistoryItems this will reload milkdown editor just update(content)
    }
    return chatHistoryItems.current;
  }

  function getOllamaMessages(items: ChatItem[], modelName: string) {
    const messages = [];
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (item.role === 'user' && item.modelName === modelName) {
        if (item.request) {
          messages.push({
            role: 'user',
            content: item.request,
          });
        }
        if (item.response) {
          messages.push({
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
        if (selectedEntries && selectedEntries.length > 0) {
          prompt = prompt.replace(
            '{file_path}',
            ' of ' + selectedEntries[0].name,
          );
        } else {
          prompt = prompt.replace('{file_path}', '');
        }
        return prompt;
      }
    } else if (mode === 'description') {
      if (msg) {
        return TEXT_DESCRIPTION.replace('{input_text}', msg);
      } else if (IMAGE_DESCRIPTION) {
        return IMAGE_DESCRIPTION.replace(
          '{file_name}',
          openedEntry ? openedEntry.name : '',
        );
      }
    } else if (mode === 'tags') {
      if (msg) {
        if (GENERATE_TAGS && openedEntry) {
          return GENERATE_TAGS.replace('{input_text}', msg);
        }
      } else {
        // image
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
    return (msg): void => {
      //console.log(`Chat ${msg}`);
      isTyping.current = true;
      addTimeLineResponse(msg);
    };
  }, []);

  const Tags = z.object({
    topics: z.array(z.string()).max(4), // todo define generated tags maxLength in settings
  });
  const Description = z.object({
    name: z.string(),
    summary: z.string(),
  });
  const ObjectSchema = z.object({
    name: z.string().describe('The name of the object'),
    confidence: z
      .number()
      .min(0)
      .max(1)
      .describe('The confidence score of the object detection'),
    attributes: z
      .record(z.any())
      .optional()
      .describe('Additional attributes of the object'),
    //attributes: z.string(),
  });
  const ImageDescription = z.object({
    name: z.string().describe('The name of the Image'),
    summary: z.string().describe('A concise summary of the image'),
    objects: z
      .array(ObjectSchema)
      .describe('An array of objects detected in the image'),
    scene: z.string().describe('The scene of the image'),
    colors: z
      .array(z.string())
      .describe('An array of colors detected in the image'),
    time_of_day: z
      .enum(['Morning', 'Afternoon', 'Evening', 'Night', 'Unknown'])
      .describe('The time of day the image was taken'),
    setting: z
      .enum(['Indoor', 'Outdoor', 'Unknown'])
      .describe('The setting of the image'),
    text_content: z
      .string()
      .optional()
      .describe('Any text detected in the image'),
  });
  /**
   * @param msg If the messages array is empty, the model will be loaded into memory.
   * @param unload If the messages array is empty and the keep_alive parameter is set to 0, a model will be unloaded from memory.
   * @param role
   * @param mode
   * @param model
   * @param stream
   * @param imgArray
   * @param includeHistory
   */
  function newChatMessage(
    msg: string = undefined,
    unload = false,
    role: ChatRole = 'user',
    mode: ChatMode = undefined,
    model: string = currentModel.current?.name,
    stream: boolean = false,
    imgArray: string[] = [],
    includeHistory = true,
  ): Promise<any> {
    if (!model) {
      showNotification(t('core:chooseModel'));
      return Promise.resolve(false);
    } else if (!defaultAiProvider) {
      return Promise.resolve(false);
    }
    const msgContent = getMessage(msg, mode);
    const imagesArray =
      imgArray.length > 0 ? imgArray : images.current.map((i) => i.base64);
    const messages =
      msgContent && !unload
        ? [
            ...getOllamaMessages(
              includeHistory ? chatHistoryItems.current : [],
              model,
            ),
            {
              role: role,
              content: msgContent,
              ...(imagesArray.length > 0 && { images: imagesArray }),
            },
          ]
        : [];
    if (includeHistory) {
      addHistoryItem(msg, role);
    }
    let format = undefined;
    if (mode === 'tags') {
      if (imgArray.length > 0) {
        format = { format: zodToJsonSchema(ImageDescription) };
      } else {
        format = { format: zodToJsonSchema(Tags) };
      }
    } else if (mode === 'description' || mode === 'summary') {
      if (imgArray.length > 0) {
        format = { format: zodToJsonSchema(ImageDescription) };
      } else {
        format = { format: zodToJsonSchema(Description) };
      }
    }
    const request: ChatRequest = {
      model,
      messages,
      stream: stream,
      ...(unload && { keep_alive: 0 }),
      ...(format && format),
    };
    return newOllamaMessage(
      ollamaClient.current,
      request,
      chatMessageHandler,
    ).then((apiResponse) => {
      isTyping.current = false;
      if (msg && includeHistory) {
        saveHistoryItems();
      }
      if (mode === 'tags') {
        if (imgArray.length > 0) {
          const response = ImageDescription.parse(JSON.parse(apiResponse));
          const tags = response.objects.map((obj) => obj.name);
          if (response.time_of_day && response.time_of_day !== 'Unknown') {
            tags.push(response.time_of_day);
          }
          if (response.setting && response.setting !== 'Unknown') {
            tags.push(response.setting);
          }
          return [...tags, ...response.colors];
        } else {
          const response = Tags.parse(JSON.parse(apiResponse));
          return response.topics;
        }
      } else if (mode === 'description' || mode === 'summary') {
        if (imgArray.length > 0) {
          const response = ImageDescription.parse(JSON.parse(apiResponse));
          const objArray = response.objects.map(
            (obj) =>
              '\n\n > ##### Name: \n\n' +
              obj.name +
              '\n\n > ##### Attributes: \n\n' +
              obj.attributes,
          );
          return (
            '### Name: \n\n' +
            response.name +
            '\n\n ### Objects: \n\n' +
            objArray.join('\n\n') +
            '\n\n ### Scene: \n\n' +
            response.scene +
            '\n\n ### Colors:\n\n' +
            response.colors +
            '\n\n ### Summary:\n\n' +
            response.summary +
            '\n\n ### Day Time:\n\n' +
            response.time_of_day +
            '\n\n ### Setting:\n\n' +
            response.setting +
            (response.text_content
              ? '\n\n ### Content:\n\n' + response.text_content
              : '')
          );
        } else {
          const response = Description.parse(JSON.parse(apiResponse));
          return (
            '### Name: \n\n' +
            response.name +
            '\n\n ### Summary:\n\n' +
            response.summary
          );
        }
      }
      return stream ? true : apiResponse;
    });
    /*return window.electronIO.ipcRenderer
      .invoke('newOllamaMessage', defaultAiProvider.url, {
        model,
        messages,
        stream: stream,
        ...(unload && { keep_alive: 0 }),
      })
      */
  }

  function cancelMessage() {
    if (ollamaClient.current) {
      ollamaClient.current.abort();
      isTyping.current = false;
      saveHistoryItems();
      forceUpdate();
    }
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
    return Promise.resolve(content);
  }

  function getImageArray(fileContent, content) {
    if (fileContent === 'image') {
      const base64 = toBase64Image(content);
      if (base64) {
        return [base64];
      }
    }
    return [];
  }

  function generate(
    fileContent: 'text' | 'image',
    mode: ChatMode,
    modelName: string,
    entry: TS.FileSystemEntry,
  ): Promise<string> {
    if (modelName) {
      return currentLocation
        .getFileContentPromise(
          entry.path,
          fileContent === 'text' && !entry.path.endsWith('.pdf')
            ? 'text'
            : 'arraybuffer',
        )
        .then((content) => getFileContent(entry, content))
        .then((content) =>
          newChatMessage(
            fileContent === 'image' ? undefined : content,
            false,
            'user',
            mode,
            modelName, //openedEntryModel.current.name,
            false,
            getImageArray(fileContent, content),
            false,
          ),
        )
        .catch((e) => {
          console.log('newOllamaMessage error:', e);
          return undefined;
        });
    } else {
      showNotification('Model not found, try pulling it first');
    }
    return Promise.resolve(undefined);
  }

  const context = useMemo(() => {
    return {
      isTyping: isTyping.current,
      models: models.current,
      images: images.current,
      currentModel: currentModel.current,
      //openedEntryModel: openedEntryModel.current,
      chatHistoryItems: chatHistoryItems.current,
      refreshOllamaModels,
      getHistoryFilePath,
      setModel,
      setImages,
      removeImage,
      unloadCurrentModel,
      removeModel,
      changeCurrentModel,
      getModel,
      addTimeLineResponse,
      addChatHistory,
      newChatMessage,
      cancelMessage,
      findModel,
      generate,
      initHistory,
      deleteHistory,
      checkProviderAlive,
      getOllamaClient,
      getEntryModel,
    };
  }, [
    defaultAiProvider,
    isTyping.current,
    models.current,
    images.current,
    currentModel.current,
    //openedEntryModel.current,
    chatHistoryItems.current,
    openedEntry,
    selectedEntries,
  ]);

  return (
    <ChatContext.Provider value={context}>{children}</ChatContext.Provider>
  );
};
