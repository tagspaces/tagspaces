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

import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import FolderIcon from '@material-ui/icons/Folder';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import i18n from '-/services/i18n';
import { extractDirectoryName } from '-/utils/paths';
import PlatformIO from '-/services/platform-io';
import AppConfig from '-/config';

interface Props {
  showAdvancedMode: boolean;
  errorTextPath: boolean;
  errorTextName: boolean;
  errorTextId: boolean;
  setName: (string) => void;
  setPath: (string) => void;
  setNewUuid: (string) => void;
  path: string;
  name: string;
  newuuid: string;
}

const LocalForm = (props: Props) => {
  const {
    errorTextPath,
    errorTextName,
    errorTextId,
    setName,
    setPath,
    setNewUuid,
    path,
    name,
    newuuid,
    showAdvancedMode
  } = props;

  const openDirectory = () => {
    PlatformIO.selectDirectoryDialog()
      .then(selectedPaths => {
        const selectedPath = selectedPaths[0];
        setPath(selectedPath);
        if (name.length < 1 && selectedPath.length > 0) {
          const dirName = extractDirectoryName(
            selectedPath,
            PlatformIO.getDirSeparator()
          );
          setName(dirName.charAt(0).toUpperCase() + dirName.slice(1));
        }
        return true;
      })
      .catch(err => {
        console.log('selectDirectoryDialog failed with: ' + err);
      });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControl fullWidth={true} error={errorTextPath}>
          <InputLabel htmlFor="path">
            {i18n.t('core:createLocationPath')}
          </InputLabel>
          <Input
            required
            autoFocus
            margin="dense"
            name="path"
            fullWidth={true}
            inputProps={{ autoCorrect: 'off', autoCapitalize: 'none' }}
            data-tid="locationPath"
            onChange={event => setPath(event.target.value)}
            value={path}
            placeholder="Enter a folder path or select it with the button on the right"
            endAdornment={
              <InputAdornment position="end" style={{ height: 32 }}>
                <IconButton onClick={openDirectory}>
                  <FolderIcon />
                </IconButton>
              </InputAdornment>
            }
          />
          {AppConfig.isCordovaAndroid && (
            <FormHelperText>
              Examples: sdcard/DCIM, sdcard/Downloads or /storage/899D-1617 for
              ext. sd-card
            </FormHelperText>
          )}
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth={true} error={errorTextName}>
          <InputLabel htmlFor="path">
            {i18n.t('core:createLocationName')}
          </InputLabel>
          <Input
            required
            margin="dense"
            name="name"
            inputProps={{ autoCorrect: 'off' }}
            onChange={event => setName(event.target.value)}
            value={name}
            data-tid="locationName"
            fullWidth={true}
          />
        </FormControl>
      </Grid>
      {showAdvancedMode && (
        <Grid item xs={12}>
          <FormControl fullWidth={true} error={errorTextId}>
            <InputLabel htmlFor="newuuid">
              {i18n.t('core:locationId')}
            </InputLabel>
            <Input
              required
              margin="dense"
              name="newuuid"
              fullWidth={true}
              data-tid="newuuid"
              placeholder="Unique location identifier"
              onChange={event => setNewUuid(event.target.value)}
              value={newuuid}
            />
          </FormControl>
        </Grid>
      )}
    </Grid>
  );
};

export default LocalForm;
