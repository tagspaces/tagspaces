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

import AppConfig from '-/AppConfig';
import DraggablePaper from '-/components/DraggablePaper';
import FileView from '-/components/FileView';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { getCurrentTheme } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { extractContainingDirectoryPath } from '@tagspaces/tagspaces-common/paths';
import { MutableRefObject, useRef } from 'react';
import { useSelector } from 'react-redux';

interface Props {
  open: boolean;
  onClose: () => void;
  fsEntry: TS.FileSystemEntry;
}

function FilePreviewDialog(props: Props) {
  const { open = false, onClose, fsEntry } = props;
  const { findLocation } = useCurrentLocationContext();
  const { openedEntry } = useOpenedEntryContext();
  const { isEditMode } = useFilePropertiesContext();
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const currentTheme = useSelector(getCurrentTheme);
  const fileViewer: MutableRefObject<HTMLIFrameElement> =
    useRef<HTMLIFrameElement>(null);
  const fileViewerContainer: MutableRefObject<HTMLDivElement> =
    useRef<HTMLDivElement>(null);

  const openedFile: TS.OpenedEntry =
    fsEntry && openedEntry
      ? {
          ...openedEntry,
          ...(fsEntry.uuid && { uuid: fsEntry.uuid }),
          path: fsEntry.path,
          isFile: fsEntry.isFile,
        }
      : undefined;

  const handleMessage = (data: any) => {
    if (!openedFile || !openedFile.path) {
      return;
    }
    switch (data.command) {
      case 'loadDefaultTextContent':
        getFileContent(data.preview ? data.preview : false).then((content) => {
          if (
            fileViewer &&
            fileViewer.current &&
            fileViewer.current.contentWindow &&
            // @ts-ignore
            fileViewer?.current?.contentWindow?.setContent
          ) {
            let fileDirectory = extractContainingDirectoryPath(openedFile.path);
            if (AppConfig.isWeb) {
              const webDir = extractContainingDirectoryPath(
                // eslint-disable-next-line no-restricted-globals
                location.href,
              );
              fileDirectory =
                (webDir && webDir !== '/' ? webDir + '/' : '') + fileDirectory;
            }
            // @ts-ignore call setContent from iframe
            fileViewer.current.contentWindow.setContent(
              content,
              fileDirectory,
              !isEditMode,
              theme.palette.mode,
            );
          }
        });
        break;
      case 'parentLoadTextContent':
        getFileContent(data.preview ? data.preview : false).then((content) => {
          fileViewer?.current?.contentWindow?.postMessage(
            {
              action: 'fileContent',
              content: content,
              isEditMode: isEditMode,
            },
            '*',
          );
        });
        break;
    }
  };

  function getFileContent(preview): Promise<string> {
    const openLocation = findLocation(openedFile.locationID);

    return openLocation
      ?.loadTextFilePromise(openedFile.path, preview)
      .then((content) => {
        // Check and remove UTF-8 BOM
        return content.startsWith('\uFEFF') ? content.slice(1) : content;
      })
      .catch((err) => {
        console.log('Error loading text content ' + err);
        return undefined;
      });
  }

  if (!fsEntry) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      scroll="paper"
      fullWidth
      maxWidth="md"
      fullScreen={smallScreen}
      aria-labelledby="draggable-dialog-title"
      PaperComponent={DraggablePaper}
      slotProps={{
        backdrop: { sx: { backgroundColor: 'transparent' } },
        paper: { sx: { width: '100%', height: '100%' } },
      }}
    >
      <TsDialogTitle
        dialogTitle="Preview"
        closeButtonTestId="closeFilePreviewTID"
        onClose={onClose}
      />
      <DialogContent
        sx={{
          overflowY: 'hidden',
          padding: '10px',
          flexGrow: 1,
        }}
        data-tid="filePreviewTID"
      >
        <Typography
          variant="body2"
          gutterBottom
          sx={{ wordBreak: 'break-all', marginLeft: '15px' }}
        >
          {fsEntry.path}
        </Typography>
        <FileView
          key="FileViewPreviewID"
          fileViewer={fileViewer}
          fileViewerContainer={fileViewerContainer}
          handleMessage={handleMessage}
        />
      </DialogContent>
    </Dialog>
  );
}

export default FilePreviewDialog;
