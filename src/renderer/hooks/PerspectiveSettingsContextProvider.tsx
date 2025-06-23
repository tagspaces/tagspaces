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
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { TS } from '-/tagspaces.namespace';
import { Pro } from '-/pro';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { mergeFsEntryMeta } from '-/services/utils-io';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';
import useFirstRender from '-/utils/useFirstRender';

type PerspectiveSettingsContextData = {
  settings: TS.FolderSettings;
  orderBy: boolean;
  sortBy: string;
  singleClickAction: string;
  entrySize: TS.EntrySizes;
  thumbnailMode: TS.ThumbnailMode;
  showDirectories: boolean;
  showDetails: boolean;
  showDescription: boolean;
  showEntriesDescription: boolean;
  showTags: boolean;
  gridPageLimit: number;
  showFolderContent: boolean; //KanBan
  layoutType: string; //KanBan
  showSubFolderDetails: boolean; // KanBan
  filesLimit: number; // KanBan
  haveLocalSetting: () => boolean;
  resetLocalSetting: () => void;
  setSettings: (set: any) => void;
  saveSettings: (isDefaultSetting?: boolean) => void;
};

export const PerspectiveSettingsContext =
  createContext<PerspectiveSettingsContextData>({
    settings: undefined,
    orderBy: true,
    sortBy: 'byName',
    singleClickAction: 'openInternal', // openInternal openExternal
    entrySize: 'small',
    thumbnailMode: 'contain', // cover contain
    showDirectories: true,
    showDetails: true,
    showDescription: false,
    showEntriesDescription: true,
    showTags: true,
    gridPageLimit: 100,
    showFolderContent: false,
    layoutType: 'grid',
    showSubFolderDetails: false,
    filesLimit: 15,
    haveLocalSetting: undefined,
    resetLocalSetting: undefined,
    setSettings: undefined,
    saveSettings: undefined,
  });

export type PerspectiveSettingsContextProviderProps = {
  children: React.ReactNode;
};

