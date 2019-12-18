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
 * @flow
 */

import React from 'react';
import memoize from 'memoize-one';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxEmptyIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import Divider from '@material-ui/core/Divider';
import ThumbnailCoverIcon from '@material-ui/icons/PhotoSizeSelectActual';
import ThumbnailContainIcon from '@material-ui/icons/PhotoSizeSelectLarge';
import RadioCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import RadioUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import HelpIcon from '@material-ui/icons/Help';
import i18n from '../../../services/i18n';

type Props = {
  open: boolean,
  onClose: () => void,
  anchorEl: Object,
  toggleShowDirectories: boolean,
  toggleShowTags: boolean,
  showDirectories: boolean,
  showTags: boolean,
  toggleThumbnailsMode: boolean,
  thumbnailMode: string,
  singleClickAction: string,
  entrySize: string
};

const GridOptionsMenu = (props: Props) => {
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
    openHelpWebPage
  } = props;

  return (
    <Menu
      open={props.open}
      onClose={props.onClose}
      anchorEl={props.optionsContextMenuAnchorEl}
    >
      <MenuItem
        data-tid="gridPerspectiveToggleShowDirectories"
        title={i18n.t('core:showHideDirectories')}
        aria-label={i18n.t('core:showHideDirectories')}
        onClick={toggleShowDirectories}
      >
        <ListItemIcon>
          {showDirectories ? (
            <CheckBoxIcon />
          ) : (
            <CheckBoxEmptyIcon />
          )}
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:showHideDirectories')} />
      </MenuItem>
      <MenuItem
        data-tid="gridPerspectiveToggleShowTags"
        title={i18n.t('core:showTags')}
        aria-label={i18n.t('core:showTags')}
        onClick={toggleShowTags}
      >
        <ListItemIcon>
          {showTags ? (
            <CheckBoxIcon />
          ) : (
            <CheckBoxEmptyIcon />
          )}
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:showTags')} />
      </MenuItem>
      <Divider />
      <MenuItem
        data-tid="gridPerspectiveToggleThumbnailsMode"
        title={i18n.t('core:toggleThumbnailModeTitle')}
        aria-label={i18n.t('core:toggleThumbnailMode')}
        onClick={toggleThumbnailsMode}
      >
        <ListItemIcon>
          {thumbnailMode === 'cover' ? (
            <ThumbnailCoverIcon />
          ) : (
            <ThumbnailContainIcon />
          )}
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:toggleThumbnailMode')} />
      </MenuItem>
      <Divider />
      <MenuItem
        data-tid="gridPerspectiveEntrySizeSmall"
        title={i18n.t('core:entrySizeSmall')}
        aria-label={i18n.t('core:entrySizeSmall')}
        onClick={() => props.changeEntrySize('small')}
      >
        <ListItemIcon>
          {entrySize === 'small' ? (
            <RadioCheckedIcon />
          ) : (
            <RadioUncheckedIcon />
          )}
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:entrySizeSmall')} />
      </MenuItem>
      <MenuItem
        data-tid="gridPerspectiveEntrySizeNormal"
        title={i18n.t('core:entrySizeNormal')}
        aria-label={i18n.t('core:entrySizeNormal')}
        onClick={() => props.changeEntrySize('normal')}
      >
        <ListItemIcon>
          {entrySize === 'normal' ? (
            <RadioCheckedIcon />
          ) : (
            <RadioUncheckedIcon />
          )}
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:entrySizeNormal')} />
      </MenuItem>
      <MenuItem
        data-tid="gridPerspectiveEntrySizeBig"
        title={i18n.t('core:entrySizeBig')}
        aria-label={i18n.t('core:entrySizeBig')}
        onClick={() => props.changeEntrySize('big')}
      >
        <ListItemIcon>
          {entrySize === 'big' ? (
            <RadioCheckedIcon />
          ) : (
            <RadioUncheckedIcon />
          )}
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:entrySizeBig')} />
      </MenuItem>
      <Divider />
      <MenuItem
        data-tid="gridPerspectiveSingleClickOpenInternally"
        title={i18n.t('core:singleClickOpenInternally')}
        aria-label={i18n.t('core:singleClickOpenInternally')}
        onClick={() => props.changeSingleClickAction('openInternal')}
      >
        <ListItemIcon>
          {singleClickAction === 'openInternal' ? (
            <RadioCheckedIcon />
          ) : (
            <RadioUncheckedIcon />
          )}
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:singleClickOpenInternally')} />
      </MenuItem>
      <MenuItem
        data-tid="gridPerspectiveSingleClickOpenExternally"
        title={i18n.t('core:singleClickOpenExternally')}
        aria-label={i18n.t('core:singleClickOpenExternally')}
        onClick={() => props.changeSingleClickAction('openExternal')}
      >
        <ListItemIcon>
          {singleClickAction === 'openExternal' ? (
            <RadioCheckedIcon />
          ) : (
            <RadioUncheckedIcon />
          )}
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:singleClickOpenExternally')} />
      </MenuItem>
      <MenuItem
        data-tid="gridPerspectiveSingleClickSelects"
        title={i18n.t('core:singleClickSelects')}
        aria-label={i18n.t('core:singleClickSelects')}
        onClick={() => props.changeSingleClickAction('selects')}
      >
        <ListItemIcon>
          {singleClickAction === 'selects' ? (
            <RadioCheckedIcon />
          ) : (
            <RadioUncheckedIcon />
          )}
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:singleClickSelects')} />
      </MenuItem>
      <Divider />
      <MenuItem
        data-tid="gridPerspectiveHelp"
        title={i18n.t('core:help')}
        aria-label={i18n.t('core:perspectiveHelp')}
        onClick={openHelpWebPage}
      >
        <ListItemIcon>
          <HelpIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:help')} />
      </MenuItem>
    </Menu>
  );
};

export default GridOptionsMenu;
