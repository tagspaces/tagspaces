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
import { Box, Tab, Tabs, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import React, { useEffect, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

interface StyledTabsProps {
  children?: React.ReactNode;
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const StyledTabs = styled((props: StyledTabsProps) => (
  <Tabs
    {...props}
    variant="scrollable"
    // scrollButtons={}
    // allowScrollButtonsMobile
    TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
  />
))(({ theme }) => ({
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  '& .MuiTabs-indicatorSpan': {
    maxWidth: 40,
    width: '100%',
    backgroundColor: theme.palette.text.primary, //theme.palette.background.default //'#635ee7',
  },
}));

interface StyledTabProps {
  title: string;
  tinyMode: any;
  icon: any;
  onClick: (event: React.SyntheticEvent) => void;
}

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

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
  marginRight: string;
}

function EntryContainerTabs(props: EntryContainerTabsProps) {
  const { openPanel, toggleProperties, marginRight, isPanelOpened } = props;

  const { t } = useTranslation();
  const { initHistory, checkOllamaModels } = useChatContext();
  const { getTabsArray } = useEntryPropsTabsContext();
  const { openedEntry } = useOpenedEntryContext();
  const theme = useTheme();
  //const devMode: boolean = useSelector(isDevMode);
  const selectedTab: (typeof TabNames)[keyof typeof TabNames] =
    useSelector(getEntryContainerTab);
  const tileServer = useSelector(getMapTileServer);
  const tabsArray = useRef<TabItem[]>([]);
  const dispatch: AppDispatch = useDispatch();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const isTinyMode = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    getTabsArray(openedEntry).then((tabs) => {
      tabsArray.current = tabs;
      forceUpdate();
    });
  }, [openedEntry]);

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
    /*if (selectedTab === 0 || selectedTab === undefined) {
      return 0;
    }*/
    const index = tabsArray.current.findIndex(
      (tab) => tab.name === selectedTab,
    );
    if (index > -1) {
      return index;
    }
    return 0;
    /*const maxTabIndex = tabsArray.current.length - 1;
    if (tabIndex > maxTabIndex) {
      return maxTabIndex;
    }
    return tabIndex;*/
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
    <div
      style={{
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
      <Box sx={{ ...(marginRight && { marginRight }) }}>
        <StyledTabs
          value={selectedTabIndex}
          onChange={handleChange}
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
                fontSize: 12,
                fontWeight: 'normal',
                textTransform: 'none',
                paddingTop: '0px',
                paddingBottom: '0px',
                minHeight: '68px',
              }}
              {...a11yProps(index)}
              onClick={() => handleTabClick(selectedTabIndex, index)}
            />
          ))}
        </StyledTabs>
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
    </div>
  );
}

export default EntryContainerTabs;
