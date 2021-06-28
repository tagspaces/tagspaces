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

import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FolderIcon from '@material-ui/icons/FolderOpen';
import FormHelperText from '@material-ui/core/FormHelperText';
import i18n from '-/services/i18n';
import PlatformIO from '-/services/platform-io';
import useValidation from '-/utils/useValidation';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';

const styles: any = theme => ({
  root: {
    display: 'flex'
  },
  formControl: {
    margin: theme.spacing(3)
  },
  group: {
    margin: theme.spacing(1, 0),
    display: 'flex',
    flexDirection: 'row'
  }
});

interface Props {
  locationPath: string;
  open: boolean;
  onClose: () => void;
  ignorePatternPaths: Array<string>;
  setIgnorePatternPaths: (pattern: Array<string>) => void;
}

const CreateEditLocationDialog = (props: Props) => {
  const { setError, haveError } = useValidation();
  const [selectedDirectoryPath, setSelectedDirectoryPath] = useState<string>(
    ''
  );

  const { open, onClose } = props;

  const onConfirm = () => {
    if (selectedDirectoryPath) {
      if (!props.ignorePatternPaths || props.ignorePatternPaths.length === 0) {
        props.setIgnorePatternPaths([selectedDirectoryPath]);
      } else if (
        props.ignorePatternPaths.indexOf(selectedDirectoryPath) === -1
      ) {
        props.setIgnorePatternPaths([
          ...props.ignorePatternPaths,
          selectedDirectoryPath
        ]);
      }
    }
    props.onClose();
  };

  const openFolderChooser = () => {
    PlatformIO.selectDirectoryDialog()
      .then(selectedPaths => {
        setSelectedDirectoryPath(
          selectedPaths[0].replace(props.locationPath, '**') + '/**'
        );
        if (selectedPaths[0].startsWith(props.locationPath)) {
          setError('pathNotInCurrentLocation', false);
        } else {
          setError('pathNotInCurrentLocation');
        }
        return true;
      })
      .catch(err => {
        console.log('selectDirectoryDialog failed with: ' + err);
      });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value } = target;

    setSelectedDirectoryPath(value);
    setError('pathNotInCurrentLocation', false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      scroll="paper"
      onKeyDown={event => {
        if (event.key === 'Enter' || event.keyCode === 13) {
          event.preventDefault();
          event.stopPropagation();
          onConfirm();
        } else if (event.key === 'Escape') {
          onClose();
        }
      }}
    >
      <DialogTitle>
        {i18n.t('core:ignorePatternDialogTitle')}{' '}
        <DialogCloseButton onClose={onClose} />
      </DialogTitle>
      <DialogContent>
        <FormControl
          fullWidth={true}
          error={haveError('pathNotInCurrentLocation')}
        >
          <InputLabel htmlFor="ignorePatternPath">
            {i18n.t('core:ignorePatternPath')}
          </InputLabel>
          <Input
            error={haveError('pathNotInCurrentLocation')}
            margin="dense"
            name="ignorePatternPath"
            placeholder={i18n.t('core:ignorePatternPlaceholder')}
            fullWidth={true}
            data-tid="ignorePatternPathTID"
            onChange={handleFileChange}
            value={selectedDirectoryPath}
            endAdornment={
              PlatformIO.haveObjectStoreSupport() ? (
                undefined
              ) : (
                <InputAdornment position="end" style={{ height: 32 }}>
                  <IconButton onClick={openFolderChooser}>
                    <FolderIcon />
                  </IconButton>
                </InputAdornment>
              )
            }
          />
          {haveError('pathNotInCurrentLocation') && (
            <FormHelperText>
              {i18n.t('core:pathNotInCurrentLocation')}
            </FormHelperText>
          )}
          <FormHelperText>
            {
              "Wildcards (**, *.js)\nNegation ('!a/*.js', '*!(b).js'])\nextglobs (+(x|y), !(a|b))\nPOSIX character classes ([[:alpha:][:digit:]])\nbrace expansion (foo/{1..5}.md, bar/{a,b,c}.js)\nregex character classes (foo-[1-5].js)\nregex logical \"or\" (foo/(abc|xyz).js)\nYou can mix and match these features to create whatever patterns you need!"
            }
          </FormHelperText>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>{i18n.t('core:cancel')}</Button>
        <Button
          disabled={selectedDirectoryPath.length === 0 || haveError()}
          onClick={onConfirm}
          data-tid="confirmLocationCreation"
          color="primary"
        >
          {i18n.t('core:ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withMobileDialog()(withStyles(styles)(CreateEditLocationDialog));
