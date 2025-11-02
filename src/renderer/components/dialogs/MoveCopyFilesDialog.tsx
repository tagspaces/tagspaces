import AppConfig from '-/AppConfig';
import { FileIcon, FolderIcon } from '-/components/CommonIcons';
import DirectoryListView from '-/components/DirectoryListView';
import DraggablePaper from '-/components/DraggablePaper';
import TsButton from '-/components/TsButton';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { useEntryExistDialogContext } from '-/components/dialogs/hooks/useEntryExistDialogContext';
import { useFileUploadDialogContext } from '-/components/dialogs/hooks/useFileUploadDialogContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import { getDirProperties } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { formatBytes } from '@tagspaces/tagspaces-common/misc';
import { useEffect, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

interface Props {
  open: boolean;
  onClose: (clearSelection?: boolean) => void;
  // force to move/copy different entries from selected
  entries: TS.FileSystemEntry[];
  targetDir?: string;
  targetLocationId?: string;
}

function MoveCopyFilesDialog(props: Props) {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { open, entries, onClose, targetDir, targetLocationId } = props;
  const { findLocation } = useCurrentLocationContext();
  const { currentDirectoryPath } = useDirectoryContentContext();
  const { handleEntryExist, openEntryExistDialog } =
    useEntryExistDialogContext();
  const { copyFiles, copyDirs, moveFiles, moveDirs } = useIOActionsContext();
  const { openFileUploadDialog } = useFileUploadDialogContext();
  const { selectedEntries } = useSelectedEntriesContext();
  const currentEntries = entries || selectedEntries;

  const [targetPath, setTargetPath] = useState(
    targetDir ? targetDir : currentDirectoryPath,
  );
  const dirProp = useRef({});

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  const currentLocation = findLocation();
  const targetLocation = findLocation(targetLocationId);

  const selectedFiles = currentEntries
    ? currentEntries
        .filter((fsEntry) => fsEntry.isFile)
        .map((fsentry) => fsentry.path)
    : [];

  const selectedDirs = currentEntries
    ? currentEntries
        .filter((fsEntry) => !fsEntry.isFile)
        .map((fsentry) => fsentry.path)
    : [];

  useEffect(() => {
    // getDirProperties have Electron impl only
    if (
      selectedDirs.length > 0 &&
      AppConfig.isElectron &&
      currentLocation &&
      !currentLocation.haveObjectStoreSupport() &&
      !currentLocation.haveWebDavSupport()
    ) {
      const promises = selectedDirs.map((dirPath) => {
        return getDirProperties(dirPath)
          .then((prop) => {
            dirProp.current[dirPath] = prop;
            return true;
          })
          .catch((ex) => {
            console.debug('getDirProperties:', ex);
          });
      });
      Promise.all(promises).then(() => forceUpdate());
    }
  }, []);

  function getEntriesCount(dirPaths): Array<any> {
    return dirPaths.map((path) => {
      const currDirProp = dirProp.current[path];
      let count = 0;
      if (currDirProp) {
        count = currDirProp.filesCount + currDirProp.dirsCount;
      }
      return { path, count };
    });
  }

  function handleCopy() {
    dispatch(AppActions.resetProgress());
    openFileUploadDialog(targetDir, 'copyEntriesTitle'); //selectedFiles.length > 0);
    if (selectedFiles.length > 0) {
      //todo use uploadFilesAPI && transferMeta = true
      copyFiles(
        selectedFiles,
        targetPath,
        targetLocation.uuid,
        onUploadProgress,
      );
      setTargetPath('');
    }
    if (selectedDirs.length > 0) {
      copyDirs(
        getEntriesCount(selectedDirs),
        targetPath,
        targetLocation.uuid,
        onUploadProgress,
      );
    }
    onClose(true);
  }

  const onUploadProgress = (progress, abort, fileName) => {
    dispatch(AppActions.onUploadProgress(progress, abort, fileName));
  };

  function handleMove() {
    if (selectedFiles.length > 0) {
      moveFiles(
        selectedFiles,
        targetPath,
        targetLocation.uuid,
        onUploadProgress,
        true,
        true,
      );
      setTargetPath('');
    }
    if (selectedDirs.length > 0) {
      dispatch(AppActions.resetProgress());
      openFileUploadDialog(undefined, 'moveEntriesTitle');
      moveDirs(
        getEntriesCount(selectedDirs),
        targetPath,
        targetLocation.uuid,
        onUploadProgress,
      );
    }
    onClose(true);
  }

  function copyMove(copy: boolean) {
    handleEntryExist(currentEntries, targetPath).then((exist) => {
      if (exist) {
        openEntryExistDialog(exist, () => {
          if (copy) {
            handleCopy();
          } else {
            handleMove();
          }
        });
      } else {
        if (copy) {
          handleCopy();
        } else {
          handleMove();
        }
      }
    });
  }

  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog
      open={open}
      onClose={() => onClose()}
      keepMounted
      scroll="paper"
      aria-labelledby="draggable-dialog-title"
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      fullScreen={smallScreen}
    >
      <TsDialogTitle
        dialogTitle={t('core:copyMoveEntriesTitle')}
        closeButtonTestId="closeMCFilesTID"
        onClose={onClose}
      />
      <DialogContent style={{ overflow: 'hidden' }}>
        <Typography variant="subtitle2">
          {t('selectedFilesAndFolders')}
        </Typography>
        <List
          dense
          sx={{
            overflowY: 'auto',
            width: '550px',
            maxHeight: '200px',
          }}
        >
          {currentEntries.length > 0 &&
            currentEntries.map((entry) => (
              <ListItem title={entry.path} key={entry.path}>
                <ListItemIcon>
                  {entry.isFile ? <FileIcon /> : <FolderIcon />}
                </ListItemIcon>
                <Typography variant="subtitle2" noWrap>
                  {entry.name}
                  {dirProp.current[entry.path] &&
                    ' (' +
                      t('fileSize') +
                      ': ' +
                      formatBytes(dirProp.current[entry.path]['totalSize']) +
                      ')'}
                </Typography>
              </ListItem>
            ))}
        </List>
        <DirectoryListView
          setTargetDir={setTargetPath}
          targetPath={targetPath}
          targetLocationID={targetLocation?.uuid}
        />
        <Box style={{ marginTop: 10 }}>
          {targetPath ? (
            <Typography variant="subtitle2">
              {t('moveCopyToPath') + ': ' + targetPath}
            </Typography>
          ) : (
            <Typography variant="subtitle2">
              {t('chooseTargetLocationAndPath')}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <TsDialogActions>
        <TsButton data-tid="closeMoveCopyDialog" onClick={() => onClose()}>
          {t('core:cancel')}
        </TsButton>
        {(!AppConfig.isAndroid || selectedDirs.length === 0) && (
          <TsButton
            data-tid="confirmMoveFiles"
            disabled={
              !targetPath ||
              // AppConfig.isAndroid ||
              targetPath === currentDirectoryPath
            }
            onClick={() => copyMove(false)}
            variant="contained"
          >
            {t('core:moveEntriesButton')}
          </TsButton>
        )}
        <TsButton
          onClick={() => copyMove(true)}
          data-tid="confirmCopyFiles"
          disabled={!targetPath || targetPath === currentDirectoryPath}
          variant="contained"
        >
          {t('core:copyEntriesButton')}
        </TsButton>
      </TsDialogActions>
    </Dialog>
  );
}

export default MoveCopyFilesDialog;
