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

import AppConfig from '-/AppConfig';
import LoadingLazy from '-/components/LoadingLazy';
import TsTabPanel from '-/components/TsTabPanel';
import { TabItem, TabNames } from '-/hooks/EntryPropsTabsContextProvider';
import { useChatContext } from '-/hooks/useChatContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useEntryPropsTabsContext } from '-/hooks/useEntryPropsTabsContext';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { Pro } from '-/pro';
import { AppDispatch } from '-/reducers/app';
import {
  actions as SettingsActions,
  getEntryContainerTab,
  getMapTileServer,
  isDesktopMode,
  isRevisionsEnabled,
} from '-/reducers/settings';
import {
  Box,
  ButtonGroup,
  Switch,
  Tab,
  Tabs,
  TabsProps,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import React, { useEffect, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { CancelIcon, CloseEditIcon, SaveIcon } from './CommonIcons';
import EditFileButton from './EditFileButton';
import TsButton from './TsButton';
import { useResolveConflictContext } from './dialogs/hooks/useResolveConflictContext';

interface StyledTabsProps {
  children?: React.ReactNode;
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}
interface StyledTabProps {
  title: string;
  tinyMode: any;
  icon: any;
  onClick: (event: React.SyntheticEvent) => void;
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
  const { t } = useTranslation();
  const { initHistory, checkOllamaModels } = useChatContext();
  const { getTabsArray } = useEntryPropsTabsContext();
  const theme = useTheme();
  //const devMode: boolean = useSelector(isDevMode);
  const selectedTab: (typeof TabNames)[keyof typeof TabNames] =
    useSelector(getEntryContainerTab);
  const tileServer = useSelector(getMapTileServer);
  const tabsArray = useRef<TabItem[]>([]);
  const dispatch: AppDispatch = useDispatch();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const isTinyMode = useMediaQuery(theme.breakpoints.down('sm'));
  const desktopMode = useSelector(isDesktopMode);
  const { saveDescription, isEditMode, setEditMode, closeOpenedEntries } =
    useFilePropertiesContext();
  const { setAutoSave } = useIOActionsContext();
  const { isEditable } = useEntryPropsTabsContext();
  const { saveFileOpen } = useResolveConflictContext();
  const { showNotification } = useNotificationContext();
  const revisionsEnabled = useSelector(isRevisionsEnabled);
  const { findLocation } = useCurrentLocationContext();
  const {
    openedEntry,
    reloadOpenedFile,
    toggleEntryFullWidth,
    isEntryInFullWidth,
    fileChanged,
    setFileChanged,
  } = useOpenedEntryContext();

  const cLocation = findLocation(openedEntry.locationID);

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

  const toggleAutoSave = (event: React.ChangeEvent<HTMLInputElement>) => {
    const autoSave = event.target.checked;
    if (Pro) {
      setAutoSave(openedEntry, autoSave, openedEntry.locationID);
    } else {
      showNotification(t('core:thisFunctionalityIsAvailableInPro'));
    }
  };

  const autoSave = isEditable(openedEntry) && revisionsEnabled && (
    <Tooltip
      title={
        t('core:autosave') +
        (!Pro ? ' - ' + t('core:thisFunctionalityIsAvailableInPro') : '')
      }
    >
      <Switch
        data-tid="autoSaveTID"
        checked={openedEntry.meta && openedEntry.meta.autoSave}
        onChange={toggleAutoSave}
        // size={desktopMode ? 'small' : 'medium'}
        size="small"
        name="autoSave"
      />
    </Tooltip>
  );

  let closeCancelIcon;
  if (desktopMode) {
    closeCancelIcon = fileChanged ? <CancelIcon /> : <CloseEditIcon />;
  }

  const editingSupported: boolean =
    cLocation &&
    !cLocation.isReadOnly &&
    openedEntry &&
    openedEntry.editingExtensionId !== undefined &&
    openedEntry.editingExtensionId.length > 3;

  const startSavingFile = () => {
    if (isEditMode) {
      savingFile();
    } else {
      saveDescription();
    }
  };

  let editFile = null;
  if (editingSupported) {
    if (isEditMode) {
      editFile = (
        <ButtonGroup>
          <TsButton
            tooltip={t('core:cancelEditing')}
            data-tid="cancelEditingTID"
            onClick={() => {
              setEditMode(false);
              setFileChanged(false);
            }}
            style={{
              borderRadius: 'unset',
              borderTopLeftRadius: AppConfig.defaultCSSRadius,
              borderBottomLeftRadius: AppConfig.defaultCSSRadius,
              borderTopRightRadius: fileChanged
                ? 0
                : AppConfig.defaultCSSRadius,
              borderBottomRightRadius: fileChanged
                ? 0
                : AppConfig.defaultCSSRadius,
            }}
            aria-label={t('core:cancelEditing')}
            startIcon={closeCancelIcon}
          >
            <Box
              style={{
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                maxWidth: 100,
              }}
            >
              {fileChanged ? t('core:cancel') : t('core:exitEditMode')}
            </Box>
          </TsButton>

          {fileChanged && (
            <Tooltip
              title={
                t('core:saveFile') +
                ' (' +
                (AppConfig.isMacLike ? '⌘' : 'CTRL') +
                ' + S)'
              }
            >
              <TsButton
                disabled={false}
                onClick={startSavingFile}
                aria-label={t('core:saveFile')}
                data-tid="fileContainerSaveFile"
                startIcon={desktopMode && <SaveIcon />}
                loading={isSavingInProgress}
                style={{
                  borderRadius: 'unset',
                  borderTopRightRadius: AppConfig.defaultCSSRadius,
                  borderBottomRightRadius: AppConfig.defaultCSSRadius,
                }}
              >
                {t('core:save')}
              </TsButton>
            </Tooltip>
          )}
        </ButtonGroup>
      );
    } else {
      editFile = <EditFileButton />;
    }
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
      <Box
        style={{
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
              style={{
                paddingLeft: 0,
                paddingRight: 0,
                fontSize: 12,
                fontWeight: 'normal',
                textTransform: 'none',
                paddingTop: '0px',
                paddingBottom: '0px',
                minHeight: '60px', // 68px
                marginLeft: -8,
                marginRight: -8,
              }}
              // sx={{ maxWidth: 70 }}
              id={`tab-${index}`}
              ariaControls={`simple-tabpanel-${index}`}
              onClick={() => handleTabClick(selectedTabIndex, index)}
            />
          ))}
        </StyledTabs>
        <Box
          style={{
            marginLeft: 'auto',
            display: 'flex',
            flexDirection: 'column',
            marginRight: 10,
            alignItems: 'anchor-center',
          }}
        >
          {editFile}
          {autoSave}
        </Box>
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
