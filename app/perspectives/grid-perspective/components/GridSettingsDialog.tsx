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
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  Switch,
  Divider,
  InputLabel,
  Select,
  MenuItem,
  Button,
  FormHelperText
} from '@material-ui/core';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ThumbnailCoverIcon from '@material-ui/icons/PhotoSizeSelectActual';
import ThumbnailContainIcon from '@material-ui/icons/PhotoSizeSelectLarge';
import RadioCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import RadioUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import { withStyles } from '@material-ui/core/styles';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import i18n from '-/services/i18n';

const styles: any = {
  root: {
    overflowX: 'hidden'
  },
  listItem: {
    paddingLeft: 0,
    paddingRight: 0
  },
  pro: {
    backgroundColor: '#1DD19F'
  },
  colorChooserButton: {
    minHeight: 30,
    border: '1px solid lightgray'
  }
};

interface Props {
  open: boolean;
  gridPageLimit: number;
  onClose: () => void;
  setGridPageLimit: (number) => void;
  toggleShowDirectories: () => void;
  toggleShowTags: () => void;
  showDirectories: boolean;
  showTags: boolean;
  toggleThumbnailsMode: () => void;
  thumbnailMode: string;
  changeEntrySize: (entrySize: string) => void;
  entrySize: string;
  changeSingleClickAction: (actionType: string) => void;
  singleClickAction: string;
  openHelpWebPage: () => void;
  classes: any;
  // setShowDirectories: (check: boolean) => void;
}

const GridSettingsDialog = (props: Props) => {
  const {
    open,
    onClose,
    gridPageLimit,
    toggleShowDirectories,
    showDirectories,
    toggleShowTags,
    showTags,
    toggleThumbnailsMode,
    thumbnailMode,
    changeEntrySize,
    entrySize,
    changeSingleClickAction,
    singleClickAction,
    openHelpWebPage
  } = props;

  let newGridPageLimit = gridPageLimit;

  const handleGridPaginationLimit = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'limit') {
      newGridPageLimit = roughScale(value);
    }
    props.setGridPageLimit(newGridPageLimit);
  };

  function roughScale(x) {
    const parsed = parseInt(x, 10);
    if (isNaN(parsed)) {
      return 100;
    }
    return parsed;
  }

  return (
    <Dialog open={open} onClose={onClose} keepMounted scroll="paper">
      <DialogTitle>
        {i18n.t('core:perspectiveSettingsTitle')}
        <DialogCloseButton onClose={onClose} />
      </DialogTitle>
      <DialogContent>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={showDirectories}
                onChange={toggleShowDirectories}
                name="checkedB"
                color="primary"
              />
            }
            label={i18n.t('core:showHideDirectories')}
          />
          <FormControlLabel
            control={
              <Switch
                checked={showTags}
                onChange={toggleShowTags}
                name="checkedB"
                color="primary"
              />
            }
            label={i18n.t('core:showTags')}
          />
        </FormGroup>
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
          onClick={() => changeEntrySize('small')}
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
          onClick={() => changeEntrySize('normal')}
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
          onClick={() => changeEntrySize('big')}
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
          onClick={() => changeSingleClickAction('openInternal')}
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
          onClick={() => changeSingleClickAction('openExternal')}
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
          onClick={() => changeSingleClickAction('selects')}
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
        <FormControl
          fullWidth={true}
          style={{ overflow: 'visible', marginTop: 20 }}
        >
          <InputLabel shrink htmlFor="pageLimit">
            {i18n.t('core:pageLimit')}
          </InputLabel>
          <Select
            name="limit"
            defaultValue={gridPageLimit}
            onChange={handleGridPaginationLimit}
          >
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
            <MenuItem value={500}>500</MenuItem>
            <MenuItem value={undefined}>{i18n.t('core:unlimited')}</MenuItem>
          </Select>
          <FormHelperText>{i18n.t('core:pageLimitHelp')}</FormHelperText>
        </FormControl>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'space-between' }}>
        <Button
          data-tid="gridPerspectiveHelp"
          title={i18n.t('core:help')}
          onClick={openHelpWebPage}
        >
          {i18n.t('core:help')}
        </Button>
        <Button
          data-tid="cancelDialog"
          title={i18n.t('core:closeButton')}
          onClick={onClose}
          color="primary"
        >
          {i18n.t('core:closeButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withStyles(styles, { withTheme: true })(GridSettingsDialog);
