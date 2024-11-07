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
import { useSelector } from 'react-redux';
import { getOllamaSettings } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import AppConfig from '-/AppConfig';
import { useTranslation } from 'react-i18next';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { Pro } from '-/pro';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';

type ChatData = {
  models: TS.Model[];
  images: string[];
  currentModel: TS.Model;
  chatHistoryItems: ChatItem[];
  //isTyping: boolean;
  refreshOllamaModels: (modelName?: string) => void;
  setModel: (model: TS.Model) => Promise<boolean>;
  setImage: (base64: string) => void;
  unloadCurrentModel: () => void;
  removeModel: (model: TS.Model) => void;
  findModel: (modelName: string) => TS.Model;
  changeCurrentModel: (newModelName: string) => Promise<boolean>;
  getModel: (modelName: string) => Promise<TS.Model>;
  addTimeLineRequest: (txt: string) => void;
  addTimeLineResponse: (txt: string, replace?: boolean) => ChatItem[];
  newChatMessage: (
    msg?: string,
    unload?: boolean,
    role?: ChatRole,
    mode?: ChatMode,
    model?: string,
    stream?: boolean,
    images?: string[],
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
  setImage: undefined,
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

export type ChatItem = {
  request: string;
  response?: string;
  timestamp: number;
  role?: ChatRole;
};

export type ChatRole = 'user' | 'system' | 'assistant' | 'tool';
export type ChatMode = 'summary' | 'helpful' | 'rephrase' | 'description';

export const ChatContextProvider = ({ children }: ChatContextProviderProps) => {
  const { t } = useTranslation();
  const { showNotification } = useNotificationContext();
  const { selectedEntries } = useSelectedEntriesContext();
  const { openedEntry } = useOpenedEntryContext();
  const currentModel = useRef<TS.Model>(undefined);
  const models = useRef<TS.Model[]>([]);
  const images = useRef<string[]>([]);
  const ollamaSettings = useSelector(getOllamaSettings);
  const chatHistoryItems = useRef<ChatItem[]>([]);
  const DEFAULT_QUESTION_PROMPT =
    Pro && Pro.UI ? Pro.UI.DEFAULT_QUESTION_PROMPT : false;
  const DEFAULT_SYSTEM_PROMPT =
    Pro && Pro.UI ? Pro.UI.DEFAULT_QUESTION_PROMPT : false;
  const SUMMARIZE_PROMPT =
    Pro && Pro.UI ? Pro.UI.DEFAULT_QUESTION_PROMPT : false;
  const IMAGE_DESCRIPTION = Pro && Pro.UI ? Pro.UI.IMAGE_DESCRIPTION : false;
  // const isTyping = useRef<boolean>(false);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    refreshOllamaModels();
  }, []);

  function refreshOllamaModels(modelName = undefined) {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer
        .invoke('getOllamaModels', ollamaSettings.url)
        .then((m) => {
          if (m && m.length > 0) {
            models.current = m;
            if (modelName) {
              const model = findModel(modelName);
              if (model) {
                setModel(model);
              } else {
                forceUpdate();
              }
            } else {
              forceUpdate();
            }
          }
        });
    }
  }

  function setModel(model: TS.Model): Promise<boolean> {
    if (currentModel.current !== model) {
      currentModel.current = model;
      forceUpdate();
      //load model
      return newChatMessage().then(() => {
        const newItem: ChatItem = {
          request: 'Model ' + model.name + ' loaded',
          timestamp: new Date().getTime(),
          role: 'system',
        };
        chatHistoryItems.current = [newItem, ...chatHistoryItems.current];
        forceUpdate();
        return true;
      });
    }
    return Promise.resolve(false);
  }

  function setImage(base64: string) {
    if (base64) {
      images.current = [...images.current, base64];
      forceUpdate();
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

  function removeModel(model: TS.Model) {
    if (model) {
      const result = confirm('Do you want to remove ' + model.name + ' model?');
      if (result) {
        addTimeLineRequest('deleting ' + model.name);
        window.electronIO.ipcRenderer
          .invoke('deleteOllamaModel', ollamaSettings.url, {
            name: model.name,
          })
          .then((response) => {
            console.log('deleteOllamaModel response:' + response);
            if (response) {
              if (model.name === currentModel.current.name) {
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
  function getModel(modelName: string): Promise<TS.Model> {
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
        addTimeLineRequest('downloading ' + newModelName);
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

  function addTimeLineRequest(txt) {
    if (txt) {
      const newItem: ChatItem = {
        request: txt + getImages(),
        timestamp: new Date().getTime(),
      };
      chatHistoryItems.current = [newItem, ...chatHistoryItems.current];
      images.current = [];
      forceUpdate();
    }
  }

  function getImages() {
    if (images.current.length > 0) {
      const img = images.current.map(
        (i) => '![chat image](data:image/*;base64,' + i + ')',
      );
      return img.join(' ');
    }
    return '';
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
      if (item.role !== 'system') {
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
   */
  function newChatMessage(
    msg: string = undefined,
    unload = false,
    role: ChatRole = 'user',
    mode: ChatMode = undefined,
    model: string = currentModel.current?.name,
    stream: boolean = true,
    imgArray: string[] = [],
  ): Promise<any> {
    if (!model) {
      showNotification(t('core:chooseModel'));
      return Promise.resolve(false);
    }
    const msgContent = getMessage(msg, mode);
    const imagesArray = imgArray.length > 0 ? imgArray : images.current;
    const messages =
      msgContent && !unload
        ? [
            ...getOllamaMessages(chatHistoryItems.current),
            {
              role: role,
              content: msgContent,
              ...(imagesArray.length > 0 && { images: imagesArray }),
            },
          ]
        : [];
    addTimeLineRequest(msg);
    return window.electronIO.ipcRenderer
      .invoke('newOllamaMessage', ollamaSettings.url, {
        model, // Adjust model name as needed
        messages,
        stream: stream,
        ...(unload && { keep_alive: 0 }),
      })
      .then((apiResponse) => {
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
      setImage,
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
