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

import DraggablePaper from '-/components/DraggablePaper';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import TsTextField from '-/components/TsTextField';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { dirNameValidation } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import SetBackgroundIcon from '@mui/icons-material/OpacityOutlined';
import {
  Box,
  Dialog,
  DialogContent,
  FormControl,
  FormHelperText,
  InputAdornment,
  Paper,
  inputBaseClasses,
  useMediaQuery,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { joinPaths } from '@tagspaces/tagspaces-common/paths';
import React, { useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const FolderColorTextField = styled(TsTextField)(({ theme }) => ({
  [`& .${inputBaseClasses.root}`]: {
    height: 200,
  },
}));

interface Props {
  open: boolean;
  onClose: () => void;
  selectedDirectoryPath?: string;
  skipSelection?: boolean;
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
  //const isFirstRun = useRef(true);
  const backgroundColor = useRef<string>('transparent');
  const [disableConfirmButton, setDisableConfirmButton] = useState(true);
  const [name, setName] = useState('');

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const { open, onClose, selectedDirectoryPath, skipSelection } = props;

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
    '#4986e744',
    '#9a9cff44',
    '#c2c2c244',
    '#cca6ac44',
    '#f691b244',
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

  function handleValidation(dirName) {
    if (!dirNameValidation(dirName)) {
      setInputError(false);
      setDisableConfirmButton(false);
    } else {
      setInputError(true);
      setDisableConfirmButton(true);
    }
  }

  function onConfirm() {
    handleValidation(name);
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
          createDirectory(
            dirPath,
            currentLocation.uuid,
            true,
            true,
            skipSelection,
          ).then(() => {
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

  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const okButton = (
    <TsButton
      disabled={disableConfirmButton}
      onClick={onConfirm}
      data-tid="confirmCreateNewDirectory"
      id="confirmCreateNewDirectory"
      variant="contained"
      sx={
        {
          WebkitAppRegion: 'no-drag',
        } as React.CSSProperties & { WebkitAppRegion?: string }
      }
    >
      {t('core:ok')}
    </TsButton>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={smallScreen}
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      keepMounted
      scroll="paper"
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          event.stopPropagation();
          onConfirm();
        } else if (event.key === 'Escape') {
          onClose();
        }
      }}
    >
      <TsDialogTitle
        dialogTitle={t('core:createNewDirectoryTitle')}
        closeButtonTestId="closeCreateDirectoryTID"
        onClose={onClose}
        actionSlot={okButton}
      />
      <DialogContent>
        <FormControl fullWidth error={inputError}>
          <TsTextField
            error={inputError}
            autoFocus
            fullWidth
            name="name"
            label={t('core:folderName')}
            onChange={(event) => {
              const { target } = event;
              handleValidation(target.value);
              setName(target.value);
            }}
            updateValue={(value) => {
              setName(value);
            }}
            retrieveValue={() => name}
            value={name}
            data-tid="directoryName"
            id="directoryName"
          />
          {inputError && (
            <FormHelperText>{t('core:directoryNameHelp')}</FormHelperText>
          )}
        </FormControl>
        <FormControl fullWidth>
          <FolderColorTextField
            data-tid="folderColorTID"
            label={t('backgroundColor')}
            retrieveValue={() => backgroundColor.current}
            value={' '}
            sx={{ marginTop: 0 }}
            slotProps={{
              input: {
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end" sx={{ height: '300px' }}>
                    <Box sx={{ padding: '10px', width: '300px' }}>
                      {defaultBackgrounds.map((background, cnt) => (
                        <React.Fragment key={cnt}>
                          <TsIconButton
                            tooltip={background}
                            data-tid={'bgTID' + cnt}
                            aria-label="changeFolderBackground"
                            onClick={() => {
                              backgroundColor.current = background;
                              forceUpdate();
                            }}
                            sx={{
                              backgroundColor: background,
                              backgroundImage: background,
                              margin: '5px',
                              ...(backgroundColor.current === background && {
                                border: '0.5rem outset ' + background,
                              }),
                            }}
                          >
                            <SetBackgroundIcon />
                          </TsIconButton>
                          {(cnt + 1) % 5 === 0 && <br />}
                        </React.Fragment>
                      ))}
                    </Box>
                  </InputAdornment>
                ),
              },
            }}
          />
        </FormControl>
      </DialogContent>
      {!smallScreen && (
        <TsDialogActions>
          <TsButton data-tid="closeCreateNewDirectory" onClick={onCancel}>
            {t('core:cancel')}
          </TsButton>
          {okButton}
        </TsDialogActions>
      )}
    </Dialog>
  );
}

export default CreateDirectoryDialog;
