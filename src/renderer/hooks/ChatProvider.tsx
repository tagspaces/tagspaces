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
  Model,
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
} from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { TabNames } from '-/hooks/EntryPropsTabsContextProvider';

type ChatData = {
  models: Model[];
  images: ChatImage[];
  currentModel: Model;
  openedEntryModel: Model;
  chatHistoryItems: ChatItem[];
  //isTyping: boolean;
  refreshOllamaModels: (modelName?: string) => void;
  setModel: (model: Model | string) => Promise<boolean>;
  setImages: (imagesPaths: string[]) => void;
  removeImage: (uuid: string) => void;
  unloadCurrentModel: () => void;
  removeModel: (modelName: string) => void;
  findModel: (modelName: string) => Model;
  getHistoryFilePath: (name?: string) => string;
  changeCurrentModel: (
    newModelName: string,
    confirmCallback?: () => void,
  ) => Promise<boolean>;
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
  generate: (fileContent: 'text' | 'image', mode: ChatMode) => Promise<string>;
  initHistory: () => void;
  deleteHistory: () => Promise<boolean>;
};

export const ChatContext = createContext<ChatData>({
  models: [],
  images: [],
  currentModel: undefined,
  openedEntryModel: undefined,
  chatHistoryItems: [],
  //isTyping: false,
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
  addTimeLineRequest: undefined,
  addTimeLineResponse: undefined,
  newChatMessage: undefined,
  generate: undefined,
  initHistory: undefined,
  deleteHistory: undefined,
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
  const models = useRef<Model[]>([]);
  const defaultAiProvider: AIProvider = useSelector(getDefaultAIProvider);
  const selectedTabName = useSelector(getEntryContainerTab);
  const currentModel = useRef<Model>(undefined);
  const openedEntryModel = useRef<Model>(
    getOpenedEntryModel(openedEntry?.name, defaultAiProvider),
  );
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
  // const isTyping = useRef<boolean>(false);
  const dispatch: AppDispatch = useDispatch();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (AppConfig.isElectron) {
      refreshOllamaModels();
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
    }
  }, []);

  useEffect(() => {
    refreshOllamaModels();
    setOpenedEntryModel();
  }, [defaultAiProvider]);

  useEffect(() => {
    setOpenedEntryModel();
    if (selectedTabName === TabNames.aiTab) {
      initHistory();
    }
  }, [openedEntry]);

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

  function setOpenedEntryModel() {
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
  }

  function getOpenedEntryModel(
    fileName: string,
    aiProvider: AIProvider,
  ): Model {
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

  function refreshOllamaModels(modelName = undefined) {
    if (AppConfig.isElectron && defaultAiProvider) {
      window.electronIO.ipcRenderer
        .invoke('getOllamaModels', defaultAiProvider.url)
        .then((m) => {
          if (m) {
            models.current = m;
            const model = findModel(modelName);
            if (model) {
              return setModel(model);
            } else if (currentModel.current === undefined) {
              //set defaultTextModel if not found
              return setModel(defaultAiProvider.defaultTextModel);
            }
            forceUpdate();
          }
        });
    }
  }

  function setModel(m: Model | string): Promise<boolean> {
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
        window.electronIO.ipcRenderer
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
          });
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
  function getModel(modelName: string): Promise<Model> {
    if (!AppConfig.isElectron || !modelName || !defaultAiProvider) {
      return Promise.resolve(undefined);
    }
    return window.electronIO.ipcRenderer
      .invoke('getOllamaModels', defaultAiProvider.url)
      .then((m) => {
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
        return window.electronIO.ipcRenderer
          .invoke('pullOllamaModel', defaultAiProvider.url, {
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
    return Promise.resolve(true);
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
      addTimeLineRequest(msg, role);
    }
    return window.electronIO.ipcRenderer
      .invoke('newOllamaMessage', defaultAiProvider.url, {
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

  function getFileContent(content: any): Promise<string> {
    if (openedEntry.path.endsWith('.pdf')) {
      return extractPDFcontent(content);
    } else if (openedEntry.path.endsWith('.html')) {
      return extractTextContent(openedEntry.name, content);
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
  ): Promise<string> {
    if (openedEntryModel.current) {
      return currentLocation
        .getFileContentPromise(
          openedEntry.path,
          fileContent === 'text' ? 'text' : 'arraybuffer',
        )
        .then((content) => getFileContent(content))
        .then((content) =>
          newChatMessage(
            fileContent === 'image' ? undefined : content,
            false,
            'user',
            mode,
            openedEntryModel.current.name,
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
      models: models.current,
      images: images.current,
      currentModel: currentModel.current,
      openedEntryModel: openedEntryModel.current,
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
      addTimeLineRequest,
      addTimeLineResponse,
      newChatMessage,
      findModel,
      generate,
      initHistory,
      deleteHistory,
    };
  }, [
    defaultAiProvider,
    models.current,
    images.current,
    currentModel.current,
    openedEntryModel.current,
    chatHistoryItems.current,
    openedEntry,
    selectedEntries,
  ]);

  return (
    <ChatContext.Provider value={context}>{children}</ChatContext.Provider>
  );
};
