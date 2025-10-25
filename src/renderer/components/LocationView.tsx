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
import { useMenuContext } from '-/components/dialogs/hooks/useMenuContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';
import { useFileUploadContext } from '-/hooks/useFileUploadContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { usePerspectiveActionsContext } from '-/hooks/usePerspectiveActionsContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import { Box, ListItemText } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import React, { useCallback, useMemo, useRef } from 'react';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { actions as AppActions, AppDispatch } from '../reducers/app';
import DragItemTypes from './DragItemTypes';
import TargetMoveFileBox from './TargetMoveFileBox';

interface Props {
  location: SubFolder;
  workspace?: TS.WorkSpace;
  hideDrawer?: () => void;
}

function LocationView(props: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  const dispatch: AppDispatch = useDispatch();

  const { uploadFilesAPI, uploadMeta } = useIOActionsContext();
  const { setMetaUpload } = useFileUploadContext();
  const { openFileUploadDialog } = useFileUploadDialogContext();
  const { setReflectMetaActions } = useEditedEntryMetaContext();
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

  const { location, hideDrawer, workspace } = props;
  const subFolderLocation = findLocation(location.locationID);
  const isCloudLocation = subFolderLocation?.type === locationType.TYPE_CLOUD;

  const handleLocationIconClick = useCallback(
    (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
      event.preventDefault();
      event.stopPropagation();
      if (directoryTreeRef.current) {
        directoryTreeRef.current.changeLocation(location);
      }
    },
    [location],
  );

  const handleLocationClick = useCallback(() => {
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
  }, [
    currentLocation,
    location,
    openDirectory,
    currentLocationPath,
    setActions,
    openLocation,
    subFolderLocation,
    hideDrawer,
  ]);

  const handleLocationContextMenuClick = useCallback(
    (event: any, chosenLocation: CommonLocation) => {
      event.preventDefault();
      event.stopPropagation();
      setSelectedLocation(chosenLocation);
      setLocationDirectoryContextMenuAnchorEl(event.currentTarget);
    },
    [setSelectedLocation, setLocationDirectoryContextMenuAnchorEl],
  );

  const onUploadProgress = useCallback(
    (progress, response) => {
      dispatch(AppActions.onUploadProgress(progress, response));
    },
    [dispatch],
  );

  /**
   * https://github.com/react-component/table/blob/master/examples/react-dnd.js
   * @param item
   * @param monitor
   */
  const handleFileMoveDrop = useCallback(
    (item, monitor) => {
      if (item) {
        const { entry } = item;
        let arrFiles: TS.FileSystemEntry[] = [];
        if (
          selectedEntries &&
          selectedEntries.length > 0 &&
          selectedEntries.some((e) => e.path === entry.path)
        ) {
          arrFiles = selectedEntries;
        } else if (entry) {
          arrFiles.push(entry);
        }

        if (currentLocation?.isReadOnly) {
          showNotification(t('core:dndDisabledReadOnlyMode'), 'error', true);
          return;
        }
        const itemLocation = item.targetLocation;
        const targetLocation = findLocation(itemLocation?.locationID);
        let targetPath = itemLocation ? itemLocation.path || '' : undefined;
        if (targetPath === undefined) {
          targetPath = item.targetPath;
        }

        if (targetPath !== undefined && targetLocation !== undefined) {
          // TODO handle monitor -> isOver and change folder icon
          console.log('Dropped files in: ' + targetPath);
          if (targetLocation.type !== currentLocation.type) {
            dispatch(AppActions.resetProgress());
            openFileUploadDialog(targetPath, undefined);
            return uploadFilesAPI(
              arrFiles,
              targetPath,
              onUploadProgress,
              false,
              false,
              targetLocation.uuid,
              currentLocation.uuid,
            )
              .then((fsEntries: Array<TS.FileSystemEntry>) => {
                setMetaUpload(() =>
                  uploadMeta(
                    arrFiles.map((f) => f.path),
                    targetPath,
                    onUploadProgress,
                    false,
                    targetLocation.uuid,
                    currentLocation.uuid,
                  ),
                );
                const actions: TS.EditMetaAction[] = fsEntries.map((entry) => ({
                  action: 'thumbGenerate',
                  entry: entry,
                }));
                setReflectMetaActions(...actions);
                return true;
              })
              .catch((error) => {
                console.log('uploadFiles', error);
                setMetaUpload(undefined);
              });
          } else if (targetLocation.type === locationType.TYPE_LOCAL) {
            const entries =
              selectedEntries.length > 0 ? selectedEntries : [entry];
            openMoveCopyFilesDialog(entries, targetPath, targetLocation.uuid);
          } else {
            showNotification(t('Moving file not possible'), 'error', true);
            return;
          }
          setSelectedEntries([]);
        }
      }
    },
    [
      selectedEntries,
      currentLocation,
      showNotification,
      t,
      findLocation,
      openFileUploadDialog,
      uploadFilesAPI,
      onUploadProgress,
      setMetaUpload,
      uploadMeta,
      setReflectMetaActions,
      openMoveCopyFilesDialog,
      setSelectedEntries,
      dispatch,
    ],
  );

  // Compute location name for tooltip/title
  const locationNameTitle = useMemo(() => {
    if (isCloudLocation && subFolderLocation?.bucketName) {
      if (subFolderLocation.endpointURL) {
        return (
          subFolderLocation.endpointURL + ' - ' + subFolderLocation.bucketName
        );
      } else if (subFolderLocation.region) {
        return subFolderLocation.region + ' - ' + subFolderLocation.bucketName;
      }
    }
    return location?.path;
  }, [isCloudLocation, subFolderLocation, location]);

  const LocationTitle = (
    <Box
      sx={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: 240,
      }}
    >
      <Typography
        variant="inherit"
        sx={{
          paddingLeft: '5px',
          paddingRight: '5px',
        }}
        data-tid="locationTitleElement"
        noWrap
      >
        <Tooltip title={locationNameTitle}>
          <>{location.name}</>
        </Tooltip>
        {workspace && (
          <Tooltip title={t('core:workspace') + ': ' + workspace.fullName}>
            <>{' - ' + workspace.shortName}</>
          </Tooltip>
        )}
      </Typography>
    </Box>
  );

  const { FILE } = NativeTypes;
  const isLocationSelected =
    currentLocation && currentLocation.uuid === location.locationID;

  return (
    <Box
      sx={{
        paddingLeft: '5px',
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
          disablePadding
          sx={{
            borderRadius: AppConfig.defaultCSSRadius,
            backgroundColor: isLocationSelected ? 'primary.light' : 'inherit',
          }}
        >
          <ListItemButton
            data-tid={'location_' + location.name.replace(/ /g, '_')}
            onClick={handleLocationClick}
            onContextMenu={(event) =>
              handleLocationContextMenuClick(event, subFolderLocation)
            }
            sx={{
              padding: 0,
              paddingRight: '15px',
              borderRadius: AppConfig.defaultCSSRadius,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 'auto',
                cursor: 'pointer',
              }}
              onClick={handleLocationIconClick}
            >
              <Tooltip title={t('clickToExpand')}>
                {isCloudLocation ? (
                  <CloudLocationIcon
                    sx={{
                      cursor: 'pointer',
                      margin: 1,
                    }}
                  />
                ) : (
                  <LocalLocationIcon
                    sx={{
                      cursor: 'pointer',
                      margin: 1,
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
          </ListItemButton>
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
