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

import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import FolderIcon from '@mui/icons-material/Folder';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import { extractDirectoryName } from '@tagspaces/tagspaces-common/paths';
import AppConfig from '-/AppConfig';
import { useTranslation } from 'react-i18next';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { selectDirectoryDialog } from '-/services/utils-io';
import { CommonLocation } from '-/utils/CommonLocation';

interface Props {
  errorTextPath: boolean;
  errorTextName: boolean;
  setName: (string) => void;
  setPath: (string) => void;
  path: string;
  name: string;
}

function LocalForm(props: Props) {
  const { errorTextPath, errorTextName, setName, setPath, path, name } = props;
  const { t } = useTranslation();
  const { currentLocation } = useCurrentLocationContext();

  const openDirectory = () => {
    selectDirectoryDialog()
      .then((selectedPaths) => {
        const selectedPath = decodeURI(selectedPaths[0]);
        setPath(selectedPath);
        if (name.length < 1 && selectedPath.length > 0) {
          const dirName = extractDirectoryName(
            selectedPath,
            currentLocation?.getDirSeparator(),
          );
          setName(dirName.charAt(0).toUpperCase() + dirName.slice(1));
        }
        return true;
      })
      .catch((err) => {
        console.log('selectDirectoryDialog failed with: ' + err);
      });
  };

  return (
    <Grid container>
      <Grid item xs={12}>
        <FormControl fullWidth={true} error={errorTextName}>
          <TextField
            required
            autoFocus
            margin="dense"
            name="name"
            inputProps={{ autoCorrect: 'off' }}
            onChange={(event) => setName(event.target.value)}
            value={name}
            data-tid="locationName"
            fullWidth={true}
            // helperText="Please enter location name"
            label={t('core:createLocationName')}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth={true} error={errorTextPath}>
          <TextField
            required
            margin="dense"
            name="path"
            fullWidth={true}
            inputProps={{ autoCorrect: 'off', autoCapitalize: 'none' }}
            data-tid="locationPath"
            onChange={(event) => setPath(event.target.value)}
            value={path}
            // placeholder="Enter a folder path or select it with the button on the right"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" style={{ height: 32 }}>
                  <IconButton onClick={openDirectory} size="large">
                    <FolderIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            label={t('core:createLocationPath')}
          />
          {AppConfig.isCordovaAndroid && (
            <FormHelperText>
              Examples: sdcard/DCIM, sdcard/Downloads or /storage/899D-1617 for
              ext. sd-card
            </FormHelperText>
          )}
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default LocalForm;
