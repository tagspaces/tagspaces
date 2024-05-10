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

import React, { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { LocalLocationIcon, CloudLocationIcon } from '-/components/CommonIcons';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubHeader from '@mui/material/ListSubheader';
import Tooltip from '-/components/Tooltip';
import IconButton from '@mui/material/IconButton';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { CommonLocation } from '-/utils/CommonLocation';

interface Props {
  menuAnchorEl?: Element;
}

function LocationMenu(props: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { locations, openLocation, currentLocation } =
    useCurrentLocationContext();
  //const dispatch: AppDispatch = useDispatch();
  //const locations: Array<CommonLocation> = useSelector(getLocations);
  const [locationChooserMenuAnchorEl, setLocationChooserMenuAnchorEl] =
    useState<null | HTMLElement>(null);

  const locationIcon =
    currentLocation && currentLocation.type === locationType.TYPE_CLOUD ? (
      <CloudLocationIcon />
    ) : (
      <LocalLocationIcon />
    );

  return (
    <div
      style={{
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Tooltip
        title={
          currentLocation
            ? t('currentLocation') + ': ' + currentLocation.name
            : t('core:pleaseOpenLocation')
        }
      >
        <IconButton
          data-tid="folderContainerLocationChooser"
          id="locationMenuButton"
          onClick={(event) =>
            setLocationChooserMenuAnchorEl(event.currentTarget)
          }
          style={{
            padding: 5,
            fontSize: theme.typography.fontSize,
            borderRadius: 10,
          }}
          size="large"
        >
          {currentLocation ? locationIcon : t('core:pleaseOpenLocation')}
          <ArrowDropDownIcon />
        </IconButton>
      </Tooltip>
      {Boolean(locationChooserMenuAnchorEl) && (
        <Menu
          id="simple-menu"
          open={Boolean(locationChooserMenuAnchorEl)}
          anchorEl={locationChooserMenuAnchorEl}
          onClose={() => setLocationChooserMenuAnchorEl(null)}
          PaperProps={{
            style: {
              maxHeight: 48 * 6.5,
              width: 300,
            },
          }}
        >
          <ListSubHeader
            style={{
              backgroundColor: theme.palette.background.default,
            }}
          >
            {t('core:chooseLocation')}
          </ListSubHeader>
          {locations.map((location: CommonLocation) => (
            <MenuItem
              data-tid="folderContainerMenuOpenLocation"
              key={location.uuid}
              onClick={() => {
                openLocation(location);
                setLocationChooserMenuAnchorEl(null);
              }}
              style={
                currentLocation && currentLocation.uuid === location.uuid
                  ? { backgroundColor: theme.palette.primary.light }
                  : {}
              }
            >
              <ListItemIcon>
                {location.type === locationType.TYPE_CLOUD ? (
                  <CloudLocationIcon />
                ) : (
                  <LocalLocationIcon />
                )}
              </ListItemIcon>
              <ListItemText primary={location.name} />
            </MenuItem>
          ))}
        </Menu>
      )}
    </div>
  );
}

export default LocationMenu;
