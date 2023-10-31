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

import React from 'react';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxEmptyIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import Divider from '@mui/material/Divider';
import ThumbnailCoverIcon from '@mui/icons-material/PhotoSizeSelectActual';
import ThumbnailContainIcon from '@mui/icons-material/PhotoSizeSelectLarge';
import RadioCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onClose: () => void;
  anchorEl: Element;
  toggleShowDirectories: () => void;
  toggleShowTags: () => void;
  showDirectories: boolean;
  showTags: boolean;
  toggleThumbnailsMode: () => string;
  thumbnailMode: string;
  singleClickAction: string;
  entrySize: string;
  changeEntrySize: (entrySize: string) => void;
  changeSingleClickAction: (actionType: string) => void;
  openHelpWebPage: () => void;
  openSettings: () => void;
}

function GridOptionsMenu(props: Props) {
  const {
    open,
    onClose,
    anchorEl,
    changeEntrySize,
    toggleShowDirectories,
    showDirectories,
    toggleShowTags,
    showTags,
    toggleThumbnailsMode,
    thumbnailMode,
    changeSingleClickAction,
    entrySize,
    singleClickAction,
    openHelpWebPage,
    openSettings,
  } = props;

  const { t } = useTranslation();

  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      <MenuItem
        data-tid="gridPerspectiveToggleShowDirectories"
        title={t('core:showHideDirectories')}
        aria-label={t('core:showHideDirectories')}
        onClick={toggleShowDirectories}
      >
        <ListItemIcon>
          {showDirectories ? <CheckBoxIcon /> : <CheckBoxEmptyIcon />}
        </ListItemIcon>
        <ListItemText primary={t('core:showHideDirectories')} />
      </MenuItem>
      <MenuItem
        data-tid="gridPerspectiveToggleShowTags"
        title={t('core:showTags')}
        aria-label={t('core:showTags')}
        onClick={toggleShowTags}
      >
        <ListItemIcon>
          {showTags ? <CheckBoxIcon /> : <CheckBoxEmptyIcon />}
        </ListItemIcon>
        <ListItemText primary={t('core:showTags')} />
      </MenuItem>
      <Divider />
      <MenuItem
        data-tid="gridPerspectiveToggleThumbnailsMode"
        title={t('core:toggleThumbnailModeTitle')}
        aria-label={t('core:toggleThumbnailMode')}
        onClick={toggleThumbnailsMode}
      >
        <ListItemIcon>
          {thumbnailMode === 'cover' ? (
            <ThumbnailCoverIcon />
          ) : (
            <ThumbnailContainIcon />
          )}
        </ListItemIcon>
        <ListItemText primary={t('core:toggleThumbnailMode')} />
      </MenuItem>
      <Divider />
      <MenuItem
        data-tid="gridPerspectiveEntrySizeSmall"
        title={t('core:entrySizeSmall')}
        aria-label={t('core:entrySizeSmall')}
        onClick={() => changeEntrySize('small')}
      >
        <ListItemIcon>
          {entrySize === 'small' ? (
            <RadioCheckedIcon />
          ) : (
            <RadioUncheckedIcon />
          )}
        </ListItemIcon>
        <ListItemText primary={t('core:entrySizeSmall')} />
      </MenuItem>
      <MenuItem
        data-tid="gridPerspectiveEntrySizeNormal"
        title={t('core:entrySizeNormal')}
        aria-label={t('core:entrySizeNormal')}
        onClick={() => changeEntrySize('normal')}
      >
        <ListItemIcon>
          {entrySize === 'normal' ? (
            <RadioCheckedIcon />
          ) : (
            <RadioUncheckedIcon />
          )}
        </ListItemIcon>
        <ListItemText primary={t('core:entrySizeNormal')} />
      </MenuItem>
      <MenuItem
        data-tid="gridPerspectiveEntrySizeBig"
        title={t('core:entrySizeBig')}
        aria-label={t('core:entrySizeBig')}
        onClick={() => changeEntrySize('big')}
      >
        <ListItemIcon>
          {entrySize === 'big' ? <RadioCheckedIcon /> : <RadioUncheckedIcon />}
        </ListItemIcon>
        <ListItemText primary={t('core:entrySizeBig')} />
      </MenuItem>
      <Divider />
      <MenuItem
        data-tid="gridPerspectiveSingleClickOpenInternally"
        title={t('core:singleClickOpenInternally')}
        aria-label={t('core:singleClickOpenInternally')}
        onClick={() => changeSingleClickAction('openInternal')}
      >
        <ListItemIcon>
          {singleClickAction === 'openInternal' ? (
            <RadioCheckedIcon />
          ) : (
            <RadioUncheckedIcon />
          )}
        </ListItemIcon>
        <ListItemText primary={t('core:singleClickOpenInternally')} />
      </MenuItem>
      <MenuItem
        data-tid="gridPerspectiveSingleClickOpenExternally"
        title={t('core:singleClickOpenExternally')}
        aria-label={t('core:singleClickOpenExternally')}
        onClick={() => changeSingleClickAction('openExternal')}
      >
        <ListItemIcon>
          {singleClickAction === 'openExternal' ? (
            <RadioCheckedIcon />
          ) : (
            <RadioUncheckedIcon />
          )}
        </ListItemIcon>
        <ListItemText primary={t('core:singleClickOpenExternally')} />
      </MenuItem>
      <MenuItem
        data-tid="gridPerspectiveSingleClickSelects"
        title={t('core:singleClickSelects')}
        aria-label={t('core:singleClickSelects')}
        onClick={() => changeSingleClickAction('selects')}
      >
        <ListItemIcon>
          {singleClickAction === 'selects' ? (
            <RadioCheckedIcon />
          ) : (
            <RadioUncheckedIcon />
          )}
        </ListItemIcon>
        <ListItemText primary={t('core:singleClickSelects')} />
      </MenuItem>
      <Divider />
      <MenuItem
        data-tid="gridPerspectiveSettings"
        title={t('core:settings')}
        aria-label={t('core:settings')}
        onClick={openSettings}
      >
        <ListItemIcon>
          <SettingsIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:settings')} />
      </MenuItem>
      <Divider />
      <MenuItem
        data-tid="gridPerspectiveHelp"
        title={t('core:help')}
        aria-label={t('core:perspectiveHelp')}
        onClick={openHelpWebPage}
      >
        <ListItemIcon>
          <HelpIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:help')} />
      </MenuItem>
    </Menu>
  );
}

export default GridOptionsMenu;
