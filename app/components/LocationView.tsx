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

import React, { useRef, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import LocationIcon from '@material-ui/icons/WorkOutline';
import CloudLocationIcon from '@material-ui/icons/CloudQueue';
import DefaultLocationIcon from '@material-ui/icons/Highlight';
import { Progress } from 'aws-sdk/clients/s3';
import { locationType } from '@tagspaces/tagspaces-platforms/misc';
import AppConfig from '@tagspaces/tagspaces-platforms/AppConfig';
import styles from './SidePanels.css';
import {
  actions as AppActions,
  getCurrentLocationId,
  isReadOnlyMode
} from '../reducers/app';
import i18n from '../services/i18n';
import PlatformIO from '../services/platform-facade';
import TargetMoveFileBox from './TargetMoveFileBox';
import DragItemTypes from './DragItemTypes';
import IOActions from '../reducers/io-actions';
import DirectoryTreeView, {
  DirectoryTreeViewRef
} from '-/components/DirectoryTreeView';
import {
  getCurrentLanguage,
  getShowUnixHiddenEntries
} from '-/reducers/settings';
import LocationContextMenu from '-/components/menus/LocationContextMenu';
import { TS } from '-/tagspaces.namespace';

interface Props {
  classes: any;
  location: TS.Location;
  currentLocationId: string;
  openLocation: (location: TS.Location) => void;
  loadDirectoryContent: (
    path: string,
    generateThumbnails: boolean,
    loadDirMeta?: boolean
  ) => void;
  setSelectedEntries: (selectedEntries: Array<Object>) => void;
  hideDrawer: () => void;
  isReadOnlyMode: boolean;
  showNotification: (
    text: string,
    notificationType: string,
    autohide: boolean
  ) => void;
  resetProgress: () => void;
  uploadFiles: (
    files: Array<string>,
    destination: string,
    onUploadProgress?: (progress: Progress, response: any) => void
  ) => Promise<Array<TS.FileSystemEntry>>;
  onUploadProgress: (progress: Progress, response: any) => void;
  reflectCreateEntries: (fsEntries: Array<TS.FileSystemEntry>) => void;
  toggleUploadDialog: () => void;
  moveFiles: (files: Array<string>, destination: string) => void;
  showUnixHiddenEntries: boolean;
  setEditLocationDialogOpened: (open: boolean) => void;
  setDeleteLocationDialogOpened: (open: boolean) => void;
  selectedLocation: TS.Location;
  setSelectedLocation: (loc: TS.Location) => void;
  changeLocation: (loc: TS.Location) => void;
}

function LocationView(props: Props) {
  const directoryTreeRef = useRef<DirectoryTreeViewRef>(null);
  const [
    locationDirectoryContextMenuAnchorEl,
    setLocationDirectoryContextMenuAnchorEl
  ] = useState<null | HTMLElement>(null);

  const { location } = props;
  const isCloudLocation = location.type === locationType.TYPE_CLOUD;

  const handleLocationIconClick = event => {
    event.preventDefault();
    event.stopPropagation();
    if (directoryTreeRef.current) {
      directoryTreeRef.current.changeLocation(location);
    }
  };

  const handleLocationClick = () => {
    if (location.uuid === props.currentLocationId) {
      // the same location click
      props.loadDirectoryContent(PlatformIO.getLocationPath(location), true); // false);
    } else {
      // this.directoryTreeRef[location.uuid].loadSubDir(location, 1);
      props.setSelectedEntries([]);
      props.openLocation(location);
      if (props.hideDrawer) {
        props.hideDrawer();
      }
    }
  };

  const closeLocationTree = () => {
    directoryTreeRef.current.closeLocation();
  };

  const handleLocationContextMenuClick = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    setLocationDirectoryContextMenuAnchorEl(event.currentTarget);
    props.setSelectedLocation(location);
  };

  /**
   * https://github.com/react-component/table/blob/master/examples/react-dnd.js
   * @param item
   * @param monitor
   */
  const handleFileMoveDrop = (item, monitor) => {
    if (monitor) {
      const { path, selectedEntries } = monitor.getItem();
      const arrPath = [];
      if (selectedEntries && selectedEntries.length > 0) {
        selectedEntries.map(entry => {
          arrPath.push(entry.path);
          return true;
        });
      } else {
        arrPath.push(path);
      }
      if (props.isReadOnlyMode) {
        props.showNotification(
          i18n.t('core:dndDisabledReadOnlyMode'),
          'error',
          true
        );
        return;
      }
      if (!AppConfig.isWin && !path.startsWith('/')) {
        props.showNotification(
          i18n.t('Moving file not possible'),
          'error',
          true
        );
        return;
      }
      if (AppConfig.isWin && !path.substr(1).startsWith(':')) {
        props.showNotification(
          i18n.t('Moving file not possible'),
          'error',
          true
        );
        return;
      }
      let targetPath = item.path;
      const targetLocation = item.location;
      if (targetPath === undefined) {
        targetPath = targetLocation.path;
      }
      /* if (item.children && item.children.props && item.children.props.path) {
        targetPath = item.children.props.path;
      } else {
        targetPath = item.children[1].props.record.path;
      } */
      if (monitor && targetPath !== undefined && targetLocation !== undefined) {
        // TODO handle monitor -> isOver and change folder icon
        console.log('Dropped files: ' + path);
        if (targetLocation.type === locationType.TYPE_CLOUD) {
          // TODO Webdav
          PlatformIO.enableObjectStoreSupport(targetLocation)
            .then(() => {
              props.resetProgress();
              props.toggleUploadDialog();
              props
                .uploadFiles(arrPath, targetPath, props.onUploadProgress)
                .then((fsEntries: Array<TS.FileSystemEntry>) => {
                  props.reflectCreateEntries(fsEntries);
                  return true;
                })
                .catch(error => {
                  console.log('uploadFiles', error);
                });
              return true;
            })
            .catch(error => {
              console.log('enableObjectStoreSupport', error);
            });
        } else if (targetLocation.type === locationType.TYPE_LOCAL) {
          PlatformIO.disableObjectStoreSupport();
          props.moveFiles(arrPath, targetPath);
        }
        props.setSelectedEntries([]);
      }
    }
  };

  let locationNameTitle = PlatformIO.getLocationPath(location);
  if (isCloudLocation && location.bucketName) {
    if (location.endpointURL) {
      locationNameTitle = location.endpointURL + ' - ' + location.bucketName;
    } else if (location.region) {
      locationNameTitle = location.region + ' - ' + location.bucketName;
    }
  }

  const LocationTitle = (
    <Tooltip title={locationNameTitle}>
      <div
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 240
        }}
      >
        <Typography
          variant="inherit"
          style={{
            paddingLeft: 5,
            paddingRight: 5
          }}
          className={props.classes.header}
          data-tid="locationTitleElement"
          noWrap
        >
          {location.name}
        </Typography>
      </div>
    </Tooltip>
  );

  return (
    /* <div key={location.uuid}> */
    <>
      {locationDirectoryContextMenuAnchorEl && (
        <LocationContextMenu
          setEditLocationDialogOpened={props.setEditLocationDialogOpened}
          setDeleteLocationDialogOpened={props.setDeleteLocationDialogOpened}
          selectedLocation={props.selectedLocation}
          locationDirectoryContextMenuAnchorEl={
            locationDirectoryContextMenuAnchorEl
          }
          setLocationDirectoryContextMenuAnchorEl={
            setLocationDirectoryContextMenuAnchorEl
          }
          closeLocationTree={closeLocationTree}
        />
      )}
      <ListItem
        data-tid={'location_' + location.name.replace(/ /g, '_')}
        className={
          props.currentLocationId === location.uuid
            ? props.classes.listItemSelected
            : props.classes.listItem
        }
        button
        onClick={handleLocationClick}
        onContextMenu={event => handleLocationContextMenuClick(event)}
      >
        <ListItemIcon
          // onClick={(e) => {
          //   e.preventDefault();
          //   this.loadSubDirectories(location, 1);
          // }}
          style={{
            minWidth: 'auto',
            cursor: 'pointer'
          }}
          onClick={handleLocationIconClick}
        >
          <Tooltip title={i18n.t('clickToExpand')} arrow placement="top">
            {isCloudLocation ? (
              <CloudLocationIcon
                style={{
                  cursor: 'pointer'
                }}
                className={props.classes.icon}
              />
            ) : (
              <LocationIcon
                style={{
                  cursor: 'pointer'
                }}
                className={props.classes.icon}
              />
            )}
          </Tooltip>
        </ListItemIcon>
        {isCloudLocation && !AppConfig.isElectron ? (
          <>{LocationTitle}</>
        ) : (
          <TargetMoveFileBox
            accepts={[DragItemTypes.FILE]}
            onDrop={handleFileMoveDrop}
            path={PlatformIO.getLocationPath(location)}
            location={location}
          >
            {LocationTitle}
          </TargetMoveFileBox>
        )}
        <ListItemSecondaryAction>
          <IconButton
            aria-label={i18n.t('core:options')}
            aria-haspopup="true"
            edge="end"
            data-tid={'locationMoreButton_' + location.name}
            onClick={event => handleLocationContextMenuClick(event)}
            onContextMenu={event => handleLocationContextMenuClick(event)}
          >
            {location.isDefault && (
              <Tooltip title={i18n.t('core:thisIsStartupLocation')}>
                <DefaultLocationIcon data-tid="startupIndication" />
              </Tooltip>
            )}
            <MoreVertIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
      <DirectoryTreeView
        key={'tree_' + location.uuid}
        ref={directoryTreeRef}
        classes={props.classes}
        loadDirectoryContent={props.loadDirectoryContent}
        location={location}
        showUnixHiddenEntries={props.showUnixHiddenEntries}
        handleFileMoveDrop={handleFileMoveDrop}
        changeLocation={props.changeLocation}
      />
    </>
  );
}

function mapStateToProps(state) {
  return {
    currentLocationId: getCurrentLocationId(state),
    isReadOnlyMode: isReadOnlyMode(state),
    showUnixHiddenEntries: getShowUnixHiddenEntries(state),
    language: getCurrentLanguage(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      showNotification: AppActions.showNotification,
      toggleUploadDialog: AppActions.toggleUploadDialog,
      reflectCreateEntries: AppActions.reflectCreateEntries,
      resetProgress: AppActions.resetProgress,
      uploadFiles: IOActions.uploadFiles,
      moveFiles: IOActions.moveFiles,
      onUploadProgress: AppActions.onUploadProgress,
      setSelectedEntries: AppActions.setSelectedEntries,
      openLocation: AppActions.openLocation,
      loadDirectoryContent: AppActions.loadDirectoryContent,
      changeLocation: AppActions.changeLocation
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
  // @ts-ignore
)(withStyles(styles)(React.memo(LocationView)));
