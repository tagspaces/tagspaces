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
import { useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
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
import { getMapTileServer } from '-/reducers/settings';
import EditDescription from '-/components/EditDescription';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TsTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{
        height: '100%',
        overflowY: 'auto'
      }}
    >
      {value === index && (
        <Box sx={{ p: 3, height: '100%' }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

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
}

function EntryContainerTabs(props: Props) {
  const [value, setValue] = React.useState(0);
  const { openedFile, toggleProperties, openPanel } = props;
  const editDescription = useRef<string>(undefined);
  //const theme = useTheme();
  const readOnlyMode = useSelector(isReadOnlyMode);
  const directoryPath = useSelector(getDirectoryPath);
  const tileServer = useSelector(getMapTileServer);
  const dispatch: AppDispatch = useDispatch();

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
    setValue(newValue);
    openPanel();
  };
  const handleTabClick = (event: React.SyntheticEvent) => {
    if (value === parseInt(event.currentTarget.id.split('-')[1], 10)) {
      // when selected tab is clicked...
      toggleProperties();
    }
  };

  /*const entryProperties = (
    <div
      style={{
        display: 'inline',
        flex: '1 1 100%',
        backgroundColor: theme.palette.background.default,
        padding: '0',
        height: '100%'
      }}
    >
      {openedFile.isFile ? renderFileToolbar() : renderFolderToolbar()}
      {isRevisionPanelVisible &&
      openedFile.isFile &&
      Pro &&
      isEditable &&
      props.revisionsEnabled ? (
        <Revisions />
      ) : (

      )}
    </div>
  );*/
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
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{ borderBottom: 1, borderColor: 'divider', marginRight: '160px' }}
      >
        <Tabs
          value={value}
          variant="scrollable"
          scrollButtons="auto"
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab
            label={i18n.t('core:details')}
            {...a11yProps(0)}
            onClick={handleTabClick}
          />
          <Tab
            label={i18n.t('core:filePropertiesDescription')}
            {...a11yProps(1)}
            onClick={handleTabClick}
          />
          <Tab
            label={i18n.t('core:revisions')}
            {...a11yProps(2)}
            onClick={handleTabClick}
          />
        </Tabs>
      </Box>
      <TsTabPanel value={value} index={0}>
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
      <TsTabPanel value={value} index={1}>
        <EditDescription
          toggleEditDescriptionField={
            !readOnlyMode && !openedFile.editMode && toggleEditDescriptionField
          }
          description={openedFile.description}
          setEditDescription={md => (editDescription.current = md)}
          currentFolder={directoryPath}
        />
      </TsTabPanel>
      <TsTabPanel value={value} index={2}>
        <Revisions />
      </TsTabPanel>
    </Box>
  );
}

export default EntryContainerTabs;
