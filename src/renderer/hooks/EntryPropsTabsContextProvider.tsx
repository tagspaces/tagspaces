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
  EntryPropertiesIcon,
  LinkIcon,
  RevisionIcon,
} from '-/components/CommonIcons';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { Pro } from '-/pro';
import { isDevMode } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import { getBackupDir } from '@tagspaces/tagspaces-common/paths';
import React, { createContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

export type TabItem = {
  icon: React.ReactNode;
  title: string;
  showBadge: boolean;
  badgeTooltip?: string;
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
};

export const EntryPropsTabsContext = createContext<EntryPropsTabsContextData>({
  getTabsArray: undefined,
  isEditable: undefined,
});

export type EntryPropsTabsContextProviderProps = {
  children: React.ReactNode;
};

export const EntryPropsTabsContextProvider = ({
  children,
}: EntryPropsTabsContextProviderProps) => {
  const { t } = useTranslation();

  const { findLocation } = useCurrentLocationContext();
  const devMode: boolean = useSelector(isDevMode);

  function haveRevisions(openedEntry: TS.OpenedEntry): Promise<boolean> {
    const location: CommonLocation = findLocation(openedEntry.locationID);
    const backupPath = getBackupDir(openedEntry);
    return location?.checkDirExist(backupPath);
  }

  function haveAIChat(openedEntry: TS.OpenedEntry): Promise<boolean> {
    if (openedEntry.isFile) {
      return Promise.resolve(false);
    }
    const location: CommonLocation = findLocation(openedEntry.locationID);
    const dirSeparator = location
      ? location.getDirSeparator()
      : AppConfig.dirSeparator;
    const aiChatPath =
      openedEntry.path +
      dirSeparator +
      AppConfig.metaFolder +
      dirSeparator +
      AppConfig.aiFolder;
    return location?.checkDirExist(aiChatPath);
  }

  function isEditable(openedEntry: TS.OpenedEntry): boolean {
    if (openedEntry) {
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
      showBadge: false,
      title: t('core:details'),
      name: TabNames.propertiesTab,
    };
    const tab2: TabItem = {
      // icon:
      //   oEntry && oEntry.meta && oEntry.meta.description ? (
      //     <EditDescriptionIcon />
      //   ) : (
      //     <DescriptionIcon />
      //   ),
      icon: <DescriptionIcon />,
      showBadge: Boolean(oEntry && oEntry.meta && oEntry.meta.description),
      badgeTooltip: t('core:descriptionAvailable'),
      title: t('core:filePropertiesDescription'),
      name: TabNames.descriptionTab,
    };

    const tabsArray: TabItem[] = [tab1, tab2];
    const revisions = await haveRevisions(oEntry);
    if (revisions) {
      const tab3: TabItem = {
        icon: <RevisionIcon />,
        showBadge: false,
        title: t('core:revisions'),
        name: TabNames.revisionsTab,
      };
      tabsArray.push(tab3);
    }

    if (!oEntry?.isFile || (devMode && oEntry?.isFile && Pro)) {
      const aiChatAvailable = await haveAIChat(oEntry);
      const tab4: TabItem = {
        showBadge: aiChatAvailable,
        icon: <AIIcon />,
        title: t('core:aiChatTab'),
        badgeTooltip: t('core:aiChatAvailable'),
        name: TabNames.aiTab,
      };
      tabsArray.push(tab4);
    }
    const tab5: TabItem = {
      icon: <LinkIcon />,
      showBadge: false,
      title: t('core:links'),
      name: TabNames.linksTab,
    };
    tabsArray.push(tab5);
    return tabsArray;
  }

  const context = useMemo(() => {
    return {
      getTabsArray,
      isEditable,
    };
  }, []);

  return (
    <EntryPropsTabsContext.Provider value={context}>
      {children}
    </EntryPropsTabsContext.Provider>
  );
};
