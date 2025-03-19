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
import {
  CloudLocationIcon,
  DefaultLocationIcon,
  LocalLocationIcon,
  MoreMenuIcon,
} from '-/components/CommonIcons';
import CustomDragLayer from '-/components/CustomDragLayer';
import DirectoryTreeView, {
  DirectoryTreeViewRef,
} from '-/components/DirectoryTreeView';
import { SidePanel, classes } from '-/components/SidePanels.css';
import TargetFileBox from '-/components/TargetFileBox';
import Tooltip from '-/components/Tooltip';
import TsIconButton from '-/components/TsIconButton';
import { useEntryExistDialogContext } from '-/components/dialogs/hooks/useEntryExistDialogContext';
import { useFileUploadDialogContext } from '-/components/dialogs/hooks/useFileUploadDialogContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { usePerspectiveActionsContext } from '-/hooks/usePerspectiveActionsContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import { ListItemText } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import React, { useRef } from 'react';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { actions as AppActions, AppDispatch } from '../reducers/app';
import DragItemTypes from './DragItemTypes';
import TargetMoveFileBox from './TargetMoveFileBox';

interface Props {
  location: CommonLocation;
  hideDrawer?: () => void;
  setDeleteLocationDialogOpened: (open: boolean) => void;
}

