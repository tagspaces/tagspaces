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

import React, { useRef } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import {
  actions as AppActions,
  AppDispatch,
  getDirectoryPath,
  isReadOnlyMode,
  OpenedEntry
} from '-/reducers/app';
import i18n from '-/services/i18n';
import { Pro } from '-/pro';
import Revisions from '-/components/Revisions';
import EntryProperties from '-/components/EntryProperties';
import TaggingActions from '-/reducers/tagging-actions';
import { TS } from '-/tagspaces.namespace';
import {
  actions as SettingsActions,
  getEntryContainerTab,
  getMapTileServer
} from '-/reducers/settings';
import EditDescription from '-/components/EditDescription';

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
  onClick: (event: React.SyntheticEvent) => void;
}

const StyledTab = styled((props: StyledTabProps) => (
  <Tab disableRipple {...props} />
))(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: theme.typography.pxToRem(15),
  marginRight: theme.spacing(1)
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

interface Props {
  openedFile: OpenedEntry;
  openPanel: () => void;
  toggleProperties: () => void;
  marginRight: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function EntryContainerTabs(props: Props) {
  const tabIndex = useSelector(getEntryContainerTab);
  // const [value, setValue] = React.useState(0);
  const { openedFile, openPanel, toggleProperties, marginRight } = props;
  const editDescription = useRef<string>(undefined);
  //const theme = useTheme();
  const readOnlyMode = useSelector(isReadOnlyMode);
  const directoryPath = useSelector(getDirectoryPath);
  const tileServer = useSelector(getMapTileServer);
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
          padding: 10,
          ...(openedFile.isFile && { maxHeight: 400 })
        }}
      >
        {value === index && children}
      </div>
    );
  }

  // Create functions that dispatch actions
  const handleRenameFile = (filePath: string, newFilePath: string) =>
    dispatch(AppActions.renameFile(filePath, newFilePath));

  const handleRenameDirectory = (
    directoryPath: string,
    newDirectoryName: string
  ) => dispatch(AppActions.renameDirectory(directoryPath, newDirectoryName));

  const handleAddTags = (
    paths: Array<string>,
    tags: Array<TS.Tag>,
    updateIndex = true
  ) => dispatch(TaggingActions.addTags(paths, tags, updateIndex));

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

  const toggleEditDescriptionField = () => {
    if (readOnlyMode) {
      editDescription.current = undefined;
      return;
    }
    if (!Pro) {
      dispatch(
        AppActions.showNotification(
          i18n.t('core:thisFunctionalityIsAvailableInPro')
        )
      );
      return;
    }
    if (!Pro.MetaOperations) {
      dispatch(
        AppActions.showNotification(i18n.t('Saving description not supported'))
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
                AppActions.showNotification(i18n.t('Error saving description'))
              );
            });
        }
      );
    } else if (openedFile.description) {
      editDescription.current = openedFile.description;
    } else {
      editDescription.current = '';
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Box sx={{ ...(marginRight && { marginRight }) }}>
        <StyledTabs
          value={tabIndex}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <StyledTab
            data-tid="detailsTabTID"
            label={i18n.t('core:details')}
            {...a11yProps(0)}
            onClick={handleTabClick}
          />
          <StyledTab
            data-tid="descriptionTabTID"
            label={i18n.t('core:filePropertiesDescription')}
            {...a11yProps(1)}
            onClick={handleTabClick}
          />
          {openedFile.isFile && (
            <StyledTab
              data-tid="revisionsTabTID"
              label={i18n.t('core:revisions')}
              {...a11yProps(2)}
              onClick={handleTabClick}
            />
          )}
        </StyledTabs>
      </Box>
      <TsTabPanel value={tabIndex} index={0}>
        <EntryProperties
          key={openedFile.path}
          openedEntry={openedFile}
          renameFile={handleRenameFile}
          renameDirectory={handleRenameDirectory}
          addTags={handleAddTags}
          isReadOnlyMode={readOnlyMode}
          currentDirectoryPath={directoryPath}
          tileServer={tileServer}
        />
      </TsTabPanel>
      <TsTabPanel value={tabIndex} index={1}>
        <EditDescription
          toggleEditDescriptionField={
            !readOnlyMode && !openedFile.editMode && toggleEditDescriptionField
          }
          description={openedFile.description}
          setEditDescription={md => (editDescription.current = md)}
          currentFolder={directoryPath}
        />
      </TsTabPanel>
      {openedFile.isFile && (
        <TsTabPanel value={tabIndex} index={2}>
          <Revisions />
        </TsTabPanel>
      )}
    </Box>
  );
}

export default EntryContainerTabs;
