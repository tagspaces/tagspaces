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

import React from 'react';
import TsButton from '-/components/TsButton';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TsTextField from '-/components/TsTextField';
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
import { TS } from '-/tagspaces.namespace';

interface Props {
  open: boolean;
  openedEntry: TS.OpenedEntry;
  onClose: () => void;
  saveAs: (newFilePath: string) => Promise<boolean>;
  override: () => Promise<boolean>;
}

function ResolveConflictDialog(props: Props) {
  const { open, onClose, openedEntry } = props;
  const { t } = useTranslation();
  const copyFileName = React.useRef<string>(getFileName());
  const [isSaveAs, setSaveAs] = React.useState<boolean>(false);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  function getFileName() {
    if (openedEntry) {
      const fileName = extractFileName(openedEntry.path);
      const ext = extractFileExtension(openedEntry.path);
      return fileName.slice(0, -(ext.length + 1)) + '-copy.' + ext;
    }
    return '';
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
          <TsTextField
            label={t('core:newFileName')}
            name="name"
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
      <TsDialogActions>
        {isSaveAs ? (
          <>
            <TsButton
              data-tid="backTID"
              title={t('core:cancel')}
              onClick={() => {
                setSaveAs(false);
                onClose();
              }}
            >
              {t('core:cancel')}
            </TsButton>
            <TsButton
              data-tid="saveTID"
              title={t('core:save')}
              onClick={() => {
                const dirPath = extractContainingDirectoryPath(
                  openedEntry.path,
                );
                const newFilePath =
                  (dirPath && dirPath !== '/' ? dirPath + '/' : '') +
                  copyFileName.current;
                props.saveAs(newFilePath).then(() => {
                  onClose();
                });
              }}
            >
              {t('core:save')}
            </TsButton>
          </>
        ) : (
          <>
            <TsButton
              data-tid="saveas"
              title={t('core:saveAs')}
              onClick={() => {
                setSaveAs(true);
              }}
            >
              {t('core:saveAs')}
            </TsButton>
            <TsButton
              data-tid="overrideTID"
              title={t('core:override')}
              onClick={() => {
                props.override().then(() => {
                  onClose();
                });
              }}
              variant="contained"
            >
              {t('core:override')}
            </TsButton>
          </>
        )}
      </TsDialogActions>
    </Dialog>
  );
}

export default ResolveConflictDialog;
