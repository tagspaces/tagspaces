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

import React, { createContext, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import AppConfig from '-/AppConfig';
import {
  AIIcon,
  DescriptionIcon,
  EditDescriptionIcon,
  FolderPropertiesIcon,
  RevisionIcon,
} from '-/components/CommonIcons';
import { Pro } from '-/pro';
import {
  extractFileExtension,
  getBackupFileDir,
} from '@tagspaces/tagspaces-common/paths';
import { CommonLocation } from '-/utils/CommonLocation';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useDispatch, useSelector } from 'react-redux';
import { actions as SettingsActions, isDevMode } from '-/reducers/settings';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { AppDispatch } from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';

export type TabItem = {
  //dataTid: string;
  icon: React.ReactNode;
  title: string;
  name: string;
};

export const TabNames = {
  propertiesTab: 'detailsTab',
  descriptionTab: 'descriptionTab',
  revisionsTab: 'revisionsTab',
  aiTab: 'aiTab',
};

type EntryPropsTabsContextData = {
  getTabsArray: (openedEntry: TS.OpenedEntry) => Promise<TabItem[]>;
  isEditable: (openedEntry: TS.OpenedEntry) => boolean;
  setOpenedTab: (
    tabName: (typeof TabNames)[keyof typeof TabNames],
    openedEntry: TS.OpenedEntry,
  ) => Promise<number>;
};

export const EntryPropsTabsContext = createContext<EntryPropsTabsContextData>({
  getTabsArray: undefined,
  isEditable: undefined,
  setOpenedTab: undefined,
});

export type EntryPropsTabsContextProviderProps = {
  children: React.ReactNode;
};

export const EntryPropsTabsContextProvider = ({
  children,
}: EntryPropsTabsContextProviderProps) => {
  const { t } = useTranslation();

  const { findLocation, readOnlyMode } = useCurrentLocationContext();

  // const { isEditMode } = useFilePropertiesContext();
  const dispatch: AppDispatch = useDispatch();

  const devMode: boolean = useSelector(isDevMode);

  //const haveRevisions = useRef<boolean>(isEditable());
  //const tabsArray = useRef<TabItem[]>(getTabsArray(openedEntry));
  //const [ignored, forceUpdate] = React.useReducer((x) => x + 1, 0, undefined);

  function haveRevisions(openedEntry: TS.OpenedEntry): Promise<boolean> {
    //selectedTabIndex.current = initSelectedTabIndex(tabIndex);
    if (isEditable(openedEntry)) {
      const location: CommonLocation = findLocation(openedEntry.locationID);
      const backupFilePath = getBackupFileDir(
        openedEntry.path,
        openedEntry.uuid,
        location?.getDirSeparator(),
      );
      return location?.checkDirExist(backupFilePath);
    }
    return Promise.resolve(false);
  }

  function isEditable(openedEntry: TS.OpenedEntry): boolean {
    if (openedEntry) {
      /* const fileExtension = extractFileExtension(
        openedEntry.path,
        currentLocation?.getDirSeparator(),
      );*/
      return (
        !readOnlyMode &&
        openedEntry.isFile &&
        AppConfig.editableFiles.includes(openedEntry.extension)
      );
    }
    return false;
  }

  async function getTabsArray(oEntry: TS.OpenedEntry): Promise<TabItem[]> {
    const tab1: TabItem = {
      icon: <FolderPropertiesIcon />,
      title: t('core:details'),
      name: TabNames.propertiesTab,
    };
    const tab2: TabItem = {
      icon:
        oEntry && oEntry.meta && oEntry.meta.description ? (
          <EditDescriptionIcon />
        ) : (
          <DescriptionIcon />
        ),
      title: t('core:filePropertiesDescription'),
      name: TabNames.descriptionTab,
    };

    const tabsArray: TabItem[] = [tab1, tab2];
    const revisions = await haveRevisions(oEntry);
    if (revisions) {
      const tab3: TabItem = {
        icon: <RevisionIcon />,
        title: t('core:revisions'),
        name: TabNames.revisionsTab,
      };
      tabsArray.push(tab3);
    }

    if (
      (oEntry && !oEntry.isFile) ||
      (devMode && Pro && AppConfig.isElectron)
    ) {
      if (AppConfig.isElectron) {
        // todo enable for web
        const tab4: TabItem = {
          icon: <AIIcon />,
          title: t('core:aiSettingsTab'),
          name: TabNames.aiTab,
        };
        tabsArray.push(tab4);
      }
    }
    return tabsArray;
  }

  /**
   * @param tabName
   * @param openedEntry
   * return tabIndex or -1 if not tab exist with tabName
   */
  async function setOpenedTab(
    tabName: (typeof TabNames)[keyof typeof TabNames],
    openedEntry: TS.OpenedEntry,
  ): Promise<number> {
    const allTabs = await getTabsArray(openedEntry);
    const tabIndex = allTabs.findIndex((tab) => tab.name === tabName);
    if (tabIndex > -1) {
      dispatch(SettingsActions.setEntryContainerTab(tabIndex));
    } else {
      console.log('no tab with name:' + tabName + ' exist!');
    }
    return tabIndex;
  }

  const context = useMemo(() => {
    return {
      getTabsArray,
      isEditable,
      setOpenedTab,
    };
  }, []);

  return (
    <EntryPropsTabsContext.Provider value={context}>
      {children}
    </EntryPropsTabsContext.Provider>
  );
};
