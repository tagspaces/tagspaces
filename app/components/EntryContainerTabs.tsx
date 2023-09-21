/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
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

import React from 'react';
import { styled } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import {
  actions as AppActions,
  AppDispatch,
  isReadOnlyMode,
  OpenedEntry
} from '-/reducers/app';
import Revisions from '-/components/Revisions';
import EntryProperties from '-/components/EntryProperties';
import { TS } from '-/tagspaces.namespace';
import {
  actions as SettingsActions,
  getEntryContainerTab,
  getMapTileServer,
  isDesktopMode
} from '-/reducers/settings';
import {
  FolderPropertiesIcon,
  DescriptionIcon,
  RevisionIcon
} from '-/components/CommonIcons';
import EditDescription from '-/components/EditDescription';
import { useTranslation } from 'react-i18next';

interface StyledTabsProps {
  children?: React.ReactNode;
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const StyledTabs = styled((props: StyledTabsProps) => (
  <Tabs
    {...props}
    variant="scrollable"
    scrollButtons="auto"
    allowScrollButtonsMobile
    selectionFollowsFocus
    TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
  />
))(({ theme }) => ({
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  '& .MuiTabs-indicatorSpan': {
    maxWidth: 40,
    width: '100%',
    backgroundColor: theme.palette.text.primary //theme.palette.background.default //'#635ee7',
  }
}));

interface StyledTabProps {
  label: string;
  icon: any;
  onClick: (event: React.SyntheticEvent) => void;
}

const StyledTab = styled((props: StyledTabProps) => (
  <Tab disableRipple iconPosition="start" {...props} />
))(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: theme.typography.pxToRem(15),
  marginRight: theme.spacing(1),
  minHeight: 45
  // color: 'rgba(255, 255, 255, 0.7)',
  /*'&.Mui-selected': {
    color: '#fff',
  },*/
  /*'&.Mui-focusVisible': {
    backgroundColor: 'rgba(100, 95, 228, 0.32)',
  },*/
}));

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
}

interface EntryContainerTabsProps {
  openedFile: OpenedEntry;
  openPanel: () => void;
  toggleProperties: () => void;
  isEditable: boolean;
  marginRight: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function EntryContainerTabs(props: EntryContainerTabsProps) {
  const {
    openedFile,
    openPanel,
    toggleProperties,
    marginRight,
    isEditable
  } = props;

  const { t } = useTranslation();

  const tabIndex = useSelector(getEntryContainerTab);
  const readOnlyMode = useSelector(isReadOnlyMode);
  const tileServer = useSelector(getMapTileServer);
  const desktopMode = useSelector(isDesktopMode);
  const dispatch: AppDispatch = useDispatch();

  function TsTabPanel(tprops: TabPanelProps) {
    const { children, value, index, ...other } = tprops;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
        style={{
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: 10
          // ...(openedFile.isFile && { maxHeight: 400 })
        }}
      >
        {value === index && children}
      </div>
    );
  }

  // Create functions that dispatch actions
  const handleRenameFile = (filePath: string, newFilePath: string) =>
    dispatch(AppActions.renameFile(filePath, newFilePath));

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    dispatch(SettingsActions.setEntryContainerTab(newValue));
    openPanel();
  };
  const handleTabClick = (event: React.SyntheticEvent) => {
    if (
      openedFile.isFile &&
      tabIndex === parseInt(event.currentTarget.id.split('-')[1], 10)
    ) {
      // when selected tab is clicked...
      dispatch(SettingsActions.setEntryContainerTab(undefined));
      toggleProperties();
    }
  };

  /*const toggleEditDescriptionField = () => {
    if (readOnlyMode) {
      editDescription.current = undefined;
      return;
    }
    if (!Pro) {
      dispatch(
        AppActions.showNotification(t('core:thisFunctionalityIsAvailableInPro'))
      );
      return;
    }
    if (!Pro.MetaOperations) {
      dispatch(
        AppActions.showNotification(t('Saving description not supported'))
      );
      return;
    }
    if (editDescription.current !== undefined) {
      dispatch(AppActions.switchLocationTypeByID(openedFile.locationId)).then(
        currentLocationId => {
          Pro.MetaOperations.saveFsEntryMeta(openedFile.path, {
            description: editDescription.current
          })
            .then(entryMeta => {
              editDescription.current = undefined;
              dispatch(AppActions.updateOpenedFile(openedFile.path, entryMeta));
              dispatch(AppActions.switchCurrentLocationType(currentLocationId));
              return true;
            })
            .catch(error => {
              console.warn('Error saving description ' + error);
              editDescription.current = undefined;
              dispatch(AppActions.switchCurrentLocationType(currentLocationId));
              dispatch(
                AppActions.showNotification(t('Error saving description'))
              );
            });
        }
      );
    } else if (openedFile.description) {
      editDescription.current = openedFile.description;
    } else {
      editDescription.current = '';
    }
  };*/

  // directories must be always opened
  const selectedTabIndex =
    !openedFile.isFile && tabIndex === undefined ? 0 : tabIndex;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ ...(marginRight && { marginRight }) }}>
        <StyledTabs
          value={selectedTabIndex}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <StyledTab
            data-tid="detailsTabTID"
            icon={<FolderPropertiesIcon />}
            label={desktopMode && t('core:details')}
            {...a11yProps(0)}
            onClick={handleTabClick}
          />
          <StyledTab
            data-tid="descriptionTabTID"
            icon={<DescriptionIcon />}
            label={desktopMode && t('core:filePropertiesDescription')}
            {...a11yProps(1)}
            onClick={handleTabClick}
          />
          {isEditable && (
            <StyledTab
              data-tid="revisionsTabTID"
              icon={<RevisionIcon />}
              label={desktopMode && t('core:revisions')}
              {...a11yProps(2)}
              onClick={handleTabClick}
            />
          )}
        </StyledTabs>
      </Box>
      <TsTabPanel value={selectedTabIndex} index={0}>
        <EntryProperties
          key={openedFile.path}
          renameFile={handleRenameFile}
          isReadOnlyMode={readOnlyMode}
          tileServer={tileServer}
        />
      </TsTabPanel>
      <TsTabPanel value={selectedTabIndex} index={1}>
        <EditDescription />
      </TsTabPanel>
      {isEditable && (
        <TsTabPanel value={selectedTabIndex} index={2}>
          <Revisions />
        </TsTabPanel>
      )}
    </div>
  );
}

export default EntryContainerTabs;
