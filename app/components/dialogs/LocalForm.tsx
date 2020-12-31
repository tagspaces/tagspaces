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
// import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import FolderIcon from '@material-ui/icons/Folder';
import Grid from '@material-ui/core/Grid';
import i18n from '-/services/i18n';
import AppConfig from '-/config';
import { extractDirectoryName } from '-/utils/paths';
import PlatformIO from '-/services/platform-io';

interface Props {
  state: any;
  handleChange: (param1: string, param2: string) => void;
  handleInputChange: (event: any) => void;
  showSelectDirectoryDialog: () => void;
}

const LocalForm = (props: Props) => {
  function openDirectory() {
    if (AppConfig.isElectron) {
      PlatformIO.selectDirectoryDialog()
        .then(selectedPaths => {
          const selectedPath = selectedPaths[0];
          props.handleChange('path', selectedPath);
          if (props.state.name.length < 1 && selectedPath.length > 0) {
            const dirName = extractDirectoryName(
              selectedPath,
              PlatformIO.getDirSeparator()
            );
            props.handleChange(
              'name',
              dirName.charAt(0).toUpperCase() + dirName.slice(1)
            );
          }
          return true;
        })
        .catch(err => {
          console.log('selectDirectoryDialog failed with: ' + err);
        });
    } else {
      props.showSelectDirectoryDialog();
    }
  }

  const { handleInputChange, state } = props;
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControl fullWidth={true} error={state.errorTextPath}>
          <InputLabel htmlFor="path">
            {i18n.t('core:createLocationPath')}
          </InputLabel>
          <Input
            required
            autoFocus
            margin="dense"
            name="path"
            fullWidth={true}
            data-tid="locationPath"
            onChange={handleInputChange}
            value={state.path}
            placeholder="Enter a folder path or select it with the button on the right"
            endAdornment={
              <InputAdornment position="end" style={{ height: 32 }}>
                <IconButton onClick={openDirectory}>
                  <FolderIcon />
                </IconButton>
              </InputAdornment>
            }
          />
          {/* {state.errorTextPath && (
            <FormHelperText>{i18n.t('core:invalidPath')}</FormHelperText>
          )} */}
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth={true} error={state.errorTextName}>
          <InputLabel htmlFor="path">
            {i18n.t('core:createLocationName')}
          </InputLabel>
          <Input
            required
            margin="dense"
            name="name"
            onChange={handleInputChange}
            value={state.name}
            data-tid="locationName"
            fullWidth={true}
          />
          {/* {state.errorTextName && (
          <FormHelperText>{i18n.t('core:invalidName')}</FormHelperText>
        )} */}
        </FormControl>
      </Grid>
      {state.showAdvancedMode && (
        <Grid item xs={12}>
          <FormControl fullWidth={true} error={state.errorTextId}>
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
              onChange={handleInputChange}
              value={state.newuuid}
            />
            {/* {state.errorTextId && (
            <FormHelperText>{i18n.t('core:invalidId')}</FormHelperText>
          )} */}
          </FormControl>
        </Grid>
      )}
    </Grid>
  );
};

export default LocalForm;
