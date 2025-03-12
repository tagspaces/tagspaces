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
  HelpIcon,
  LocalLocationIcon,
  MoreMenuIcon,
} from '-/components/CommonIcons';
import { ProLabel } from '-/components/HelperComponents';
import TsIconButton from '-/components/TsIconButton';
import TsMenuList from '-/components/TsMenuList';
import { useLinkDialogContext } from '-/components/dialogs/hooks/useLinkDialogContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { openURLExternally } from '-/services/utils-io';
import CloseIcon from '@mui/icons-material/Close';
import ExportImportIcon from '@mui/icons-material/SwapHoriz';
import UpdateIndexIcon from '@mui/icons-material/Update';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Links from 'assets/links';
import classNames from 'classnames';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pro } from '../../pro';

interface Props {
  classes: any;
  exportLocations: () => void;
  importLocations: () => void;
  showCreateLocationDialog: () => void;
}

function LocationManagerMenu(props: Props) {
  const {
    classes,
    exportLocations,
    importLocations,
    showCreateLocationDialog,
  } = props;
  const { t } = useTranslation();

  const { createLocationsIndexes } = useLocationIndexContext();
  const { closeAllLocations } = useCurrentLocationContext();
  const { openLinkDialog } = useLinkDialogContext();
  const [locationManagerMenuAnchorEl, setLocationManagerMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const menuItems = [];
  if (!AppConfig.locationsReadOnly) {
    menuItems.push(
      <MenuItem
        key="locationManagerMenuCreateLocation"
        data-tid="locationManagerMenuCreateLocation"
        onClick={() => {
          setLocationManagerMenuAnchorEl(null);
          showCreateLocationDialog();
        }}
      >
        <ListItemIcon>
          <LocalLocationIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:createLocationTitle')} />
      </MenuItem>,
    );
  }

  // menuItems.push(
  //   <MenuItem
  //     key="locationManagerMenuOpenLink"
  //     data-tid="locationManagerMenuOpenLink"
  //     onClick={() => {
  //       setLocationManagerMenuAnchorEl(null);
  //       openLinkDialog();
  //     }}
  //   >
  //     <ListItemIcon>
  //       <OpenLinkIcon />
  //     </ListItemIcon>
  //     <ListItemText primary={t('core:openLink')} />
  //   </MenuItem>,
  // );

  if (!AppConfig.locationsReadOnly) {
    // https://trello.com/c/z6ESlqxz/697-exports-to-json-or-csv-do-not-work-on-android
    menuItems.push(
      <MenuItem
        disabled={!Pro}
        key="locationManagerMenuExportLocationsTID"
        data-tid="locationManagerMenuExportLocationsTID"
        onClick={() => {
          setLocationManagerMenuAnchorEl(null);
          exportLocations();
        }}
      >
        <ListItemIcon>
          <ExportImportIcon />
        </ListItemIcon>
        <ListItemText
          primary={
            <>
              {t('core:exportLocationTitle')}
              <ProLabel />
            </>
          }
        />
      </MenuItem>,
    );
    menuItems.push(
      <MenuItem
        disabled={!Pro}
        key="locationManagerMenuImportLocations"
        data-tid="locationManagerMenuImportLocationsTID"
        onClick={() => {
          setLocationManagerMenuAnchorEl(null);
          importLocations();
        }}
      >
        <ListItemIcon>
          <ExportImportIcon />
        </ListItemIcon>
        <ListItemText
          primary={
            <>
              {t('core:importLocationTitle')}
              <ProLabel />
            </>
          }
        />
      </MenuItem>,
    );
  }

  menuItems.push(
    <MenuItem
      key="locationManagerMenuCloseAll"
      data-tid="locationManagerMenuCloseAll"
      onClick={() => {
        setLocationManagerMenuAnchorEl(null);
        closeAllLocations();
      }}
    >
      <ListItemIcon>
        <CloseIcon />
      </ListItemIcon>
      <ListItemText primary={t('core:closeAllLocations')} />
    </MenuItem>,
  );

  menuItems.push(
    <MenuItem
      key="updateAllLocationIndexes"
      data-tid="updateAllLocationIndexes"
      onClick={() => {
        setLocationManagerMenuAnchorEl(null);
        createLocationsIndexes();
      }}
    >
      <ListItemIcon>
        <UpdateIndexIcon />
      </ListItemIcon>
      <ListItemText primary={t('core:updateAllLocationIndexes')} />
    </MenuItem>,
  );

  menuItems.push(
    <MenuItem
      key="locationManagerMenuHelp"
      data-tid="locationManagerMenuHelp"
      onClick={() => {
        setLocationManagerMenuAnchorEl(null);
        openURLExternally(Links.documentationLinks.locations, true);
      }}
    >
      <ListItemIcon>
        <HelpIcon />
      </ListItemIcon>
      <ListItemText primary={t('core:help')} />
    </MenuItem>,
  );

  return (
    <>
      <div className={classes.toolbar}>
        <Typography
          className={classNames(classes.panelTitle, classes.header)}
          variant="subtitle1"
        >
          {t('core:locationManager')}
        </Typography>
        <TsIconButton
          data-tid="locationManagerMenu"
          onClick={(event) =>
            setLocationManagerMenuAnchorEl(event.currentTarget)
          }
        >
          <MoreMenuIcon />
        </TsIconButton>
      </div>
      <Menu
        anchorEl={locationManagerMenuAnchorEl}
        open={Boolean(locationManagerMenuAnchorEl)}
        onClose={() => {
          setLocationManagerMenuAnchorEl(null);
        }}
      >
        <TsMenuList>{menuItems}</TsMenuList>
      </Menu>
    </>
  );
}
export default LocationManagerMenu;
