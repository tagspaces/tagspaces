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

import React, { useEffect, useReducer } from 'react';
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
  Box,
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
import { useSortedDirContext } from '-/perspectives/grid/hooks/useSortedDirContext';
import ZoomComponent from '-/components/ZoomComponent';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';
import useFirstRender from '-/utils/useFirstRender';

interface Props {
  open: boolean;
  onClose: () => void;
  openHelpWebPage: () => void;
  handleSortingMenu: (event) => void;
}

function GridSettingsDialog(props: Props) {
  const { t } = useTranslation();
  const {
    showDirectories,
    showTags,
    showDetails,
    showDescription,
    showEntriesDescription,
    thumbnailMode,
    singleClickAction,
    gridPageLimit,
    haveLocalSetting,
    resetLocalSetting,
    setSettings,
    saveSettings,
  } = usePerspectiveSettingsContext();
  const { sortBy, orderBy } = useSortedDirContext();
  const firstRender = useFirstRender();
  const [ignored, forceUpdate] = useReducer((x: number) => x + 1, 0, undefined);

  const theme = useTheme();
  const { open, onClose, openHelpWebPage } = props;

  useEffect(() => {
    if (!firstRender) {
      setSettings({
        sortBy: sortBy,
        orderBy: orderBy,
      });
    }
  }, [sortBy, orderBy]);

  const handleGridPaginationLimit = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'limit') {
      const newGridPageLimit = roughScale(value);
      setSettings({ gridPageLimit: newGridPageLimit });
    }
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
        {t('core:perspectiveSettingsTitle')}
        <DialogCloseButton
          testId="closePerspectiveSettingsTID"
          onClose={onClose}
        />
      </DialogTitle>
      <DialogContent>
        {haveLocalSetting() && (
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
                resetLocalSetting();
                onClose();
                // forceUpdate();
              }}
            >
              {t('core:resetLocalSettings')}
            </Button>
          </>
        )}
        <Divider />
        <Box style={{ display: 'flex' }}>
          <ZoomComponent preview={true} />
          <Typography
            style={{ color: theme.palette.text.primary, alignSelf: 'center' }}
            variant="body1"
          >
            {t('Size of the entries')}
          </Typography>
        </Box>
        <Divider />
        <FormGroup>
          <FormControlLabel
            // labelPlacement="start"
            control={
              <Switch
                data-tid="gridPerspectiveToggleShowDirectories"
                defaultChecked={showDirectories}
                onChange={() => {
                  setSettings({ showDirectories: !showDirectories });
                }}
                name="checkedD"
                color="primary"
              />
            }
            label={t('core:showHideDirectories')}
          />
          <FormControlLabel
            // labelPlacement="start"
            control={
              <Switch
                data-tid="gridPerspectiveToggleShowTags"
                defaultChecked={showTags}
                onChange={() => {
                  setSettings({ showTags: !showTags });
                }}
                name="checkedT"
                color="primary"
              />
            }
            label={t('core:showTags')}
          />
          <FormControlLabel
            // labelPlacement="start"
            control={
              <Switch
                data-tid="gridPerspectiveToggleShowEntriesDescription"
                defaultChecked={showEntriesDescription}
                onChange={() => {
                  setSettings({
                    showEntriesDescription: !showEntriesDescription,
                  });
                }}
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
                onChange={() => {
                  setSettings({ showDetails: !showDetails });
                }}
                name={t('core:showHideDetails')}
                color="primary"
              />
            }
            label={t('core:showHideDetails')}
          />
          {showDescription != undefined && (
            <FormControlLabel
              control={
                <Switch
                  data-tid="gridPerspectiveToggleShowDescription"
                  defaultChecked={showDescription}
                  onChange={() => {
                    setSettings({ showDescription: !showDescription });
                  }}
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
            setSettings({
              thumbnailMode: thumbnailMode === 'cover' ? 'contain' : 'cover',
            });
            forceUpdate();
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
          data-tid="gridPerspectiveSingleClickOpenInternally"
          title={t('core:singleClickOpenInternally')}
          aria-label={t('core:singleClickOpenInternally')}
          onClick={() => {
            setSettings({ singleClickAction: 'openInternal' });
            forceUpdate();
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
            forceUpdate();
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
            forceUpdate();
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
            saveSettings(true);
            onClose();
          }}
          color="primary"
        >
          {t('core:defaultSettings')}
        </Button>
        {Pro && (
          <Button
            data-tid="directorySettings"
            onClick={() => {
              saveSettings(false);
              onClose();
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
