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

import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import {
  getMetaDirectoryPath,
  extractFileExtension,
} from '@tagspaces/tagspaces-common/paths';
import { loadJSONString } from '@tagspaces/tagspaces-common/utils-io';
import { useSelector } from 'react-redux';
import { getDefaultAIProvider, getOllamaSettings } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import AppConfig from '-/AppConfig';
import { useTranslation } from 'react-i18next';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { Pro } from '-/pro';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { usePlatformFacadeContext } from '-/hooks/usePlatformFacadeContext';
import { toBase64Image } from '-/services/utils-io';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import {
  AIProviders,
  ChatImage,
  ChatItem,
  ChatMode,
  ChatRole,
  HistoryModel,
  Model,
} from '-/components/chat/ChatTypes';

type ChatData = {
  models: Model[];
  images: ChatImage[];
  currentModel: Model;
  chatHistoryItems: ChatItem[];
  //isTyping: boolean;
  refreshOllamaModels: (modelName?: string) => void;
  setModel: (model: Model) => Promise<boolean>;
  setImages: (imagesPaths: string[]) => void;
  removeImage: (uuid: string) => void;
  unloadCurrentModel: () => void;
  removeModel: (model: Model) => void;
  findModel: (modelName: string) => Model;
  changeCurrentModel: (newModelName: string) => Promise<boolean>;
  getModel: (modelName: string) => Promise<Model>;
  addTimeLineRequest: (txt: string, role: ChatRole) => void;
  addTimeLineResponse: (txt: string, replace?: boolean) => ChatItem[];
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
};

export const ChatContext = createContext<ChatData>({
  models: [],
  images: [],
  currentModel: undefined,
  chatHistoryItems: [],
  //isTyping: false,
  refreshOllamaModels: undefined,
  setModel: undefined,
  setImages: undefined,
  removeImage: undefined,
  unloadCurrentModel: undefined,
  removeModel: undefined,
  findModel: undefined,
  changeCurrentModel: undefined,
  getModel: undefined,
  addTimeLineRequest: undefined,
  addTimeLineResponse: undefined,
  newChatMessage: undefined,
});

export type ChatContextProviderProps = {
  children: React.ReactNode;
};

