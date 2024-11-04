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

type ChatData = {
  models: TS.Model[];
  images: string[];
  currentModel: TS.Model;
  chatHistoryItems: ChatItem[];
  isTyping: boolean;
  refreshOllamaModels: (modelName?: string) => void;
  setModel: (model: TS.Model) => void;
  setImage: (base64: string) => void;
  unloadCurrentModel: () => void;
  removeModel: (model?: TS.Model) => void;
  changeCurrentModel: (newModelName: string) => void;
  addTimeLineRequest: (txt: string) => void;
  addTimeLineResponse: (txt: string, replace?: boolean) => void;
  newChatMessage: (msg?: string, unload?: boolean) => Promise<boolean>;
};

export const ChatContext = createContext<ChatData>({
  models: [],
  images: [],
  currentModel: undefined,
  chatHistoryItems: [],
  isTyping: false,
  refreshOllamaModels: undefined,
  setModel: undefined,
  setImage: undefined,
  unloadCurrentModel: undefined,
  removeModel: undefined,
  changeCurrentModel: undefined,
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
};

export const ChatContextProvider = ({ children }: ChatContextProviderProps) => {
  const { t } = useTranslation();
  const { showNotification } = useNotificationContext();
  const currentModel = useRef<TS.Model>(undefined);
  const models = useRef<TS.Model[]>([]);
  const images = useRef<string[]>([]);
  const ollamaSettings = useSelector(getOllamaSettings);
  const chatHistoryItems = useRef<ChatItem[]>([]);
  const isTyping = useRef<boolean>(false);
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
              const model = models.current.find((m) =>
                m.name.startsWith(modelName),
              );
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

  function setModel(model: TS.Model) {
    if (currentModel.current !== model) {
      currentModel.current = model;
      forceUpdate();
      //load model
      newChatMessage().then(() => {
        const newItem: ChatItem = {
          request: 'Model ' + model.name + ' loaded',
          timestamp: new Date().getTime(),
        };
        chatHistoryItems.current = [newItem, ...chatHistoryItems.current];
      });
    }
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

  function removeModel(model: TS.Model = currentModel.current) {
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

  function changeCurrentModel(newModelName: string) {
    const model = models.current.find((m) => m.name === newModelName);
    if (model) {
      setModel(model);
    } else {
      const result = confirm(
        'Do you want to download and install ' + newModelName + ' model?',
      );
      if (result) {
        addTimeLineRequest('downloading ' + newModelName);
        window.electronIO.ipcRenderer
          .invoke('pullOllamaModel', ollamaSettings.url, {
            name: newModelName,
            stream: true,
          })
          .then((response) => {
            console.log('pullOllamaModel response:' + response);
            refreshOllamaModels(newModelName);
          });
      }
    }
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

  function addTimeLineResponse(txt, replace = false) {
    if (chatHistoryItems.current.length > 0) {
      const updates = [...chatHistoryItems.current];
      updates[0].response =
        (!replace && updates[0].response ? updates[0].response : '') + txt;
      chatHistoryItems.current = updates; // Update the original array with the updated data
      isTyping.current = true;
      forceUpdate();
    }
  }

  /**
   * @param msg If the messages array is empty, the model will be loaded into memory.
   * @param unload If the messages array is empty and the keep_alive parameter is set to 0, a model will be unloaded from memory.
   */
  function newChatMessage(
    msg: string = undefined,
    unload = false,
  ): Promise<boolean> {
    if (currentModel.current === undefined) {
      showNotification(t('core:chooseModel'));
      return Promise.resolve(false);
    }
    const messages =
      msg && !unload
        ? [
            {
              role: 'user',
              content: msg,
              ...(images.current.length > 0 && { images: images.current }),
            },
          ]
        : [];
    addTimeLineRequest(msg);
    return window.electronIO.ipcRenderer
      .invoke('newOllamaMessage', ollamaSettings.url, {
        model: currentModel.current.name, // Adjust model name as needed
        messages,
        stream: true,
        ...(unload && { keep_alive: 0 }),
      })
      .then(() => {
        isTyping.current = false;
        forceUpdate();
        return true;
      });
  }

  const context = useMemo(() => {
    return {
      models: models.current,
      images: images.current,
      currentModel: currentModel.current,
      chatHistoryItems: chatHistoryItems.current,
      isTyping: isTyping.current,
      refreshOllamaModels,
      setModel,
      setImage,
      unloadCurrentModel,
      removeModel,
      changeCurrentModel,
      addTimeLineRequest,
      addTimeLineResponse,
      newChatMessage,
    };
  }, [
    models.current,
    images.current,
    currentModel.current,
    chatHistoryItems.current,
    isTyping.current,
  ]);

  return (
    <ChatContext.Provider value={context}>{children}</ChatContext.Provider>
  );
};
