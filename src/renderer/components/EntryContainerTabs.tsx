/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

import EntryContainerButtons from '-/components/EntryContainerButtons';
import LoadingLazy from '-/components/LoadingLazy';
import TsTabPanel from '-/components/TsTabPanel';
import { TabItem, TabNames } from '-/hooks/EntryPropsTabsContextProvider';
import { useChatContext } from '-/hooks/useChatContext';
import { useEntryPropsTabsContext } from '-/hooks/useEntryPropsTabsContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { AppDispatch } from '-/reducers/app';
import {
  actions as SettingsActions,
  getEntryContainerTab,
  getMapTileServer,
} from '-/reducers/settings';
import { Box, Tab, Tabs, TabsProps } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import React, { useEffect, useReducer, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const TabContent1 = React.lazy(
  () => import(/* webpackChunkName: "EntryProperties" */ './EntryProperties'),
);
const TabContent2 = React.lazy(
  () => import(/* webpackChunkName: "EditDescription" */ './EditDescription'),
);
const TabContent3 = React.lazy(
  () => import(/* webpackChunkName: "Revisions" */ './Revisions'),
);
const TabContent4 = React.lazy(
  () => import(/* webpackChunkName: "AiPropertiesTab" */ './AiPropertiesTab'),
);
const TabContent5 = React.lazy(
  () => import(/* webpackChunkName: "AiPropertiesTab" */ './LinksTab'),
);

interface EntryContainerTabsProps {
  openPanel: () => void;
  toggleProperties: () => void;
  isPanelOpened: boolean;
  isSavingInProgress: boolean;
  savingFile: () => void;
}

function EntryContainerTabs(props: EntryContainerTabsProps) {
  const {
    openPanel,
    toggleProperties,
    isPanelOpened,
    isSavingInProgress,
    savingFile,
  } = props;
  const { initHistory, checkOllamaModels } = useChatContext();
  const { getTabsArray } = useEntryPropsTabsContext();
  const theme = useTheme();
  const selectedTab: (typeof TabNames)[keyof typeof TabNames] =
    useSelector(getEntryContainerTab);
  const tileServer = useSelector(getMapTileServer);
  const tabsArray = useRef<TabItem[]>([]);
  const dispatch: AppDispatch = useDispatch();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const { openedEntry } = useOpenedEntryContext();

  useEffect(() => {
    getTabsArray(openedEntry).then((tabs) => {
      tabsArray.current = tabs;
      forceUpdate();
    });
  }, [openedEntry]);

  const StyledTabs = styled((props: TabsProps) => (
    <Tabs
      {...props}
      slotProps={{
        indicator: { children: <span className="MuiTabs-indicatorSpan" /> },
      }}
    />
  ))({
    '& .MuiTabs-indicator': {
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    '& .MuiTabs-indicatorSpan': {
      maxWidth: 55,
      width: '100%',
      backgroundColor: theme.palette.primary.main,
    },
  });

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    if (tabsArray.current.length > 0) {
      const tab = tabsArray.current[newValue];
      if (tab && tab.name === TabNames.aiTab) {
        checkOllamaModels().then(() => initHistory());
      }
      dispatch(SettingsActions.setEntryContainerTab(tab.name));
      openPanel();
      console.log('tab changed to:' + newValue);
    }
  };

  function handleTabClick(selectedTabIndex, index: number) {
    if (
      openedEntry.isFile &&
      selectedTabIndex === index //parseInt(event.currentTarget.id.split('-')[1], 10)
    ) {
      // when selected tab is clicked...
      dispatch(SettingsActions.setEntryContainerTab(TabNames.closedTabs));
      toggleProperties();
      console.log('tab click:' + index);
    }
  }

  function getSelectedTabIndex() {
    if (!isPanelOpened && openedEntry.isFile) {
      return undefined;
    }
    const index = tabsArray.current.findIndex(
      (tab) => tab.name === selectedTab,
    );
    if (index > -1) {
      return index;
    }
    return 0;
  }

  const selectedTabIndex = getSelectedTabIndex();

  function getTabContainer(tabName: string) {
    if (tabName === TabNames.propertiesTab) {
      return <TabContent1 key={openedEntry.path} tileServer={tileServer} />;
    } else if (tabName === TabNames.descriptionTab) {
      return <TabContent2 />;
    } else if (tabName === TabNames.revisionsTab) {
      return <TabContent3 />;
    } else if (tabName === TabNames.aiTab) {
      return <TabContent4 />;
    } else if (tabName === TabNames.linksTab) {
      return <TabContent5 />;
    }
  }
  if (tabsArray.current.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderBottom:
          openedEntry.isFile && !isPanelOpened
            ? '1px solid ' + theme.palette.divider
            : 'none',
      }}
    >
      <Box
        sx={{
          display: 'flex',
        }}
      >
        <StyledTabs
          value={selectedTabIndex}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons={false}
          aria-label="Switching among description, revisions entry properties"
        >
          {tabsArray.current.map((tab, index) => (
            <Tab
              key={'key' + tab.name + index}
              data-tid={tab.name + 'TID'}
              // @ts-ignore
              icon={tab.icon}
              label={tab.title}
              sx={{
                paddingLeft: 0,
                paddingRight: 0,
                fontSize: '12px',
                fontWeight: 'normal',
                textTransform: 'none',
                paddingTop: '0px',
                paddingBottom: '0px',
                minHeight: '60px', // 68px
                marginLeft: '-8px',
                marginRight: '-8px',
              }}
              id={`tab-${index}`}
              ariaControls={`simple-tabpanel-${index}`}
              onClick={() => handleTabClick(selectedTabIndex, index)}
            />
          ))}
        </StyledTabs>
        <EntryContainerButtons
          isSavingInProgress={isSavingInProgress}
          savingFile={savingFile}
        />
      </Box>
      {tabsArray.current.map((tab, index) => (
        <TsTabPanel key={tab.name} value={selectedTabIndex} index={index}>
          {selectedTabIndex === index && (
            <React.Suspense fallback={<LoadingLazy />}>
              {getTabContainer(tab.name)}
            </React.Suspense>
          )}
        </TsTabPanel>
      ))}
    </Box>
  );
}

export default EntryContainerTabs;