function LocationView(props: Props) {
  const { t } = useTranslation();

  const { moveFiles, uploadFiles } = useIOActionsContext();
  const { openFileUploadDialog } = useFileUploadDialogContext();
  const {
    openLocation,
    findLocation,
    readOnlyMode,
    setSelectedLocation,
    setLocationDirectoryContextMenuAnchorEl,
  } = useCurrentLocationContext();
  const { handleEntryExist, openEntryExistDialog } =
    useEntryExistDialogContext();
  const { setActions } = usePerspectiveActionsContext();
  const { setSelectedEntries, selectedEntries } = useSelectedEntriesContext();
  const { currentLocationPath, openDirectory } = useDirectoryContentContext();
  const { showNotification } = useNotificationContext();
  const directoryTreeRef = useRef<DirectoryTreeViewRef>(null);

  const dispatch: AppDispatch = useDispatch();
  const currentLocation = findLocation();
  const { location, hideDrawer } = props;
  const isCloudLocation = location.type === locationType.TYPE_CLOUD;

  const handleLocationIconClick = (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (directoryTreeRef.current) {
      directoryTreeRef.current.changeLocation(location);
    }
  };

  const handleLocationClick = () => {
    if (currentLocation && location.uuid === currentLocation.uuid) {
      // the same location click
      openDirectory(currentLocationPath).then(() => {
        const action: TS.PerspectiveActions = { action: 'reload' };
        setActions(action);
      });
    } else {
      openLocation(location);
      if (hideDrawer) {
        hideDrawer();
      }
    }
  };

  const handleLocationContextMenuClick = (event: any, chosenLocation) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedLocation(chosenLocation);
    setLocationDirectoryContextMenuAnchorEl(event.currentTarget);
  };

  const onUploadProgress = (progress, response) => {
    dispatch(AppActions.onUploadProgress(progress, response));
  };

  /**
   * https://github.com/react-component/table/blob/master/examples/react-dnd.js
   * @param item
   * @param monitor
   */
  const handleFileMoveDrop = (item, monitor) => {
    if (item) {
      const { entry } = item;
      let arrPath = [];
      if (
        selectedEntries &&
        selectedEntries.length > 0 &&
        selectedEntries.some((e) => e.path === entry.path)
      ) {
        arrPath = selectedEntries.map((i) => i.path);
      } else if (entry) {
        arrPath.push(entry.path);
      }

      if (readOnlyMode) {
        showNotification(t('core:dndDisabledReadOnlyMode'), 'error', true);
        return;
      }
      const targetLocation = item.targetLocation;
      let targetPath = targetLocation ? targetLocation.path : undefined;
      if (targetPath === undefined) {
        targetPath = item.targetPath;
      }

      if (targetPath !== undefined && targetLocation !== undefined) {
        // TODO handle monitor -> isOver and change folder icon
        console.log('Dropped files: ' + JSON.stringify(arrPath));
        if (targetLocation.type !== currentLocation.type) {
          //locationType.TYPE_CLOUD) {
          dispatch(AppActions.resetProgress());
          openFileUploadDialog(targetPath);
          return uploadFiles(
            arrPath,
            targetPath,
            onUploadProgress,
            true,
            false,
            targetLocation.uuid,
          ).catch((error) => {
            console.log('uploadFiles', error);
          });
        } else if (targetLocation.type === locationType.TYPE_LOCAL) {
          handleEntryExist(
            selectedEntries,
            targetPath,
            targetLocation.uuid,
          ).then((exist) => {
            if (exist) {
              openEntryExistDialog(exist, () => {
                moveFiles(arrPath, targetPath, targetLocation.uuid);
              });
            } else {
              moveFiles(arrPath, targetPath, targetLocation.uuid);
            }
          });
        } else {
          showNotification(t('Moving file not possible'), 'error', true);
          return;
        }
        setSelectedEntries([]);
      }
    }
  };

  let locationNameTitle = location?.path;
  if (isCloudLocation && location.bucketName) {
    if (location.endpointURL) {
      locationNameTitle = location.endpointURL + ' - ' + location.bucketName;
    } else if (location.region) {
      locationNameTitle = location.region + ' - ' + location.bucketName;
    }
  }

  const LocationTitle = (
    <div
      style={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: 240,
      }}
    >
      <Typography
        variant="inherit"
        style={{
          paddingLeft: 5,
          paddingRight: 5,
        }}
        className={classes.header}
        data-tid="locationTitleElement"
        noWrap
      >
        <Tooltip title={locationNameTitle}>{location.name}</Tooltip>
      </Typography>
    </div>
  );
  const { FILE } = NativeTypes;
  return (
    <SidePanel>
      <TargetFileBox
        accepts={[FILE]}
        directoryPath={location.path}
        locationId={location.uuid}
      >
        <CustomDragLayer />
        <ListItem
          data-tid={'location_' + location.name.replace(/ /g, '_')}
          className={
            currentLocation && currentLocation.uuid === location.uuid
              ? classes.listItemSelected
              : classes.listItem
          }
          onClick={handleLocationClick}
          onContextMenu={(event) =>
            handleLocationContextMenuClick(event, location)
          }
        >
          <ListItemIcon
            style={{
              minWidth: 'auto',
              cursor: 'pointer',
            }}
            onClick={handleLocationIconClick}
          >
            <Tooltip title={t('clickToExpand')}>
              {isCloudLocation ? (
                <CloudLocationIcon
                  style={{
                    cursor: 'pointer',
                  }}
                  className={classes.icon}
                />
              ) : (
                <LocalLocationIcon
                  style={{
                    cursor: 'pointer',
                  }}
                  className={classes.icon}
                />
              )}
            </Tooltip>
          </ListItemIcon>
          <ListItemText>
            {isCloudLocation && !AppConfig.isElectron ? (
              <>{LocationTitle}</>
            ) : (
              <TargetMoveFileBox
                accepts={[DragItemTypes.FILE]}
                onDrop={handleFileMoveDrop}
                targetPath={currentLocationPath}
                targetLocation={location}
              >
                {LocationTitle}
              </TargetMoveFileBox>
            )}
          </ListItemText>
          {location.isDefault && (
            <Tooltip title={t('core:thisIsStartupLocation')}>
              <DefaultLocationIcon data-tid="startupIndication" />
            </Tooltip>
          )}
          <TsIconButton
            aria-label={t('core:options')}
            aria-haspopup="true"
            edge="end"
            data-tid={'locationMoreButton_' + location.name}
            onClick={(event) => handleLocationContextMenuClick(event, location)}
            onContextMenu={(event) =>
              handleLocationContextMenuClick(event, location)
            }
          >
            <MoreMenuIcon />
          </TsIconButton>
        </ListItem>
      </TargetFileBox>
      <DirectoryTreeView
        key={'tree_' + location.uuid}
        ref={directoryTreeRef}
        classes={classes}
        location={location}
        handleFileMoveDrop={handleFileMoveDrop}
      />
    </SidePanel>
  );
}

export default LocationView;
