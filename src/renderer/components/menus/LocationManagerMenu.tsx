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
  CloseIcon,
  ExportIcon,
  HelpIcon,
  ImportIcon,
  LocalLocationIcon,
  MoreMenuIcon,
  UpdateIndexIcon,
} from '-/components/CommonIcons';
import { ProLabel } from '-/components/HelperComponents';
import TsIconButton from '-/components/TsIconButton';
import TsMenuList from '-/components/TsMenuList';
import { useLinkDialogContext } from '-/components/dialogs/hooks/useLinkDialogContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { Pro } from '-/pro';
import { openURLExternally } from '-/services/utils-io';
import { Divider } from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Links from 'assets/links';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SidePanelTitle from '../SidePanelTitle';
import { TS } from '-/tagspaces.namespace';

interface Props {
  exportLocations: () => void;
  importLocations: () => void;
  showCreateLocationDialog: () => void;
}

function LocationManagerMenu(props: Props) {
  const { exportLocations, importLocations, showCreateLocationDialog } = props;
  const { t } = useTranslation();

  const { createLocationsIndexes } = useLocationIndexContext();
  const { closeAllLocations } = useCurrentLocationContext();
  //const { openLinkDialog } = useLinkDialogContext();
  const [locationManagerMenuAnchorEl, setLocationManagerMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const workSpacesContext = Pro?.contextProviders?.WorkSpacesContext
    ? useContext<TS.WorkSpacesContextData>(
        Pro.contextProviders.WorkSpacesContext,
      )
    : undefined;

  const currentWorkSpace =
    workSpacesContext && workSpacesContext.getCurrentWorkSpace
      ? workSpacesContext?.getCurrentWorkSpace()
      : undefined;

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
    menuItems.push(<Divider key={`divider-${menuItems.length}`} />);
  }

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
        <ExportIcon />
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
  if (!AppConfig.locationsReadOnly) {
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
          <ImportIcon />
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
    menuItems.push(<Divider key={`divider-${menuItems.length}`} />);
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
        createLocationsIndexes(true, currentWorkSpace);
      }}
    >
      <ListItemIcon>
        <UpdateIndexIcon />
      </ListItemIcon>
      <ListItemText primary={t('core:updateAllLocationIndexes')} />
    </MenuItem>,
  );
  menuItems.push(<Divider key={`divider-${menuItems.length}`} />);
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
      <SidePanelTitle
        title={t('core:locationManager')}
        menuButton={
          <TsIconButton
            data-tid="locationManagerMenu"
            onClick={(event) =>
              setLocationManagerMenuAnchorEl(event.currentTarget)
            }
          >
            <MoreMenuIcon />
          </TsIconButton>
        }
      />
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
