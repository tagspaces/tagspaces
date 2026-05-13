/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2024-present TagSpaces GmbH
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

import {
  AddIcon,
  CheckIcon,
  CloudLocationIcon,
  LocalLocationIcon,
} from '-/components/CommonIcons';
import TsButton from '-/components/TsButton';
import { CommonLocation } from '-/utils/CommonLocation';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TsTooltip from '-/components/TsTooltip';
import Typography from '@mui/material/Typography';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  locations: CommonLocation[];
  activeLocationId?: string;
  onSelect: (location: CommonLocation) => void;
  /** Optional handler for the "Add location…" trailing item. Hidden when absent. */
  onAddLocation?: () => void;
  /** IDs of locations that should render disabled (e.g. unsupported destinations). */
  disabledLocationIds?: string[];
  /** Tooltip shown on disabled location rows. */
  locationDisabledTooltip?: string;
}

function isCloud(loc: CommonLocation): boolean {
  // WebDAV is deprecated and not considered; only S3 counts as cloud here.
  return loc.haveObjectStoreSupport();
}

function LocationPicker({
  locations,
  activeLocationId,
  onSelect,
  onAddLocation,
  disabledLocationIds,
  locationDisabledTooltip,
}: Props) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const { localList, cloudList } = useMemo(() => {
    const local: CommonLocation[] = [];
    const cloud: CommonLocation[] = [];
    for (const loc of locations) {
      (isCloud(loc) ? cloud : local).push(loc);
    }
    return { localList: local, cloudList: cloud };
  }, [locations]);

  const activeLocation =
    locations.find((l) => l.uuid === activeLocationId) ?? locations[0];
  const disabledSet = new Set(disabledLocationIds ?? []);

  const handleClose = () => setAnchorEl(null);
  const handlePick = (loc: CommonLocation) => {
    handleClose();
    if (loc.uuid !== activeLocation?.uuid) {
      onSelect(loc);
    }
  };

  const renderRow = (loc: CommonLocation) => {
    const disabled = disabledSet.has(loc.uuid);
    const active = loc.uuid === activeLocation?.uuid;
    const Icon = isCloud(loc) ? CloudLocationIcon : LocalLocationIcon;
    const row = (
      <MenuItem
        key={loc.uuid}
        data-tid={'folderBrowserLocationItem_' + loc.name}
        selected={active}
        disabled={disabled && !active}
        onClick={() => handlePick(loc)}
      >
        <ListItemIcon>
          <Icon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary={loc.name}
          secondary={
            loc.path ? (
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 220,
                }}
              >
                {loc.path}
              </Typography>
            ) : null
          }
        />
        {active && <CheckIcon fontSize="small" sx={{ marginLeft: 1 }} />}
      </MenuItem>
    );
    if (disabled && !active && locationDisabledTooltip) {
      return (
        <TsTooltip
          key={loc.uuid}
          title={locationDisabledTooltip}
          placement="right"
        >
          <span>{row}</span>
        </TsTooltip>
      );
    }
    return row;
  };

  const ActiveIcon = activeLocation
    ? isCloud(activeLocation)
      ? CloudLocationIcon
      : LocalLocationIcon
    : LocalLocationIcon;

  return (
    <>
      <TsButton
        data-tid="folderBrowserLocationPicker"
        variant="text"
        color="inherit"
        onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
          setAnchorEl(e.currentTarget)
        }
        startIcon={<ActiveIcon fontSize="small" />}
        endIcon={<ArrowDropDownIcon fontSize="small" />}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('core:switchLocation')}
        tooltip={t('core:switchLocation')}
        sx={{
          fontWeight: 600,
          padding: '2px 6px',
          minWidth: 0,
          flexShrink: 0,
          maxWidth: 160,
          '& .MuiButton-startIcon': { marginRight: 0.5 },
          '& .MuiButton-endIcon': { marginLeft: 0.25 },
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {activeLocation?.name ?? '—'}
        </span>
      </TsButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{ paper: { sx: { minWidth: 260, maxWidth: 320 } } }}
      >
        {localList.length > 0 && (
          <ListSubheader sx={{ lineHeight: '28px' }}>
            {t('core:localLocations')}
          </ListSubheader>
        )}
        {localList.map(renderRow)}
        {cloudList.length > 0 && (
          <ListSubheader sx={{ lineHeight: '28px' }}>
            {t('core:cloudLocations')}
          </ListSubheader>
        )}
        {cloudList.map(renderRow)}
        {onAddLocation && [
          <Divider key="div" />,
          <MenuItem
            key="add"
            onClick={() => {
              handleClose();
              onAddLocation();
            }}
          >
            <ListItemIcon>
              <AddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('core:addLocationEllipsis')} />
          </MenuItem>,
        ]}
      </Menu>
    </>
  );
}

export default LocationPicker;