export const PerspectiveSettingsContextProvider = ({
  children,
}: PerspectiveSettingsContextProviderProps) => {
  const { findLocation } = useCurrentLocationContext();
  const {
    currentDirectoryPath,
    directoryMeta,
    setDirectoryMeta,
    getDefaultPerspectiveSettings,
    currentPerspective,
  } = useDirectoryContentContext();
  const { metaActions } = useEditedEntryMetaContext();
  const { removeFolderCustomSettings, saveCurrentLocationMetaData } =
    useIOActionsContext();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const settings = useRef<TS.FolderSettings>(
    getSettings(currentPerspective, directoryMeta),
  );
  const firstRender = useFirstRender();

  useEffect(() => {
    if (!firstRender) {
      settings.current = getSettings(currentPerspective, directoryMeta);
      forceUpdate();
    }
  }, [currentDirectoryPath, directoryMeta]);

  useEffect(() => {
    if (!firstRender && metaActions && metaActions.length > 0) {
      for (const action of metaActions) {
        if (action.action === 'perspectiveChange') {
          settings.current = getSettings(currentPerspective, directoryMeta);
          forceUpdate();
        }
      }
    }
  }, [metaActions]);

  function getSettings(
    persp: string,
    directoryMeta: TS.FileSystemEntryMeta,
  ): TS.FolderSettings {
    const defaultSettings = getDefaultPerspectiveSettings(persp);
    let s: TS.FolderSettings = defaultSettings;
    if (
      Pro &&
      directoryMeta &&
      directoryMeta.perspectiveSettings &&
      directoryMeta.perspectiveSettings[persp]
    ) {
      const proSettings: TS.FolderSettings =
        directoryMeta.perspectiveSettings[persp];
      if (proSettings) {
        s = { ...s, ...proSettings };
      }
    } else if (defaultSettings.settingsKey) {
      // loading settings for not Pro
      const localStorageSettings: TS.FolderSettings = JSON.parse(
        localStorage.getItem(defaultSettings.settingsKey),
      );
      if (localStorageSettings) {
        s = { ...s, ...localStorageSettings };
      }
    }

    return s;
  }

  function setSettings(newSettings) {
    settings.current = { ...settings.current, ...newSettings };
    forceUpdate();
  }

  function haveLocalSetting() {
    return (
      directoryMeta &&
      directoryMeta.perspectiveSettings &&
      directoryMeta.perspectiveSettings[currentPerspective]
    );
  }

  /**
   * remove custom folder settings
   */
  function resetLocalSetting() {
    removeFolderCustomSettings(currentDirectoryPath, currentPerspective).then(
      (fsEntryMeta: TS.FileSystemEntryMeta) => {
        setDirectoryMeta(fsEntryMeta);
        settings.current = getSettings(currentPerspective, fsEntryMeta);
        forceUpdate();
      },
    );
  }

  /**
   * @param isDefaultSetting  true: save in default settings; false: save per folder settings;
   */
  function saveSettings(isDefaultSetting = undefined) {
    if (isDefaultSetting === undefined) {
      isDefaultSetting = !haveLocalSetting();
    }
    const { settingsKey, ...cleanSettings } = settings.current;
    if (Pro && !isDefaultSetting) {
      setPerspectiveSettings(
        currentDirectoryPath,
        currentPerspective,
        cleanSettings,
      ).then((updatedFsEntryMeta: TS.FileSystemEntryMeta) => {
        saveCurrentLocationMetaData(currentDirectoryPath, updatedFsEntryMeta);
        setDirectoryMeta(updatedFsEntryMeta);
      });
    } else {
      if (
        Pro &&
        directoryMeta &&
        directoryMeta.perspectiveSettings &&
        directoryMeta.perspectiveSettings[currentPerspective]
      ) {
        // clean custom settings for currentPerspective
        setPerspectiveSettings(
          currentDirectoryPath,
          currentPerspective,
          undefined,
        ).then((updatedFsEntryMeta: TS.FileSystemEntryMeta) =>
          saveCurrentLocationMetaData(currentDirectoryPath, updatedFsEntryMeta),
        );
      }
      const defaultSettings = getDefaultPerspectiveSettings(currentPerspective);
      localStorage.setItem(
        defaultSettings.settingsKey,
        JSON.stringify(cleanSettings),
      );
    }
  }

  function setPerspectiveSettings(
    path: string,
    perspective: string,
    folderSettings?: TS.FolderSettings,
  ): Promise<TS.FileSystemEntryMeta> {
    const currentLocation = findLocation();
    return currentLocation
      ?.loadMetaDataPromise(path)
      .then((fsEntryMeta: TS.FileSystemEntryMeta) => {
        return {
          ...(fsEntryMeta && fsEntryMeta),
          perspectiveSettings: {
            ...(fsEntryMeta &&
              fsEntryMeta.perspectiveSettings &&
              fsEntryMeta.perspectiveSettings),
            [perspective]: folderSettings,
          },
        };
      })
      .catch(() => {
        return mergeFsEntryMeta({
          perspectiveSettings: {
            [perspective]: folderSettings,
          },
        });
      });
  }

  const context = useMemo(() => {
    return {
      settings: settings.current,
      showDirectories: settings.current.showDirectories,
      showDescription: settings.current.showDescription,
      showEntriesDescription: settings.current.showEntriesDescription,
      showDetails: settings.current.showDetails,
      showTags: settings.current.showTags,
      orderBy: settings.current.orderBy,
      sortBy: settings.current.sortBy,
      singleClickAction: settings.current.singleClickAction,
      entrySize: settings.current.entrySize,
      thumbnailMode: settings.current.thumbnailMode,
      gridPageLimit: settings.current.gridPageLimit,
      showFolderContent: settings.current.showFolderContent,
      layoutType: settings.current.layoutType,
      showSubFolderDetails: settings.current.showSubFolderDetails,
      filesLimit: settings.current.filesLimit,
      resetLocalSetting: resetLocalSetting,
      haveLocalSetting: haveLocalSetting,
      setSettings: setSettings,
      saveSettings: saveSettings,
    };
  }, [settings.current, currentDirectoryPath, directoryMeta]);

  return (
    <PerspectiveSettingsContext.Provider value={context}>
      {children}
    </PerspectiveSettingsContext.Provider>
  );
};
