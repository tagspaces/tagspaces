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

import React, { useState, useEffect, useRef, useReducer } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
  Dialog,
  DialogActions,
  FormControl,
  DialogContent,
  TextField,
  DialogTitle,
  Button,
  FormHelperText,
  IconButton,
  FormLabel,
  Box,
  InputAdornment,
  inputBaseClasses,
} from '@mui/material';
import SetBackgroundIcon from '@mui/icons-material/OpacityOutlined';
import { joinPaths } from '@tagspaces/tagspaces-common/paths';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { useTranslation } from 'react-i18next';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { TS } from '-/tagspaces.namespace';

const FolderColorTextField = styled(TextField)(({ theme }) => ({
  [`& .${inputBaseClasses.root}`]: {
    height: 100,
  },
}));

interface Props {
  open: boolean;
  onClose: () => void;
  selectedDirectoryPath?: string;
  callback?: (newDirPath: string) => void;
}

function CreateDirectoryDialog(props: Props) {
  const { t } = useTranslation();
  const { createDirectory, setBackgroundColorChange } = useIOActionsContext();
  const { currentLocation } = useCurrentLocationContext();
  const { currentDirectoryPath, getAllPropertiesPromise } =
    useDirectoryContentContext();
  const { showNotification } = useNotificationContext();

  const [inputError, setInputError] = useState(false);
  const isFirstRun = useRef(true);
  const backgroundColor = useRef<string>('transparent');
  const [disableConfirmButton, setDisableConfirmButton] = useState(true);
  const [name, setName] = useState('');

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const { open, onClose, selectedDirectoryPath } = props;

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    handleValidation();
  });

  const defaultBackgrounds = [
    'transparent',
    // '#00000044',
    '#ac725e44',
    '#f83a2244',
    // '#ff753744',
    '#ffad4644',
    '#42d69244',
    // '#00800044',
    '#7bd14844',
    '#fad16544',
    '#92e1c044',
    '#9fe1e744',
    '#9fc6e744',
    // '#4986e744',
    // '#9a9cff44',
    // '#c2c2c244',
    // '#cca6ac44',
    // '#f691b244',
    // '#cd74e644',
    // '#a47ae244',
    // '#845EC260',
    // '#D65DB160',
    // '#FF6F9160',
    // '#FF967160',
    // '#FFC75F60',
    // '#F9F87160',
    // '#008E9B60',
    // '#008F7A60',
  ];

  function handleValidation() {
    // const pathRegex = '^((\.\./|[a-zA-Z0-9_/\-\\])*\.[a-zA-Z0-9]+)$';
    // const nameRegex = '^[A-Z][-a-zA-Z]+$';
    if (name.length > 0) {
      setInputError(false);
      setDisableConfirmButton(false);
    } else {
      setInputError(true);
      setDisableConfirmButton(true);
    }
  }

  function onConfirm() {
    if (!disableConfirmButton && name) {
      const dirPath = joinPaths(
        currentLocation.getDirSeparator(),
        selectedDirectoryPath !== undefined
          ? selectedDirectoryPath
          : currentDirectoryPath,
        name,
      );
      currentLocation.checkDirExist(dirPath).then((exist) => {
        if (!exist) {
          createDirectory(dirPath).then(() => {
            if (props.callback) {
              props.callback(dirPath);
            }
            if (backgroundColor.current !== 'transparent') {
              getAllPropertiesPromise(dirPath).then(
                (fsEntry: TS.FileSystemEntry) =>
                  setBackgroundColorChange(fsEntry, backgroundColor.current),
              );
            }
          });
        } else {
          showNotification('Directory ' + dirPath + ' exist!');
        }
      });

      resetState();
      props.onClose();
    }
  }

  function onCancel() {
    resetState();
    onClose();
  }

  function resetState() {
    setName('');
    setInputError(false);
    setDisableConfirmButton(true);
  }

  // const theme = useTheme();
  // const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog
      open={open}
      onClose={onClose}
      // fullScreen={fullScreen}
      keepMounted
      scroll="paper"
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
          event.preventDefault();
          event.stopPropagation();
          onConfirm();
        } /*else if (event.key === 'Escape') {
          onClose();
        }*/
      }}
    >
      <DialogTitle>
        {t('core:createNewDirectoryTitle')}
        <DialogCloseButton testId="closeCreateDirectoryTID" onClose={onClose} />
      </DialogTitle>
      <DialogContent>
        <FormControl fullWidth={true} error={inputError}>
          <TextField
            fullWidth
            error={inputError}
            variant="filled"
            margin="dense"
            autoFocus
            name="name"
            label={t('core:folderName')}
            onChange={(event) => {
              const { target } = event;
              setName(target.value);
            }}
            value={name}
            data-tid="directoryName"
            id="directoryName"
          />
          {inputError && (
            <FormHelperText>{t('core:directoryNameHelp')}</FormHelperText>
          )}
        </FormControl>
        <FormControl>
          <FolderColorTextField
            data-tid="folderColorTID"
            margin="dense"
            variant="filled"
            size="medium"
            label={t('backgroundColor')}
            fullWidth={true}
            value={' '}
            style={{ height: 100 }}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  {defaultBackgrounds.map((background, cnt) => (
                    <>
                      <IconButton
                        key={cnt}
                        data-tid={'bgTID' + cnt}
                        aria-label="changeFolderBackground"
                        onClick={() => {
                          backgroundColor.current = background;
                          forceUpdate();
                        }}
                        style={{
                          backgroundColor: background,
                          backgroundImage: background,
                          margin: 5,
                          ...(backgroundColor.current === background && {
                            border: '0.5rem outset ' + background,
                          }),
                        }}
                      >
                        <SetBackgroundIcon />
                      </IconButton>
                    </>
                  ))}
                </InputAdornment>
              ),
            }}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button data-tid="closeCreateNewDirectory" onClick={onCancel}>
          {t('core:cancel')}
        </Button>
        <Button
          disabled={disableConfirmButton}
          onClick={onConfirm}
          variant="contained"
          data-tid="confirmCreateNewDirectory"
          id="confirmCreateNewDirectory"
          color="primary"
        >
          {t('core:ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateDirectoryDialog;
