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
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { TS } from '-/tagspaces.namespace';
import { PerspectiveIDs } from '-/perspectives';
import { Pro } from '-/pro';
import {
  defaultSettings,
  defaultSettings as defaultGridSettings,
} from '-/perspectives/grid-perspective';
import { defaultSettings as defaultListSettings } from '-/perspectives/list';
import { removeFolderCustomSettings } from '-/utils/metaoperations';

type PerspectiveSettingsContextData = {
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
  const {
    currentDirectoryPath,
    currentDirectoryPerspective,
    directoryMeta,
    setDirectoryMeta,
  } = useDirectoryContentContext();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const settings = useRef<TS.FolderSettings>(
    getSettings(getPerspective(), directoryMeta),
  );

  useEffect(() => {
    settings.current = getSettings(getPerspective(), directoryMeta);
    forceUpdate();
  }, [currentDirectoryPerspective, directoryMeta]);

  function getDefaultSettings(perspective: string) {
    if (perspective === PerspectiveIDs.GRID) {
      return defaultGridSettings;
    } else if (perspective === PerspectiveIDs.LIST) {
      return defaultListSettings;
    } else if (perspective === PerspectiveIDs.KANBAN && Pro) {
      return Pro.Perspectives.KanBanPerspective.defaultSettings;
    }
    return defaultGridSettings;
  }

  function getSettings(
    perspective: string,
    directoryMeta: TS.FileSystemEntryMeta,
  ): TS.FolderSettings {
    const defaultSettings = getDefaultSettings(perspective);
    let s: TS.FolderSettings = defaultSettings;
    if (
      Pro &&
      directoryMeta &&
      directoryMeta.perspectiveSettings &&
      directoryMeta.perspectiveSettings[perspective]
    ) {
      const proSettings: TS.FolderSettings =
        directoryMeta.perspectiveSettings[perspective];
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
      directoryMeta.perspectiveSettings[getPerspective()]
    );
  }

  /**
   * remove custom folder settings
   */
  function resetLocalSetting() {
    removeFolderCustomSettings(currentDirectoryPath, getPerspective()).then(
      (fsEntryMeta: TS.FileSystemEntryMeta) => {
        setDirectoryMeta(fsEntryMeta);
      },
    );
  }

  function getPerspective() {
    return currentDirectoryPerspective === PerspectiveIDs.UNSPECIFIED
      ? PerspectiveIDs.GRID
      : currentDirectoryPerspective;
  }

  /**
   * @param isDefaultSetting  true: save in default settings; false: save per folder settings;
   */
  function saveSettings(isDefaultSetting = undefined) {
    if (isDefaultSetting === undefined) {
      isDefaultSetting = !haveLocalSetting();
    }
    if (Pro && !isDefaultSetting) {
      Pro.MetaOperations.savePerspectiveSettings(
        currentDirectoryPath,
        getPerspective(),
        settings.current,
      ).then((fsEntryMeta: TS.FileSystemEntryMeta) => {
        setDirectoryMeta(fsEntryMeta);
      });
    } else {
      localStorage.setItem(
        defaultSettings.settingsKey,
        JSON.stringify(settings.current),
      );
    }
  }

  const context = useMemo(() => {
    return {
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
  }, [settings.current]);

  return (
    <PerspectiveSettingsContext.Provider value={context}>
      {children}
    </PerspectiveSettingsContext.Provider>
  );
};
