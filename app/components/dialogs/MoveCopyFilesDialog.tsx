import React, { useState, useRef, useReducer, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formatBytes } from '@tagspaces/tagspaces-common/misc';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
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
import PlatformIO from '-/services/platform-facade';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';
import DirectoryListView from '-/components/DirectoryListView';
import AppConfig from '-/AppConfig';
import Tooltip from '-/components/Tooltip';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import {
  checkDirsExistPromise,
  checkFilesExistPromise,
} from '-/services/utils-io';
import { useTranslation } from 'react-i18next';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';

interface Props {
  open: boolean;
  onClose: (clearSelection?: boolean) => void;
  // force to move/copy different entries from selected
  entries?: Array<TS.FileSystemEntry>;
}

function MoveCopyFilesDialog(props: Props) {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { currentDirectoryPath } = useDirectoryContentContext();
  const { copyFiles, copyDirs, moveFiles, moveDirs } = useIOActionsContext();
  const { selectedEntries } = useSelectedEntriesContext();

  const [targetPath, setTargetPath] = useState(
    currentDirectoryPath ? currentDirectoryPath : '',
  );
  const isCopy = useRef<boolean>(true);
  const [entriesExistPath, setEntriesExistPath] = useState<string[]>(undefined);
  const dirProp = useRef({});

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);
  const { open, entries, onClose } = props;

  let allEntries = entries && entries.length > 0 ? entries : selectedEntries;

  const selectedFiles = allEntries
    ? allEntries
        .filter((fsEntry) => fsEntry.isFile)
        .map((fsentry) => fsentry.path)
    : [];

  const selectedDirs = allEntries
    ? allEntries
        .filter((fsEntry) => !fsEntry.isFile)
        .map((fsentry) => fsentry.path)
    : [];

  useEffect(() => {
    // getDirProperties have Electron impl only
    if (
      selectedDirs.length > 0 &&
      AppConfig.isElectron &&
      !PlatformIO.haveObjectStoreSupport() &&
      !PlatformIO.haveWebDavSupport()
    ) {
      const promises = selectedDirs.map((dirPath) => {
        try {
          return PlatformIO.getDirProperties(dirPath).then((prop) => {
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

  /*useEffect(() => {
    handleValidation();
  }, [targetPath]);*/

  /*function handleValidation() {
    if (targetPath && targetPath.length > 0) {
      setDisableConfirmButton(false);
    } else {
      setDisableConfirmButton(true);
    }
  }*/

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

  function handleCopyMove(copy = true) {
    if (selectedFiles.length > 0) {
      checkFilesExistPromise(selectedFiles, targetPath).then((exist) =>
        handleEntryExist(copy, exist),
      );
    }
    if (selectedDirs.length > 0) {
      checkDirsExistPromise(selectedDirs, targetPath).then((exist) =>
        handleEntryExist(copy, exist),
      );
    }
  }

  function handleEntryExist(copy: boolean, exist: string[]) {
    if (exist && exist.length > 0) {
      isCopy.current = copy;
      setEntriesExistPath(exist);
    } else if (copy) {
      handleCopyFiles();
    } else {
      handleMoveFiles();
    }
  }

  function handleCopyFiles() {
    dispatch(AppActions.resetProgress());
    dispatch(AppActions.toggleUploadDialog('copyEntriesTitle'));
    if (selectedFiles.length > 0) {
      copyFiles(selectedFiles, targetPath, onUploadProgress);
      setTargetPath('');
    }
    if (selectedDirs.length > 0) {
      copyDirs(getEntriesCount(selectedDirs), targetPath, onUploadProgress);
    }
    onClose(true);
  }

  const onUploadProgress = (progress, abort, fileName) => {
    dispatch(AppActions.onUploadProgress(progress, abort, fileName));
  };

  function handleMoveFiles() {
    if (selectedFiles.length > 0) {
      moveFiles(selectedFiles, targetPath);
      setTargetPath('');
    }
    if (selectedDirs.length > 0) {
      dispatch(AppActions.resetProgress());
      dispatch(AppActions.toggleUploadDialog('moveEntriesTitle'));
      moveDirs(getEntriesCount(selectedDirs), targetPath, onUploadProgress);
    }
    onClose(true);
  }

  /*function selectDirectory() {
    PlatformIO.selectDirectoryDialog()
      .then(selectedPaths => {
        setTargetPath(selectedPaths[0]);
        return true;
      })
      .catch(err => {
        console.log('selectDirectoryDialog failed with: ' + err);
      });
  }*/

  function formatFileExist(entries) {
    if (entries !== undefined) {
      return entries.join(', ');
    }
    return '';
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
            marginLeft: -15,
            marginBottom: 20,
          }}
        >
          {allEntries.length > 0 &&
            allEntries.map((entry) => (
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
        {targetPath ? (
          <Typography variant="subtitle2">
            {t('moveCopyToPath') + ': ' + targetPath}
          </Typography>
        ) : (
          <Typography variant="subtitle2">
            {t('chooseTargetLocationAndPath')}
          </Typography>
        )}
        <DirectoryListView
          setTargetDir={setTargetPath}
          currentDirectoryPath={currentDirectoryPath}
        />
      </DialogContent>
      <DialogActions
        style={fullScreen ? { padding: '10px 30px 30px 30px' } : {}}
      >
        <Button data-tid="closeMoveCopyDialog" onClick={() => onClose()}>
          {t('core:cancel')}
        </Button>
        <Tooltip
          title={t(AppConfig.isAndroid ? 'core:platformImplMissing' : '')}
        >
          <Button
            data-tid="confirmMoveFiles"
            disabled={
              !targetPath ||
              AppConfig.isAndroid ||
              targetPath === currentDirectoryPath
            }
            onClick={() => handleCopyMove(false)}
            color="primary"
            variant="contained"
          >
            {t('core:moveEntriesButton')}
          </Button>
        </Tooltip>
        <ConfirmDialog
          open={entriesExistPath !== undefined}
          onClose={() => {
            setEntriesExistPath(undefined);
          }}
          title={t('core:confirm')}
          content={
            formatFileExist(entriesExistPath) +
            ' exist do you want to override it?'
          }
          confirmCallback={(result) => {
            if (result) {
              if (isCopy.current) {
                handleCopyFiles();
              } else {
                handleMoveFiles();
              }
            } else {
              setEntriesExistPath(undefined);
            }
          }}
          cancelDialogTID="cancelOverwriteByCopyMoveDialog"
          confirmDialogTID="confirmOverwriteByCopyMoveDialog"
          confirmDialogContentTID="confirmDialogContent"
        />
        <Button
          onClick={() => handleCopyMove(true)}
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
