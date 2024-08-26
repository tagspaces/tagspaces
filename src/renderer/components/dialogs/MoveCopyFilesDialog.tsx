import React, { useState, useRef, useReducer, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { formatBytes } from '@tagspaces/tagspaces-common/misc';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import { FolderIcon, FileIcon } from '-/components/CommonIcons';
import DraggablePaper from '-/components/DraggablePaper';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';
import DirectoryListView from '-/components/DirectoryListView';
import AppConfig from '-/AppConfig';
import { useTranslation } from 'react-i18next';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { getDirProperties } from '-/services/utils-io';
import { useFileUploadDialogContext } from '-/components/dialogs/hooks/useFileUploadDialogContext';
import { useEntryExistDialogContext } from '-/components/dialogs/hooks/useEntryExistDialogContext';

interface Props {
  open: boolean;
  onClose: (clearSelection?: boolean) => void;
  // force to move/copy different entries from selected
  entries?: Array<TS.FileSystemEntry>;
}

function MoveCopyFilesDialog(props: Props) {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { currentLocation } = useCurrentLocationContext();
  const { currentDirectoryPath } = useDirectoryContentContext();
  const { handleEntryExist, openEntryExistDialog } =
    useEntryExistDialogContext();
  const { copyFiles, copyDirs, moveFiles, moveDirs } = useIOActionsContext();
  const { selectedEntries } = useSelectedEntriesContext();
  const { openFileUploadDialog } = useFileUploadDialogContext();

  const [targetPath, setTargetPath] = useState(
    currentDirectoryPath ? currentDirectoryPath : '',
  );
  const dirProp = useRef({});

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const { open, entries, onClose } = props;

  const allEntries = useRef<TS.FileSystemEntry[]>(
    entries && entries.length > 0 ? entries : selectedEntries,
  );

  const selectedFiles = allEntries.current
    ? allEntries.current
        .filter((fsEntry) => fsEntry.isFile)
        .map((fsentry) => fsentry.path)
    : [];

  const selectedDirs = allEntries.current
    ? allEntries.current
        .filter((fsEntry) => !fsEntry.isFile)
        .map((fsentry) => fsentry.path)
    : [];

  useEffect(() => {
    allEntries.current =
      entries && entries.length > 0 ? entries : selectedEntries;
    // getDirProperties have Electron impl only
    if (
      selectedDirs.length > 0 &&
      AppConfig.isElectron &&
      !currentLocation.haveObjectStoreSupport() &&
      !currentLocation.haveWebDavSupport()
    ) {
      const promises = selectedDirs.map((dirPath) => {
        try {
          return getDirProperties(dirPath).then((prop) => {
            dirProp.current[dirPath] = prop;
            return true;
          });
        } catch (ex) {
          console.debug('getDirProperties:', ex);
        }
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
    /*let total = 0;
    const arr = Object.values(dirProp.current);
    arr.forEach((n: TS.DirProp) => (total += n.filesCount + n.dirsCount));
    return total;*/
  }

  function handleCopy() {
    dispatch(AppActions.resetProgress());
    openFileUploadDialog(undefined, 'copyEntriesTitle');
    if (selectedFiles.length > 0) {
      copyFiles(
        selectedFiles,
        targetPath,
        currentLocation.uuid,
        onUploadProgress,
      );
      setTargetPath('');
    }
    if (selectedDirs.length > 0) {
      copyDirs(
        getEntriesCount(selectedDirs),
        targetPath,
        currentLocation.uuid,
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
        currentLocation.uuid,
        onUploadProgress,
      );
      setTargetPath('');
    }
    if (selectedDirs.length > 0) {
      dispatch(AppActions.resetProgress());
      openFileUploadDialog(undefined, 'moveEntriesTitle');
      moveDirs(
        getEntriesCount(selectedDirs),
        targetPath,
        currentLocation.uuid,
        onUploadProgress,
      );
    }
    onClose(true);
  }

  function copyMove(copy: boolean) {
    handleEntryExist(allEntries.current, targetPath).then((exist) => {
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
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog
      open={open}
      onClose={() => onClose()}
      keepMounted
      scroll="paper"
      aria-labelledby="draggable-dialog-title"
      PaperComponent={fullScreen ? Paper : DraggablePaper}
      fullScreen={fullScreen}
    >
      <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
        {t('core:copyMoveEntriesTitle')}
        <DialogCloseButton testId="closeMCFilesTID" onClose={() => onClose()} />
      </DialogTitle>
      <DialogContent style={{ overflow: 'hidden' }}>
        <Typography variant="subtitle2">
          {t('selectedFilesAndFolders')}
        </Typography>
        <List
          dense
          style={{
            overflowY: 'auto',
            width: 550,
            maxHeight: 200,
          }}
        >
          {allEntries.current.length > 0 &&
            allEntries.current.map((entry) => (
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
          currentDirectoryPath={currentDirectoryPath}
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
      <DialogActions
        style={fullScreen ? { padding: '10px 30px 30px 30px' } : {}}
      >
        <Button data-tid="closeMoveCopyDialog" onClick={() => onClose()}>
          {t('core:cancel')}
        </Button>
        {(!AppConfig.isAndroid || selectedDirs.length === 0) && (
          <Button
            data-tid="confirmMoveFiles"
            disabled={
              !targetPath ||
              // AppConfig.isAndroid ||
              targetPath === currentDirectoryPath
            }
            onClick={() => copyMove(false)}
            color="primary"
            variant="contained"
          >
            {t('core:moveEntriesButton')}
          </Button>
        )}
        <Button
          onClick={() => copyMove(true)}
          data-tid="confirmCopyFiles"
          disabled={!targetPath || targetPath === currentDirectoryPath}
          color="primary"
          variant="contained"
        >
          {t('core:copyEntriesButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MoveCopyFilesDialog;
