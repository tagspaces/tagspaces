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

/**
 * Used for the import functionality with drag and drop from the
 * file manager or desktop of the operating system
 */

import DraggablePaper from '-/components/DraggablePaper';
import TsButton from '-/components/TsButton';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { useEntryExistDialogContext } from '-/components/dialogs/hooks/useEntryExistDialogContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { executePromisesInBatches } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import FileIcon from '@mui/icons-material/InsertDriveFileOutlined';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { extractFileName, joinPaths } from '@tagspaces/tagspaces-common/paths';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onClose: (clearSelection?: boolean) => void;
  selectedFiles: Array<TS.FileSystemEntry>;
  targetDir?: string;
  targetLocationId?: string;
}

function MoveOrCopyFilesDialog(props: Props) {
  const { open, onClose, selectedFiles, targetLocationId } = props;
  const { t } = useTranslation();

  const theme = useTheme();

  const { handleEntryExist } = useEntryExistDialogContext();
  const { setReflectMetaActions } = useEditedEntryMetaContext();
  const { findLocation } = useCurrentLocationContext();
  const { moveFiles, copyFiles } = useIOActionsContext();
  const { currentDirectoryPath, sendDirMessage } = useDirectoryContentContext();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const targetDir = props.targetDir ? props.targetDir : currentDirectoryPath;
  const targetLocation = findLocation(targetLocationId);

  function generateThumbs(filePaths: string[]) {
    const promises: Promise<TS.EditMetaAction>[] = filePaths.map((filePath) =>
      targetLocation.getPropertiesPromise(filePath).then((entry) => ({
        action: 'thumbGenerate',
        entry: entry,
      })),
    );
    executePromisesInBatches(promises).then((actions) => {
      setReflectMetaActions(...actions);
    });
  }

  function handleMove(filePaths: string[]) {
    moveFiles(
      filePaths,
      targetDir,
      targetLocation.uuid,
      undefined,
      true,
      true,
    ).then((success) => {
      if (success) {
        sendDirMessage('moveFiles', filePaths);
        generateThumbs(
          filePaths.map((targetPath) =>
            joinPaths(
              targetLocation?.getDirSeparator(),
              targetDir,
              extractFileName(targetPath, targetLocation?.getDirSeparator()),
            ),
          ),
        );
      }
      return true;
    });
  }

  function handleCopy(filePaths: string[]) {
    copyFiles(filePaths, targetDir, targetLocation.uuid).then((success) => {
      if (success) {
        generateThumbs(
          filePaths.map((targetPath) =>
            joinPaths(
              targetLocation?.getDirSeparator(),
              targetDir,
              extractFileName(targetPath, targetLocation?.getDirSeparator()),
            ),
          ),
        );
      }
      return true;
    });
  }

  return (
    <Dialog
      open={open && selectedFiles && selectedFiles.length > 0}
      onClose={onClose}
      keepMounted
      scroll="paper"
      aria-labelledby="draggable-dialog-title"
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      fullScreen={smallScreen}
    >
      <TsDialogTitle
        dialogTitle={t('core:copyMoveEntriesTitle')}
        closeButtonTestId="closeMoveOrCopyTID"
        onClose={onClose}
      />
      <DialogContent
        style={{
          overflowX: 'hidden',
          overflowY: 'auto',
        }}
      >
        <Typography variant="subtitle2">
          {t('core:moveCopyToPath') + ': ' + targetDir}
        </Typography>
        <Typography variant="subtitle2">{t('selectedFiles')}</Typography>
        <List dense sx={{ width: '550px', marginLeft: '-15px' }}>
          {selectedFiles &&
            selectedFiles.length > 0 &&
            selectedFiles.map((file) => (
              <ListItem title={file.path} key={file.path}>
                <ListItemIcon>
                  <FileIcon />
                </ListItemIcon>
                <Typography variant="inherit" noWrap>
                  {file.name}
                </Typography>
              </ListItem>
            ))}
        </List>
      </DialogContent>
      <TsDialogActions>
        <TsButton data-tid="closeMoveOrCopyDialog" onClick={() => onClose()}>
          {t('core:cancel')}
        </TsButton>
        <TsButton
          onClick={() => {
            if (selectedFiles) {
              const confirmOverride = () => {
                handleMove(selectedFiles.map((file) => file.path));
              };
              handleEntryExist(
                selectedFiles,
                targetDir,
                targetLocationId,
                confirmOverride,
              );
            }
            onClose();
          }}
          data-tid="confirmMoveFilesTID"
          variant="contained"
        >
          {t('core:moveEntriesButton')}
        </TsButton>
        <TsButton
          onClick={() => {
            if (selectedFiles) {
              const confirmOverride = () => {
                handleCopy(selectedFiles.map((file) => file.path));
              };
              handleEntryExist(
                selectedFiles,
                targetDir,
                targetLocationId,
                confirmOverride,
              );
            }
            onClose();
          }}
          data-tid="confirmCopyFilesTID"
          variant="contained"
        >
          {t('core:copyEntriesButton')}
        </TsButton>
      </TsDialogActions>
    </Dialog>
  );
}

export default MoveOrCopyFilesDialog;
