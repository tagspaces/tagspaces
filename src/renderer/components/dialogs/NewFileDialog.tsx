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

import React, { useRef } from 'react';
import {
  locationType,
  formatDateTime4Tag,
} from '@tagspaces/tagspaces-common/misc';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Paper from '@mui/material/Paper';
import DraggablePaper from '-/components/DraggablePaper';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CreateFile from '-/components/dialogs/components/CreateFile';
import TargetPath from '-/components/dialogs/components/TargetPath';
import { TargetPathContextProvider } from '-/components/dialogs/hooks/TargetPathContextProvider';
import { useTranslation } from 'react-i18next';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useTargetPathContext } from '-/components/dialogs/hooks/useTargetPathContext';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import AppConfig from '-/AppConfig';
import versionMeta from '-/version.json';

interface Props {
  open: boolean;
  onClose: (event?: Object, reason?: string) => void;
  fileType?: 'txt' | 'md' | 'html';
}

function NewFileDialog(props: Props) {
  const { open, onClose, fileType } = props;
  const { t } = useTranslation();
  const { createFileAdvanced } = useOpenedEntryContext();
  const { currentLocation, openLocation, getFirstRWLocation } =
    useCurrentLocationContext();
  const { currentDirectoryPath } = useDirectoryContentContext();
  const { targetDirectoryPath } = useTargetPathContext();

  const firstRWLocation = getFirstRWLocation();

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const fileName = useRef<string>(
    'note' +
      AppConfig.beginTagContainer +
      formatDateTime4Tag(new Date(), true) +
      AppConfig.endTagContainer,
  );

  const fileContent = useRef<string>(
    fileType !== 'html'
      ? 'Created in ' +
          versionMeta.name +
          ' on ' +
          new Date().toISOString().substring(0, 10) +
          '.'
      : '',
  );

  function getFileType() {
    if (fileType === 'txt') {
      return t('createTXTFile');
    }
    if (fileType === 'md') {
      return t('createMarkdown');
    }
    if (fileType === 'html') {
      return t('createRichTextFile');
    }
    return '...';
  }

  function loadLocation() {
    const isCloudLocation =
      currentLocation && currentLocation.type === locationType.TYPE_CLOUD;
    // no currentDirectoryPath in root cloud location
    if (!isCloudLocation && !currentDirectoryPath && firstRWLocation) {
      openLocation(firstRWLocation);
    }
  }

  function createFile(fileType, targetPath) {
    if (targetPath) {
      loadLocation();
      createFileAdvanced(
        targetPath,
        fileName.current,
        fileContent.current,
        fileType,
      );
      onClose();
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      keepMounted
      aria-labelledby="draggable-dialog-title"
      PaperComponent={fullScreen ? Paper : DraggablePaper}
      scroll="paper"
    >
      <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
        {t('core:create') + ' ' + getFileType()}
        <DialogCloseButton testId="closeCreateDialogTID" onClose={onClose} />
      </DialogTitle>
      <DialogContent
        style={{
          minWidth: 200,
          minHeight: 200,
          marginBottom: 20,
          overflow: 'overlay',
        }}
        data-tid="newFileDialog"
      >
        <CreateFile
          fileType={fileType}
          createFile={(type) => createFile(type, targetDirectoryPath)}
          handleFileNameChange={(name) => (fileName.current = name)}
          handleFileContentChange={(content) => (fileContent.current = content)}
          fileContent={fileContent.current}
          fileName={fileName.current}
        />
        <TargetPath />
      </DialogContent>
      {fileType && (
        <DialogActions
          style={fullScreen ? { padding: '10px 30px 30px 30px' } : {}}
        >
          <Button
            data-tid="backTID"
            title={t('core:cancel')}
            onClick={() => {
              onClose();
            }}
            color="primary"
          >
            {t('core:cancel')}
          </Button>
          <Button
            data-tid="createTID"
            title={t('core:create')}
            onClick={() => {
              createFile(fileType, targetDirectoryPath);
            }}
            color="primary"
          >
            {t('core:save')}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

export default NewFileDialog;
