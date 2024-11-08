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
import TsMenuList from '-/components/TsMenuList';
import { useTranslation } from 'react-i18next';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';

interface Props {
  open: boolean;
  onClose: () => void;
  anchorEl: Element;
  openHelpWebPage: () => void;
  openSettings: () => void;
}

function GridOptionsMenu(props: Props) {
  const { open, onClose, anchorEl, openHelpWebPage, openSettings } = props;

  const { t } = useTranslation();
  const {
    showDirectories,
    showTags,
    thumbnailMode,
    entrySize,
    singleClickAction,
    setSettings,
    saveSettings,
  } = usePerspectiveSettingsContext();

  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      <TsMenuList>
        <MenuItem
          data-tid="gridPerspectiveToggleShowDirectories"
          title={t('core:showHideDirectories')}
          aria-label={t('core:showHideDirectories')}
          onClick={() => {
            setSettings({ showDirectories: !showDirectories });
            saveSettings(false);
          }}
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
          onClick={() => {
            setSettings({ showTags: !showTags });
            saveSettings(false);
          }}
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
          onClick={() => {
            setSettings({
              thumbnailMode: thumbnailMode === 'cover' ? 'contain' : 'cover',
            });
            saveSettings(false);
          }}
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
          onClick={() => {
            setSettings({ entrySize: 'small' });
            saveSettings(false);
          }}
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
          onClick={() => {
            setSettings({ entrySize: 'normal' });
            saveSettings(false);
          }}
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
          onClick={() => {
            setSettings({ entrySize: 'big' });
            saveSettings(false);
          }}
        >
          <ListItemIcon>
            {entrySize === 'big' ? (
              <RadioCheckedIcon />
            ) : (
              <RadioUncheckedIcon />
            )}
          </ListItemIcon>
          <ListItemText primary={t('core:entrySizeBig')} />
        </MenuItem>
        <Divider />
        <MenuItem
          data-tid="gridPerspectiveSingleClickOpenInternally"
          title={t('core:singleClickOpenInternally')}
          aria-label={t('core:singleClickOpenInternally')}
          onClick={() => {
            setSettings({ singleClickAction: 'openInternal' });
            saveSettings(false);
          }}
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
          onClick={() => {
            setSettings({ singleClickAction: 'openExternal' });
            saveSettings(false);
          }}
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
          onClick={() => {
            setSettings({ singleClickAction: 'selects' });
            saveSettings(false);
          }}
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
      </TsMenuList>
    </Menu>
  );
}

export default GridOptionsMenu;
