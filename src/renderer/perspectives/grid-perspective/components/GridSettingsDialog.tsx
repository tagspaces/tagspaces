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

import React, { useReducer, useRef } from 'react';
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
  FormHelperText,
  Typography,
  TextField,
} from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ThumbnailCoverIcon from '@mui/icons-material/PhotoSizeSelectActual';
import ThumbnailContainIcon from '@mui/icons-material/PhotoSizeSelectLarge';
import RadioCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { Pro } from '-/pro';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useSortedDirContext } from '-/perspectives/grid-perspective/hooks/useSortedDirContext';

/*const styles: any = {
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
};*/

interface Props {
  open: boolean;
  gridPageLimit: number;
  onClose: (isDefault?: boolean) => void;
  setGridPageLimit: (number) => void;
  toggleShowDescription?: () => void;
  toggleShowEntriesDescription?: () => void;
  toggleShowDetails: () => void;
  showDetails: boolean;
  showDescription: boolean;
  showEntriesDescription?: boolean;
  toggleShowDirectories: () => void;
  toggleShowTags: () => void;
  showDirectories: boolean;
  showTags: boolean;
  toggleThumbnailsMode: () => string;
  thumbnailMode: string;
  changeEntrySize: (entrySize: string) => void;
  entrySize: string;
  changeSingleClickAction: (actionType: string) => void;
  singleClickAction: string;
  openHelpWebPage: () => void;
  handleSortingMenu: (event) => void;
  isLocal: boolean;
  resetLocalSettings: () => void;
  // setShowDirectories: (check: boolean) => void;
}

