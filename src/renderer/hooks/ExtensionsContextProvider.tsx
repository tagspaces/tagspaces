/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces GmbH
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
  getExtensionsFound,
} from '-/reducers/settings';
import { Extensions } from '../../main/types';
import { TS } from '-/tagspaces.namespace';
import { useDispatch, useSelector } from 'react-redux';
import { mergeByProp } from '-/services/utils-io';

type ExtensionsContextData = {
  extensions: TS.Extension[];
  addExtensions: (newExt: TS.Extension[]) => void;
  removeExtension: (extensionId: string) => void;
  updateExtension: (extension: TS.Extension) => void;
  enableExtension: (extensionId: string, enabled: boolean) => void;
};

export const ExtensionsContext = createContext<ExtensionsContextData>({
  extensions: undefined,
  addExtensions: undefined,
  removeExtension: undefined,
  updateExtension: undefined,
  enableExtension: undefined,
});

export type ExtensionsContextProviderProps = {
  children: React.ReactNode;
};

export const ExtensionsContextProvider = ({
  children,
}: ExtensionsContextProviderProps) => {
  const dispatch: AppDispatch = useDispatch();
  const extensionsFound = useSelector(getExtensionsFound);
  const extensions = useRef<TS.Extension[]>(extensionsFound);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const enableExtensionsKey = 'ENABLE_EXTENSION';

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

  function getEnabledExtensions(): string[] {
    const item = localStorage.getItem(enableExtensionsKey);
    if (item) {
      return JSON.parse(item);
    }
    return [];
  }

  function enableExtension(extensionId: string, enabled: boolean): void {
    let enabledExtensions = getEnabledExtensions();
    if (enabled) {
      if (!enabledExtensions.includes(extensionId)) {
        enabledExtensions.push(extensionId);
      }
      // todo dispatch(SettingsActions.addSupportedFileTypes(extensionId));
    } else {
      enabledExtensions = enabledExtensions.filter(
        (extId) => extId !== extensionId,
      );
      dispatch(SettingsActions.removeSupportedFileTypes(extensionId));
    }
    localStorage.setItem(
      enableExtensionsKey,
      JSON.stringify(enabledExtensions),
    );
    updateEnabledExtensions(extensions.current);
    forceUpdate();
  }

  function updateEnabledExtensions(ext) {
    extensions.current = ext.map((ex) => {
      if (
        getEnabledExtensions().some((enabledExtension) =>
          ex.extensionId.startsWith(enabledExtension),
        )
      ) {
        return { ...ex, extensionEnabled: true };
      }
      if (ex.extensionExternal) {
        return { ...ex, extensionEnabled: false };
      }
      return ex;
    });
  }

  function addExtensions(newExt: TS.Extension[]) {
    const ext = mergeByProp(extensions.current, newExt, 'extensionId');
    updateEnabledExtensions(ext);
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
      enableExtension,
    };
  }, [extensions.current]);

  return (
    <ExtensionsContext.Provider value={context}>
      {children}
    </ExtensionsContext.Provider>
  );
};
