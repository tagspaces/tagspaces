/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces UG (haftungsbeschraenkt)
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
import { AppDispatch } from '-/reducers/app';
import AppConfig from '-/AppConfig';
import {
  actions as SettingsActions,
  getEnabledExtensions,
} from '-/reducers/settings';
import { Extensions } from '../../main/types';
import { TS } from '-/tagspaces.namespace';
import { extensionsFound } from '-/extension-config';
import { useDispatch, useSelector } from 'react-redux';
import { mergeByProp } from '-/services/utils-io';

type ExtensionsContextData = {
  extensions: TS.Extension[];
  addExtensions: (newExt: TS.Extension[]) => void;
  removeExtension: (extensionId: string) => void;
  updateExtension: (extension: TS.Extension) => void;
};

export const ExtensionsContext = createContext<ExtensionsContextData>({
  extensions: undefined,
  addExtensions: undefined,
  removeExtension: undefined,
  updateExtension: undefined,
});

export type ExtensionsContextProviderProps = {
  children: React.ReactNode;
};

export const ExtensionsContextProvider = ({
  children,
}: ExtensionsContextProviderProps) => {
  const dispatch: AppDispatch = useDispatch();
  const enabledExtensions = useSelector(getEnabledExtensions);
  const extensions = useRef<TS.Extension[]>(extensionsFound);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.on('set_extensions', (arg: Extensions) => {
        const { extensions, supportedFileTypes } = arg;
        addExtensions(extensions);
        dispatch(SettingsActions.addSupportedFileTypes(supportedFileTypes));
      });
      return () => {
        window.electronIO.ipcRenderer.removeAllListeners('set_extensions');
      };
    }
  }, []);

  function addExtensions(newExt: TS.Extension[]) {
    const ext = mergeByProp(extensions.current, newExt, 'extensionId');
    extensions.current = ext.map((ex) => {
      if (enabledExtensions.includes(ex.extensionId)) {
        return { ...ex, extensionEnabled: true };
      }
      return ex;
    });
    forceUpdate();
  }

  function removeExtension(extensionId: string) {
    extensions.current = extensions.current.filter(
      (ext) => ext.extensionId !== extensionId,
    );
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.sendMessage('removeExtension', extensionId);
    } else {
      console.error('remove extensions is supported only on Electron.');
    }
    forceUpdate();
  }

  function updateExtension(extension: TS.Extension) {
    extensions.current = mergeByProp(
      extensions.current,
      [extension],
      'extensionId',
    );
    forceUpdate();
  }

  const context = useMemo(() => {
    return {
      extensions: extensions.current,
      addExtensions,
      removeExtension,
      updateExtension,
    };
  }, [extensions.current]);

  return (
    <ExtensionsContext.Provider value={context}>
      {children}
    </ExtensionsContext.Provider>
  );
};