function GridSettingsDialog(props: Props) {
  const { t } = useTranslation();
  const { sortBy, orderBy } = useSortedDirContext();
  const [ignored, forceUpdate] = useReducer((x: number) => x + 1, 0, undefined);
  const thumbnailMode = useRef<string>(props.thumbnailMode);
  const entrySize = useRef<string>(props.entrySize);
  const singleClickAction = useRef<string>(props.singleClickAction);

  const theme = useTheme();
  const {
    open,
    onClose,
    gridPageLimit,
    showDetails,
    toggleShowDetails,
    showDescription,
    showEntriesDescription,
    toggleShowEntriesDescription,
    toggleShowDescription,
    toggleShowDirectories,
    showDirectories,
    toggleShowTags,
    showTags,
    toggleThumbnailsMode,
    changeEntrySize,
    changeSingleClickAction,
    openHelpWebPage,
  } = props;

  let newGridPageLimit = gridPageLimit;

  const handleGridPaginationLimit = (
    event: React.ChangeEvent<HTMLInputElement>,
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
    <Dialog open={open} onClose={() => onClose()} keepMounted scroll="paper">
      <DialogTitle>
        {t('core:perspectiveSettingsTitle')}
        <DialogCloseButton
          testId="closePerspectiveSettingsTID"
          onClose={() => onClose()}
        />
      </DialogTitle>
      <DialogContent>
        {props.isLocal && (
          <>
            <Typography
              style={{ color: theme.palette.text.primary }}
              variant="caption"
            >
              {t('core:folderWithCustomPerspectiveSetting')}
            </Typography>
            <br />
            <Button
              data-tid="resetLocalSettingsTID"
              title={t('core:resetLocalSettings')}
              onClick={() => {
                props.resetLocalSettings();
                // forceUpdate();
              }}
            >
              {t('core:resetLocalSettings')}
            </Button>
          </>
        )}
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                data-tid="gridPerspectiveToggleShowDirectories"
                defaultChecked={showDirectories}
                onChange={toggleShowDirectories}
                name="checkedD"
                color="primary"
              />
            }
            label={t('core:showHideDirectories')}
          />
          <FormControlLabel
            control={
              <Switch
                data-tid="gridPerspectiveToggleShowTags"
                defaultChecked={showTags}
                onChange={toggleShowTags}
                name="checkedT"
                color="primary"
              />
            }
            label={t('core:showTags')}
          />
          <FormControlLabel
            control={
              <Switch
                data-tid="gridPerspectiveToggleShowEntriesDescription"
                defaultChecked={showEntriesDescription}
                onChange={toggleShowEntriesDescription}
                name={t('core:showHideEntriesDescription')}
                color="primary"
              />
            }
            label={t('core:showHideEntriesDescription')}
          />
          <Divider />
          <FormControlLabel
            control={
              <Switch
                data-tid="gridPerspectiveToggleShowDetails"
                defaultChecked={showDetails}
                onChange={toggleShowDetails}
                name={t('core:showHideDetails')}
                color="primary"
              />
            }
            label={t('core:showHideDetails')}
          />
          {toggleShowDescription && (
            <FormControlLabel
              control={
                <Switch
                  data-tid="gridPerspectiveToggleShowDescription"
                  defaultChecked={showDescription}
                  onChange={toggleShowDescription}
                  name={t('core:showHideDescription')}
                  color="primary"
                />
              }
              label={t('core:showHideDescription')}
            />
          )}
        </FormGroup>
        <Divider />
        <MenuItem
          data-tid="gridPerspectiveToggleThumbnailsMode"
          title={t('core:toggleThumbnailModeTitle')}
          aria-label={t('core:toggleThumbnailMode')}
          onClick={() => {
            thumbnailMode.current = toggleThumbnailsMode();
            forceUpdate();
          }}
        >
          <ListItemIcon>
            {thumbnailMode.current === 'cover' ? (
              <ThumbnailCoverIcon />
            ) : (
              <ThumbnailContainIcon />
            )}
          </ListItemIcon>
          <ListItemText primary={t('core:toggleThumbnailMode')} />
        </MenuItem>
        <Divider />
        <MenuItem
          data-tid="sortByMenuTID"
          title={t('core:sortBy')}
          aria-label={t('core:sortBy')}
          onClick={(e) => {
            props.handleSortingMenu(e);
          }}
        >
          <ListItemText
            primary={
              t('core:sort') +
              ': ' +
              t(sortBy) +
              ' ' +
              (orderBy ? 'ASC' : 'DESC')
            }
          />
        </MenuItem>
        <Divider />
        <MenuItem
          data-tid="gridPerspectiveEntrySizeSmall"
          title={t('core:entrySizeSmall')}
          aria-label={t('core:entrySizeSmall')}
          onClick={() => {
            changeEntrySize('small');
            entrySize.current = 'small';
            forceUpdate();
          }}
        >
          <ListItemIcon>
            {entrySize.current === 'small' ? (
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
            changeEntrySize('normal');
            entrySize.current = 'normal';
            forceUpdate();
          }}
        >
          <ListItemIcon>
            {entrySize.current === 'normal' ? (
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
            changeEntrySize('big');
            entrySize.current = 'big';
            forceUpdate();
          }}
        >
          <ListItemIcon>
            {entrySize.current === 'big' ? (
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
            changeSingleClickAction('openInternal');
            singleClickAction.current = 'openInternal';
            forceUpdate();
          }}
        >
          <ListItemIcon>
            {singleClickAction.current === 'openInternal' ? (
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
            changeSingleClickAction('openExternal');
            singleClickAction.current = 'openExternal';
            forceUpdate();
          }}
        >
          <ListItemIcon>
            {singleClickAction.current === 'openExternal' ? (
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
            changeSingleClickAction('selects');
            singleClickAction.current = 'selects';
            forceUpdate();
          }}
        >
          <ListItemIcon>
            {singleClickAction.current === 'selects' ? (
              <RadioCheckedIcon />
            ) : (
              <RadioUncheckedIcon />
            )}
          </ListItemIcon>
          <ListItemText primary={t('core:singleClickSelects')} />
        </MenuItem>
        <Divider />
        <FormControl
          fullWidth={true}
          style={{ overflow: 'visible', marginTop: 20 }}
        >
          <TextField
            select
            label={t('core:pageLimit')}
            name="limit"
            defaultValue={gridPageLimit}
            onChange={handleGridPaginationLimit}
          >
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
            <MenuItem value={500}>500</MenuItem>
            <MenuItem value={1000}>1000</MenuItem>
          </TextField>
          <FormHelperText>{t('core:pageLimitHelp')}</FormHelperText>
        </FormControl>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'space-between' }}>
        <Button data-tid="gridPerspectiveHelp" onClick={openHelpWebPage}>
          {t('core:help')}
        </Button>
        <Button
          data-tid="defaultSettings"
          onClick={() => {
            onClose(true);
          }}
          color="primary"
        >
          {t('core:defaultSettings')}
        </Button>
        {Pro && (
          <Button
            data-tid="directorySettings"
            onClick={() => {
              onClose(false);
            }}
            color="primary"
          >
            {t('core:directorySettings')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default GridSettingsDialog;
