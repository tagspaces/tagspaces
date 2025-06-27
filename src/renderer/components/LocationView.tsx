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
  SubFolder,
} from '-/components/DirectoryTreeView';
import TargetFileBox from '-/components/TargetFileBox';
import Tooltip from '-/components/Tooltip';
import TsIconButton from '-/components/TsIconButton';
import { useFileUploadDialogContext } from '-/components/dialogs/hooks/useFileUploadDialogContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { usePerspectiveActionsContext } from '-/hooks/usePerspectiveActionsContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { TS } from '-/tagspaces.namespace';
import { Box, ListItemText } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import React, { useRef } from 'react';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { actions as AppActions, AppDispatch } from '../reducers/app';
import DragItemTypes from './DragItemTypes';
import TargetMoveFileBox from './TargetMoveFileBox';
import { useMenuContext } from '-/components/dialogs/hooks/useMenuContext';
import { CommonLocation } from '-/utils/CommonLocation';

interface Props {
  location: SubFolder;
  hideDrawer?: () => void;
  setDeleteLocationDialogOpened: (open: boolean) => void;
}

function LocationView(props: Props) {
  const { t } = useTranslation();

  const { uploadFiles } = useIOActionsContext();
  const { openFileUploadDialog } = useFileUploadDialogContext();
  const {
    findLocation,
    openLocation,
    currentLocation,
    setSelectedLocation,
    setLocationDirectoryContextMenuAnchorEl,
  } = useCurrentLocationContext();
  const { openMoveCopyFilesDialog } = useMenuContext();
  const { setActions } = usePerspectiveActionsContext();
  const { setSelectedEntries, selectedEntries } = useSelectedEntriesContext();
  const { currentLocationPath, openDirectory } = useDirectoryContentContext();
  const { showNotification } = useNotificationContext();
  const directoryTreeRef = useRef<DirectoryTreeViewRef>(null);
  const theme = useTheme();

  const dispatch: AppDispatch = useDispatch();
  const { location, hideDrawer } = props;
  const subFolderLocation = findLocation(location.locationID);
  const isCloudLocation = subFolderLocation?.type === locationType.TYPE_CLOUD;

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
    if (currentLocation && location.locationID === currentLocation.uuid) {
      // the same location click
      openDirectory(currentLocationPath).then(() => {
        const action: TS.PerspectiveActions = { action: 'reload' };
        setActions(action);
      });
    } else {
      openLocation(subFolderLocation);
      if (hideDrawer) {
        hideDrawer();
      }
    }
  };

  const handleLocationContextMenuClick = (
    event: any,
    chosenLocation: CommonLocation,
  ) => {
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

      if (currentLocation?.isReadOnly) {
        showNotification(t('core:dndDisabledReadOnlyMode'), 'error', true);
        return;
      }
      const itemLocation = item.targetLocation;
      const targetLocation = findLocation(itemLocation?.locationID);
      let targetPath = itemLocation ? itemLocation.path : undefined;
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
          const entries =
            selectedEntries.length > 0 ? selectedEntries : [entry];
          openMoveCopyFilesDialog(entries, targetPath, targetLocation.uuid);
          //openMoveOrCopyFilesDialog(entries, targetPath, targetLocation.uuid);
          //moveFiles(arrPath, targetPath, targetLocation.uuid);
        } else {
          showNotification(t('Moving file not possible'), 'error', true);
          return;
        }
        setSelectedEntries([]);
      }
    }
  };

  let locationNameTitle = location?.path;
  if (isCloudLocation && subFolderLocation?.bucketName) {
    if (subFolderLocation.endpointURL) {
      locationNameTitle =
        subFolderLocation.endpointURL + ' - ' + subFolderLocation.bucketName;
    } else if (subFolderLocation.region) {
      locationNameTitle =
        subFolderLocation.region + ' - ' + subFolderLocation.bucketName;
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
        data-tid="locationTitleElement"
        noWrap
      >
        <Tooltip title={locationNameTitle}>{location.name}</Tooltip>
      </Typography>
    </div>
  );
  const { FILE } = NativeTypes;
  const isLocationSelected =
    currentLocation && currentLocation.uuid === location.uuid;
  return (
    <Box
      style={{
        paddingLeft: 5,
        paddingRight: 0,
        height: '100%',
      }}
    >
      <TargetFileBox
        accepts={[FILE]}
        directoryPath={location.path}
        locationId={location.uuid}
      >
        <CustomDragLayer />
        <ListItem
          data-tid={'location_' + location.name.replace(/ /g, '_')}
          style={{
            padding: 0,
            paddingRight: 15,
            borderRadius: AppConfig.defaultCSSRadius,
            backgroundColor: isLocationSelected
              ? theme.palette.primary.light
              : 'inherit',
          }}
          onClick={handleLocationClick}
          onContextMenu={(event) =>
            handleLocationContextMenuClick(event, subFolderLocation)
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
                    margin: theme.spacing(1),
                  }}
                />
              ) : (
                <LocalLocationIcon
                  style={{
                    cursor: 'pointer',
                    margin: theme.spacing(1),
                  }}
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
          {subFolderLocation?.isDefault && (
            <Tooltip title={t('core:thisIsStartupLocation')}>
              <DefaultLocationIcon data-tid="startupIndication" />
            </Tooltip>
          )}
          <TsIconButton
            aria-label={t('core:options')}
            aria-haspopup="true"
            edge="end"
            data-tid={'locationMoreButton_' + location.name}
            onClick={(event) =>
              handleLocationContextMenuClick(event, subFolderLocation)
            }
            onContextMenu={(event) =>
              handleLocationContextMenuClick(event, subFolderLocation)
            }
          >
            <MoreMenuIcon />
          </TsIconButton>
        </ListItem>
      </TargetFileBox>
      <DirectoryTreeView
        key={'tree_' + location.uuid}
        ref={directoryTreeRef}
        location={location}
        handleFileMoveDrop={handleFileMoveDrop}
      />
    </Box>
  );
}

export default LocationView;
