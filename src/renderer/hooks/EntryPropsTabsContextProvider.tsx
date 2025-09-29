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

import AppConfig from '-/AppConfig';
import {
  AIIcon,
  DescriptionIcon,
  EditDescriptionIcon,
  EntryPropertiesIcon,
  RevisionIcon,
} from '-/components/CommonIcons';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { Pro } from '-/pro';
import { isDevMode } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import LinkIcon from '@mui/icons-material/Link';
import { getBackupDir } from '@tagspaces/tagspaces-common/paths';
import React, { createContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

export type TabItem = {
  //dataTid: string;
  icon: React.ReactNode;
  title: string;
  name: (typeof TabNames)[keyof typeof TabNames];
};

export const TabNames = {
  propertiesTab: 'detailsTab',
  descriptionTab: 'descriptionTab',
  revisionsTab: 'revisionsTab',
  aiTab: 'aiTab',
  linksTab: 'linksTab',
  closedTabs: 'closedTabs',
};

type EntryPropsTabsContextData = {
  getTabsArray: (openedEntry: TS.OpenedEntry) => Promise<TabItem[]>;
  isEditable: (openedEntry: TS.OpenedEntry) => boolean;
  /*setOpenedTab: (
    tabName: (typeof TabNames)[keyof typeof TabNames],
    openedEntry: TS.OpenedEntry,
  ) => Promise<number>;*/
  /*isTabOpened: (
    tabName: (typeof TabNames)[keyof typeof TabNames],
    openedEntry: TS.OpenedEntry,
    selectedTabIndex: number,
  ) => Promise<boolean>;*/
};

export const EntryPropsTabsContext = createContext<EntryPropsTabsContextData>({
  getTabsArray: undefined,
  isEditable: undefined,
  //setOpenedTab: undefined,
  //isTabOpened: undefined,
});

export type EntryPropsTabsContextProviderProps = {
  children: React.ReactNode;
};

export const EntryPropsTabsContextProvider = ({
  children,
}: EntryPropsTabsContextProviderProps) => {
  const { t } = useTranslation();

  const { findLocation } = useCurrentLocationContext();
  // const dispatch: AppDispatch = useDispatch();
  const devMode: boolean = useSelector(isDevMode);

  //const haveRevisions = useRef<boolean>(isEditable());
  //const tabsArray = useRef<TabItem[]>(getTabsArray(openedEntry));
  //const [ignored, forceUpdate] = React.useReducer((x) => x + 1, 0, undefined);

  function haveRevisions(openedEntry: TS.OpenedEntry): Promise<boolean> {
    //if (isEditable(openedEntry)) {
    const location: CommonLocation = findLocation(openedEntry.locationID);
    const backupPath = getBackupDir(openedEntry);
    return location?.checkDirExist(backupPath);
    //}
    //return Promise.resolve(false);
  }

  function isEditable(openedEntry: TS.OpenedEntry): boolean {
    if (openedEntry) {
      /* const fileExtension = extractFileExtension(
        openedEntry.path,
        currentLocation?.getDirSeparator(),
      );*/
      const location: CommonLocation = findLocation(openedEntry.locationID);
      return (
        !location.isReadOnly &&
        openedEntry.isFile &&
        AppConfig.editableFiles.includes(openedEntry.extension)
      );
    }
    return false;
  }

  async function getTabsArray(oEntry: TS.OpenedEntry): Promise<TabItem[]> {
    const openedLocation: CommonLocation = findLocation(oEntry.locationID);
    const tab1: TabItem = {
      icon: <EntryPropertiesIcon />,
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

    if ((oEntry && !oEntry.isFile) || (devMode && Pro)) {
      if (!openedLocation.isReadOnly) {
        const tab4: TabItem = {
          icon: <AIIcon />,
          title: oEntry.isFile ? t('core:aiSettingsTab') : t('core:aiChatTab'),
          name: TabNames.aiTab,
        };
        tabsArray.push(tab4);
      }
    }
    const tab5: TabItem = {
      icon: <LinkIcon />,
      title: t('core:links'),
      name: TabNames.linksTab,
    };
    tabsArray.push(tab5);
    return tabsArray;
  }

  /**
   * @param tabName
   * @param openedEntry
   * return tabIndex or -1 if not tab exist with tabName
   */
  /*async function setOpenedTab(
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
  }*/

  /*async function isTabOpened(
    tabName: (typeof TabNames)[keyof typeof TabNames],
    openedEntry: TS.OpenedEntry,
    selectedTabIndex: number,
  ): Promise<boolean> {
    const allTabs = await getTabsArray(openedEntry);
    const tabIndex = allTabs.findIndex((tab) => tab.name === tabName);
    const maxTabIndex = allTabs.length - 1;
    const currentOpenedTab =
      selectedTabIndex > maxTabIndex ? maxTabIndex : selectedTabIndex;
    return tabIndex !== -1 && tabIndex === currentOpenedTab;
  }*/

  const context = useMemo(() => {
    return {
      getTabsArray,
      isEditable,
      //setOpenedTab,
      //isTabOpened,
    };
  }, []);

  return (
    <EntryPropsTabsContext.Provider value={context}>
      {children}
    </EntryPropsTabsContext.Provider>
  );
};
