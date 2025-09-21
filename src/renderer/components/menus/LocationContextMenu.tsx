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
  ArrowDownIcon,
  ArrowUpIcon,
  CloseIcon,
  DeleteIcon,
  EditIcon,
  OpenNewWindowIcon,
  ReloadIcon,
} from '-/components/CommonIcons';
import TsMenuList from '-/components/TsMenuList';
import { useCreateEditLocationDialogContext } from '-/components/dialogs/hooks/useCreateEditLocationDialogContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { createNewInstance, openDirectoryMessage } from '-/services/utils-io';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenFolderNativelyIcon from '@mui/icons-material/Launch';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import { generateSharingLink } from '@tagspaces/tagspaces-common/paths';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { useTranslation } from 'react-i18next';

interface Props {}

function LocationContextMenu(props: Props) {
  const { t } = useTranslation();

  const {
    addLocation,
    closeLocation,
    moveLocationUp,
    moveLocationDown,
    getLocationPosition,
    selectedLocation,
    locationDirectoryContextMenuAnchorEl,
    setLocationDirectoryContextMenuAnchorEl,
    getLocationPath,
    deleteLocation,
  } = useCurrentLocationContext();
  const { openConfirmDialog } = useNotificationContext();
  const { createLocationIndex } = useLocationIndexContext();
  const { openCreateEditLocationDialog } = useCreateEditLocationDialogContext();
  //const dispatch: AppDispatch = useDispatch();

  /*const moveLocationUp = (locationId) => {
    dispatch(LocationActions.moveLocationUp(locationId));
  };

  const moveLocationDown = (locationId) => {
    dispatch(LocationActions.moveLocationDown(locationId));
  };*/

  const indexLocation = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    createLocationIndex(selectedLocation, true);
  };

  const showEditLocationDialog = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    openCreateEditLocationDialog();
  };

  const duplicateLocation = () => {
    const locationPosition = getLocationPosition(selectedLocation.uuid);
    addLocation(
      {
        ...selectedLocation,
        uuid: getUuid(),
        name: selectedLocation.name + ' (copy)',
        isDefault: false,
      },
      false,
      locationPosition + 1,
    );
    setLocationDirectoryContextMenuAnchorEl(null);
  };

  const moveLocationUpInt = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    if (selectedLocation && selectedLocation.uuid) {
      moveLocationUp(selectedLocation.uuid);
    }
  };

  const moveLocationDownInt = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    if (selectedLocation && selectedLocation.uuid) {
      moveLocationDown(selectedLocation.uuid);
    }
  };

  const showDeleteLocationDialog = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    openConfirmDialog(
      t('core:removeLocation'),
      t('core:deleteLocationContentAlert', {
        locationName: selectedLocation ? selectedLocation.name : '',
      }),
      (result) => {
        if (result && selectedLocation) {
          deleteLocation(selectedLocation.uuid);
        }
      },
      'cancelDeleteLocationDialog',
      'confirmDeleteLocationDialog',
    );
  };

  const showInFileManagerInt = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    getLocationPath(selectedLocation).then((path) =>
      openDirectoryMessage(path),
    );
  };

  const closeLocationInt = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    if (selectedLocation && selectedLocation.uuid) {
      closeLocation(selectedLocation.uuid);
      //closeLocationTree();
    }
  };

  const openInNewWindow = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    const sharingLink = generateSharingLink(selectedLocation.uuid);
    createNewInstance(
      window.location.href.split('?')[0] + '?' + sharingLink.split('?')[1],
    );
  };

  const menuItems = [];
  if (!AppConfig.locationsReadOnly && !selectedLocation.isNotEditable) {
    menuItems.push(
      <MenuItem
        key="editLocation"
        data-tid="editLocation"
        onClick={showEditLocationDialog}
      >
        <ListItemIcon>
          <EditIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:editLocationTitle')} />
      </MenuItem>,
    );
  }
  menuItems.push(
    <MenuItem
      key="locationMenuOpenFileNewWindow"
      data-tid="locationMenuOpenFileNewWindow"
      onClick={openInNewWindow}
    >
      <ListItemIcon>
        <OpenNewWindowIcon />
      </ListItemIcon>
      <ListItemText primary={t('core:openInWindow')} />
    </MenuItem>,
  );
  if (selectedLocation.type === locationType.TYPE_LOCAL) {
    menuItems.push(
      <MenuItem
        key="showInFileManager"
        data-tid="showInFileManager"
        onClick={showInFileManagerInt}
      >
        <ListItemIcon>
          <OpenFolderNativelyIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:showInFileManager')} />
      </MenuItem>,
    );
  }
  menuItems.push(<Divider />);
  if (!AppConfig.locationsReadOnly) {
    menuItems.push(
      <MenuItem
        key="duplicateLocation"
        data-tid="duplicateLocationTID"
        onClick={duplicateLocation}
      >
        <ListItemIcon>
          <ContentCopyIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:duplicateLocationTitle')} />
      </MenuItem>,
    );
  }
  menuItems.push(
    <MenuItem
      key="indexLocation"
      data-tid="indexLocation"
      onClick={indexLocation}
    >
      <ListItemIcon>
        <ReloadIcon />
      </ListItemIcon>
      <ListItemText primary={t('core:indexLocation')} />
    </MenuItem>,
  );
  if (!AppConfig.locationsReadOnly) {
    menuItems.push(<Divider />);
    menuItems.push(
      <MenuItem
        key="moveLocationUp"
        data-tid="moveLocationUp"
        onClick={moveLocationUpInt}
      >
        <ListItemIcon>
          <ArrowUpIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:moveUp')} />
      </MenuItem>,
    );
    menuItems.push(
      <MenuItem
        key="moveLocationDown"
        data-tid="moveLocationDown"
        onClick={moveLocationDownInt}
      >
        <ListItemIcon>
          <ArrowDownIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:moveDown')} />
      </MenuItem>,
    );
    menuItems.push(<Divider />);
    menuItems.push(
      <MenuItem
        key="removeLocation"
        data-tid="removeLocation"
        onClick={showDeleteLocationDialog}
      >
        <ListItemIcon>
          <DeleteIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:removeLocation')} />
      </MenuItem>,
    );
  }
  if (!AppConfig.locationsReadOnly)
    menuItems.push(
      <MenuItem
        key="closeLocationTID"
        data-tid="closeLocationTID"
        onClick={closeLocationInt}
      >
        <ListItemIcon>
          <CloseIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:closeLocation')} />
      </MenuItem>,
    );

  return (
    <Menu
      anchorEl={locationDirectoryContextMenuAnchorEl}
      open={Boolean(locationDirectoryContextMenuAnchorEl)}
      onClose={() => setLocationDirectoryContextMenuAnchorEl(null)}
    >
      <TsMenuList>{menuItems}</TsMenuList>
    </Menu>
  );
}

export default LocationContextMenu;
