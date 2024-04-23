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
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import {
  extractContainingDirectoryPath,
  extractFileExtension,
  extractFileName,
} from '@tagspaces/tagspaces-common/paths';
import { useTranslation } from 'react-i18next';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';

interface Props {
  open: boolean;
  onClose: () => void;
  saveAs: (newFilePath: string) => Promise<boolean>;
  override: () => Promise<boolean>;
}

function ResolveConflictDialog(props: Props) {
  const { open, onClose } = props;
  const { t } = useTranslation();
  const { openedEntry } = useOpenedEntryContext();
  const copyFileName = React.useRef<string>(getFileName());
  const [isSaveAs, setSaveAs] = React.useState<boolean>(false);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  function getFileName() {
    const fileName = extractFileName(openedEntry.path);
    const ext = extractFileExtension(openedEntry.path);
    return fileName.slice(0, -(ext.length + 1)) + '-copy.' + ext;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      scroll="paper"
      aria-labelledby="draggable-dialog-title"
    >
      <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
        {t('core:resolveConflictTitle')}
        <DialogCloseButton testId="closeResolveConflictTID" onClose={onClose} />
      </DialogTitle>
      <DialogContent
        style={{
          overflow: 'auto',
          minWidth: 400,
        }}
      >
        {isSaveAs ? (
          <TextField
            label={t('core:newFileName')}
            margin="dense"
            name="name"
            fullWidth={true}
            data-tid="newFileNameTID"
            defaultValue={copyFileName.current}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              copyFileName.current = event.target.value;
            }}
          />
        ) : (
          t('core:resolveConflictDesc')
        )}
      </DialogContent>
      <DialogActions
        style={fullScreen ? { padding: '10px 30px 30px 30px' } : {}}
      >
        {isSaveAs ? (
          <>
            <Button
              data-tid="backTID"
              title={t('core:cancel')}
              onClick={() => {
                setSaveAs(false);
                onClose();
              }}
              color="primary"
            >
              {t('core:cancel')}
            </Button>
            <Button
              data-tid="saveTID"
              title={t('core:save')}
              onClick={() => {
                props
                  .saveAs(
                    extractContainingDirectoryPath(openedEntry.path) +
                      '/' +
                      copyFileName.current,
                  )
                  .then(() => {
                    onClose();
                  });
              }}
              color="primary"
            >
              {t('core:save')}
            </Button>
          </>
        ) : (
          <>
            <Button
              data-tid="saveas"
              title={t('core:saveAs')}
              onClick={() => {
                setSaveAs(true);
              }}
              color="primary"
            >
              {t('core:saveAs')}
            </Button>
            <Button
              data-tid="overrideTID"
              title={t('core:override')}
              onClick={() => {
                props.override().then(() => {
                  onClose();
                });
              }}
              color="primary"
              variant="contained"
            >
              {t('core:override')}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default ResolveConflictDialog;