export const ChatContextProvider = ({ children }: ChatContextProviderProps) => {
  const { t } = useTranslation();
  const { showNotification } = useNotificationContext();
  const { selectedEntries } = useSelectedEntriesContext();
  const { currentLocation } = useCurrentLocationContext();
  const { saveFilePromise, deleteEntriesPromise } = usePlatformFacadeContext();
  const { openedEntry } = useOpenedEntryContext();
  const currentModel = useRef<Model>(undefined);
  const models = useRef<Model[]>([]);
  const images = useRef<ChatImage[]>([]);
  const aiProvider: AIProviders = useSelector(getDefaultAIProvider);
  const ollamaSettings = useSelector(getOllamaSettings);
  const chatHistoryItems = useRef<ChatItem[]>([]);
  const DEFAULT_QUESTION_PROMPT =
    Pro && Pro.UI ? Pro.UI.DEFAULT_QUESTION_PROMPT : false;
  const DEFAULT_SYSTEM_PROMPT =
    Pro && Pro.UI ? Pro.UI.DEFAULT_SYSTEM_PROMPT : false;
  const SUMMARIZE_PROMPT = Pro && Pro.UI ? Pro.UI.SUMMARIZE_PROMPT : false;
  const IMAGE_DESCRIPTION = Pro && Pro.UI ? Pro.UI.IMAGE_DESCRIPTION : false;
  const GENERATE_TAGS = Pro && Pro.UI ? Pro.UI.GENERATE_TAGS : false;
  // const isTyping = useRef<boolean>(false);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    refreshOllamaModels();
  }, []);

  useEffect(() => {
    if (
      openedEntry &&
      !openedEntry.isFile &&
      !openedEntry.path.endsWith(AppConfig.metaFolder)
    ) {
      images.current = [];
      loadHistory().then((historyItems) => {
        chatHistoryItems.current = historyItems;
        forceUpdate();
      });
    }
  }, [openedEntry]);

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
          return [];
        });
    }
    return Promise.resolve([]);
  }

  function refreshOllamaModels(modelName = undefined) {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer
        .invoke('getOllamaModels', ollamaSettings.url)
        .then((m) => {
          models.current = m;
          if (modelName) {
            const model = findModel(modelName);
            if (model) {
              return setModel(model);
            }
          }
          forceUpdate();
        });
    }
  }

  function setModel(model: Model): Promise<boolean> {
    if (currentModel.current !== model) {
      currentModel.current = model;
      forceUpdate();
      //load model
      return newChatMessage().then(() => {
        const newItem: ChatItem = {
          request: 'Model ' + model.name + ' loaded',
          timestamp: new Date().getTime(),
          role: 'system',
          modelName: currentModel.current?.name,
          engine: 'ollama',
        };
        saveHistoryItems([newItem, ...chatHistoryItems.current]);
        forceUpdate();
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
            const imageHistoryPath = getHistoryFilePath(
              imageUuid + '.' + extractFileExtension(path),
            );
            const image: ChatImage = {
              uuid: imageUuid,
              path: imageHistoryPath,
              base64: base64Img,
            };
            images.current = [...images.current, image];
            saveFilePromise(
              { path: imageHistoryPath },
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

  function removeModel(model: Model) {
    if (model) {
      const result = confirm('Do you want to remove ' + model.name + ' model?');
      if (result) {
        addTimeLineRequest('deleting ' + model.name, 'system');
        window.electronIO.ipcRenderer
          .invoke('deleteOllamaModel', ollamaSettings.url, {
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
          });
      }
    }
  }

  function findModel(modelName: string) {
    return models.current.find(
      (m) => m.name === modelName || m.name === modelName + ':latest',
    );
  }

  /**
   * check if model is installed and return details
   * @param modelName
   */
  function getModel(modelName: string): Promise<Model> {
    if (!AppConfig.isElectron || !modelName) {
      return Promise.resolve(undefined);
    }
    return window.electronIO.ipcRenderer
      .invoke('getOllamaModels', ollamaSettings.url)
      .then((m) => {
        if (m && m.length > 0) {
          return m.find(
            (mm) => mm.name === modelName || mm.name === modelName + ':latest',
          );
        }
        return undefined;
      });
  }

  function changeCurrentModel(newModelName: string): Promise<boolean> {
    const model = findModel(newModelName);
    if (model) {
      return setModel(model);
    } else {
      const result = confirm(
        'Do you want to download and install ' + newModelName + ' model?',
      );
      if (result) {
        addTimeLineRequest('downloading ' + newModelName, 'system');
        return window.electronIO.ipcRenderer
          .invoke('pullOllamaModel', ollamaSettings.url, {
            name: newModelName,
            stream: true,
          })
          .then((response) => {
            console.log('pullOllamaModel response:' + response);
            refreshOllamaModels(newModelName);
            return true;
          });
      }
    }
    return Promise.resolve(false);
  }

  function addTimeLineRequest(txt: string, role: ChatRole) {
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
    const metaFolder = getMetaDirectoryPath(
      openedEntry.path,
      currentLocation?.getDirSeparator(),
    );
    const fileName = name ? name : 'tsc.json';
    return metaFolder + dirSeparator + 'ai' + dirSeparator + fileName;
  }

  function saveHistoryItems(items?: ChatItem[]) {
    if (items) {
      chatHistoryItems.current = items;
    }
    if (chatHistoryItems.current.length > 0) {
      const model: HistoryModel = {
        history: chatHistoryItems.current,
        lastModelName: currentModel.current?.name,
        engine: aiProvider,
      };
      saveFilePromise(
        { path: getHistoryFilePath() },
        JSON.stringify(model),
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

  function addTimeLineResponse(txt, replace = false): ChatItem[] {
    if (txt && chatHistoryItems.current.length > 0) {
      chatHistoryItems.current[0].response =
        (!replace && chatHistoryItems.current[0].response
          ? chatHistoryItems.current[0].response
          : '') + txt;
      //isTyping.current = true;
      // forceUpdate(); don't refresh chatHistoryItems this will reload milkdown editor just update(content)
    }
    return chatHistoryItems.current;
  }

  function getOllamaMessages(items: ChatItem[]) {
    const messages = [];
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (item.role === 'user') {
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
      if (IMAGE_DESCRIPTION && openedEntry) {
        return IMAGE_DESCRIPTION.replace('{file_name}', openedEntry.name);
      }
    } else if (mode === 'tags') {
      if (GENERATE_TAGS && openedEntry) {
        return GENERATE_TAGS.replace('{input_text}', msg);
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
    stream: boolean = true,
    imgArray: string[] = [],
    includeHistory = true,
  ): Promise<any> {
    if (!model) {
      showNotification(t('core:chooseModel'));
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
            ),
            {
              role: role,
              content: msgContent,
              ...(imagesArray.length > 0 && { images: imagesArray }),
            },
          ]
        : [];
    if (includeHistory) {
      addTimeLineRequest(msg, role);
    }
    return window.electronIO.ipcRenderer
      .invoke('newOllamaMessage', ollamaSettings.url, {
        model,
        messages,
        stream: stream,
        ...(unload && { keep_alive: 0 }),
      })
      .then((apiResponse) => {
        if (msg && includeHistory) {
          saveHistoryItems();
        }
        return stream ? true : apiResponse;
      });
  }

  const context = useMemo(() => {
    return {
      models: models.current,
      images: images.current,
      currentModel: currentModel.current,
      chatHistoryItems: chatHistoryItems.current,
      //isTyping: isTyping.current,
      refreshOllamaModels,
      setModel,
      setImages,
      removeImage,
      unloadCurrentModel,
      removeModel,
      changeCurrentModel,
      getModel,
      addTimeLineRequest,
      addTimeLineResponse,
      newChatMessage,
      findModel,
    };
  }, [
    models.current,
    images.current,
    currentModel.current,
    chatHistoryItems.current,
    openedEntry,
    selectedEntries,
  ]);

  return (
    <ChatContext.Provider value={context}>{children}</ChatContext.Provider>
  );
};
