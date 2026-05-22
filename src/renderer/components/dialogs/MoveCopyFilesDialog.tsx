import AppConfig from '-/AppConfig';
import { CheckIcon, FolderIcon, WarningIcon } from '-/components/CommonIcons';
import DraggablePaper from '-/components/DraggablePaper';
import { FolderBrowser } from '-/components/FolderBrowser';
import TsButton from '-/components/TsButton';
import TsToggleButton from '-/components/TsToggleButton';
import TsTooltip from '-/components/TsTooltip';
import SelectedItemsSummary from '-/components/dialogs/components/SelectedItemsSummary';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import {
  computeMoveCopyValidity,
  getValidityMessageKey,
} from '-/components/dialogs/components/computeMoveCopyValidity';
import { useCreateDirectoryDialogContext } from '-/components/dialogs/hooks/useCreateDirectoryDialogContext';
import { useCreateEditLocationDialogContext } from '-/components/dialogs/hooks/useCreateEditLocationDialogContext';
import { useEntryExistDialogContext } from '-/components/dialogs/hooks/useEntryExistDialogContext';
import { useFileUploadDialogContext } from '-/components/dialogs/hooks/useFileUploadDialogContext';
import { useRecentDestinationsContext } from '-/hooks/RecentDestinationsContextProvider';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import {
  actions as SettingsActions,
  getLastMoveCopyMode,
} from '-/reducers/settings';
import {
  executePromisesInBatches,
  getDirProperties,
} from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { extractFileName, joinPaths } from '@tagspaces/tagspaces-common/paths';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

interface Props {
  open: boolean;
  onClose: (clearSelection?: boolean) => void;
  // force to move/copy different entries from selected
  entries: TS.FileSystemEntry[];
  targetDir?: string;
  targetLocationId?: string;
  // when true the target-directory picker is hidden and post-op
  // thumb-generation + sendDirMessage are triggered (drag-drop import path)
  skipTargetPicker?: boolean;
}

function MoveCopyFilesDialog(props: Props) {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const {
    open,
    entries,
    onClose,
    targetDir,
    targetLocationId,
    skipTargetPicker,
  } = props;
  const { findLocation, locations } = useCurrentLocationContext();
  const { currentDirectoryPath, sendDirMessage } = useDirectoryContentContext();
  const { handleEntryExist, openEntryExistDialog } =
    useEntryExistDialogContext();
  const { copyFiles, copyDirs, moveFiles, moveDirs } = useIOActionsContext();
  const { openFileUploadDialog } = useFileUploadDialogContext();
  const { openCreateDirectoryDialog } = useCreateDirectoryDialogContext();
  const { openCreateEditLocationDialog } = useCreateEditLocationDialogContext();
  const { setReflectMetaActions } = useEditedEntryMetaContext();
  const { selectedEntries } = useSelectedEntriesContext();
  const { recents, pushRecent, removeRecent } = useRecentDestinationsContext();
  const { showNotification } = useNotificationContext();
  const lastMoveCopyMode = useSelector(getLastMoveCopyMode);
  const currentEntries = entries || selectedEntries;

  const [targetPath, setTargetPath] = useState(
    targetDir ? targetDir : currentDirectoryPath,
  );
  const dirProp = useRef({});

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  const sourceLocation = findLocation();
  const [activeTargetLocationId, setActiveTargetLocationId] = useState<
    string | undefined
  >(targetLocationId || sourceLocation?.uuid);
  const targetLocation = findLocation(activeTargetLocationId);
  // Kept as `currentLocation` for the existing dir-size effect below — same behavior.
  const currentLocation = sourceLocation;

  // WebDAV is deprecated and not considered; only S3 counts as cloud here.
  const isCloudLoc = (
    loc?: { haveObjectStoreSupport: () => boolean } | undefined,
  ) => !!loc && loc.haveObjectStoreSupport();
  const sourceIsCloud = isCloudLoc(sourceLocation);
  const disabledLocationIds = useMemo(() => {
    if (sourceIsCloud) {
      // When source is cloud, lock the picker to the source location.
      return locations
        .filter((l) => l.uuid !== sourceLocation?.uuid)
        .map((l) => l.uuid);
    }
    // When source is local, all cloud locations are disabled (cross-location to cloud unsupported).
    return locations.filter((l) => isCloudLoc(l)).map((l) => l.uuid);
  }, [locations, sourceIsCloud, sourceLocation?.uuid]);

  // Phase 7 will use `searchQuery` to hide the Recent destinations row while typing.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchQuery, setSearchQuery] = useState('');
  // Bumped after creating a subfolder via the picker so FolderList re-fetches
  // and the new folder appears in the current path's list (instead of silently
  // navigating into it, which would hide MoveTarget<name> from the picker).
  const [dirVersion, setDirVersion] = useState(0);

  function handlePickLocation(loc: any) {
    setActiveTargetLocationId(loc.uuid);
    setTargetPath(loc.path || '');
  }

  // Filter recents to those that match a currently-known location (so deleted
  // locations don't show stale chips). v1 also gates on the source location to
  // sidestep cross-location issues — recents from other locations are hidden.
  const visibleRecents = useMemo(() => {
    if (!sourceLocation) return [];
    return recents.filter(
      (r) =>
        r.locationId === sourceLocation.uuid &&
        !!locations.find((l) => l.uuid === r.locationId),
    );
  }, [recents, locations, sourceLocation?.uuid]);

  async function handleClickRecent(recent: {
    path: string;
    locationId: string;
  }) {
    const loc = findLocation(recent.locationId);
    if (!loc) {
      removeRecent(recent.locationId, recent.path);
      return;
    }
    try {
      // Validate the path still exists before jumping there.
      await loc.getPropertiesPromise(recent.path);
      setActiveTargetLocationId(loc.uuid);
      setTargetPath(recent.path);
    } catch (err) {
      removeRecent(recent.locationId, recent.path);
      showNotification(t('core:recentDestinationGone'), 'warning', true);
    }
  }

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

  // Android can't move directories; if the selection includes dirs, force copy mode.
  const moveDisallowed = AppConfig.isAndroid && selectedDirs.length > 0;
  const [mode, setModeState] = useState<'move' | 'copy'>(
    moveDisallowed ? 'copy' : lastMoveCopyMode,
  );
  const setMode = (next: 'move' | 'copy') => {
    setModeState(next);
    dispatch(SettingsActions.setLastMoveCopyMode(next));
  };
  const itemCount = currentEntries ? currentEntries.length : 0;

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

  function recordRecentDestination() {
    if (skipTargetPicker || !targetLocation || !targetPath) {
      return;
    }
    const sep = targetLocation.getDirSeparator?.() || '/';
    const leaf = extractFileName(targetPath, sep) || targetLocation.name;
    pushRecent({
      path: targetPath,
      locationId: targetLocation.uuid,
      label: leaf,
    });
  }

  function generateThumbsForTransferred(sourceFilePaths: string[]) {
    if (!targetLocation) {
      return;
    }
    const sep = targetLocation.getDirSeparator();
    const promises: Promise<TS.EditMetaAction>[] = sourceFilePaths.map(
      (filePath) =>
        targetLocation
          .getPropertiesPromise(
            joinPaths(sep, targetPath, extractFileName(filePath, sep)),
          )
          .then((entry) => ({ action: 'thumbGenerate', entry })),
    );
    executePromisesInBatches(promises).then((actions) => {
      setReflectMetaActions(...actions);
    });
  }

  function handleCopy() {
    if (!skipTargetPicker) {
      dispatch(AppActions.resetProgress());
      openFileUploadDialog(targetDir, 'copyEntriesTitle');
    }
    if (selectedFiles.length > 0) {
      //todo use uploadFilesAPI && transferMeta = true
      const filePaths = selectedFiles;
      const onProgress = skipTargetPicker ? undefined : onUploadProgress;
      const copyPromise = copyFiles(
        filePaths,
        targetPath,
        targetLocation.uuid,
        onProgress,
      );
      if (skipTargetPicker) {
        Promise.resolve(copyPromise).then((success) => {
          if (success) {
            generateThumbsForTransferred(filePaths);
          }
          return true;
        });
      }
      setTargetPath('');
    }
    if (selectedDirs.length > 0) {
      copyDirs(
        getEntriesCount(selectedDirs),
        targetPath,
        targetLocation.uuid,
        skipTargetPicker ? undefined : onUploadProgress,
      );
    }
    onClose(true);
  }

  const onUploadProgress = (progress, abort, fileName) => {
    dispatch(AppActions.onUploadProgress(progress, abort, fileName));
  };

  function handleMove() {
    if (
      !skipTargetPicker &&
      (selectedFiles.length > 0 || selectedDirs.length > 0)
    ) {
      dispatch(AppActions.resetProgress());
      openFileUploadDialog(targetDir, 'moveEntriesTitle');
    }
    if (selectedFiles.length > 0) {
      const filePaths = selectedFiles;
      const movePromise = moveFiles(
        filePaths,
        targetPath,
        targetLocation.uuid,
        skipTargetPicker ? undefined : onUploadProgress,
        true,
        true,
      );
      if (skipTargetPicker) {
        Promise.resolve(movePromise).then((success) => {
          if (success) {
            sendDirMessage('moveFiles', filePaths);
            generateThumbsForTransferred(filePaths);
          }
          return true;
        });
      }
      setTargetPath('');
    }
    if (selectedDirs.length > 0) {
      moveDirs(
        getEntriesCount(selectedDirs),
        targetPath,
        targetLocation.uuid,
        skipTargetPicker ? undefined : onUploadProgress,
      );
    }
    onClose(true);
  }

  function onPrimary() {
    const commit = () => {
      recordRecentDestination();
      if (mode === 'copy') {
        handleCopy();
      } else {
        handleMove();
      }
    };
    handleEntryExist(currentEntries, targetPath).then((exist) => {
      if (exist) {
        openEntryExistDialog(exist, commit);
      } else {
        commit();
      }
    });
  }

  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const dialogTitleText =
    mode === 'copy'
      ? t('core:copyNItems', { count: itemCount })
      : t('core:moveNItems', { count: itemCount });

  const validity = computeMoveCopyValidity({
    entries: currentEntries,
    targetPath,
    targetLocation,
    sourceLocation,
    mode,
  });
  const validityMessageKey = getValidityMessageKey(validity.reason);
  // Don't show inline error for the "no target chosen yet" state — empty state
  // is self-explanatory via the destination row's placeholder.
  const showInlineError = validity.disabled && !!validityMessageKey;
  const primaryDisabled = validity.disabled;

  const titleBlock = (
    <Box>
      <Typography
        component="div"
        variant="h6"
        id="mcf-title"
        sx={{ fontSize: '1.05rem', fontWeight: 600 }}
      >
        {dialogTitleText}
      </Typography>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={() => onClose()}
      keepMounted
      scroll="paper"
      aria-labelledby="mcf-title"
      aria-describedby="mcf-subtitle"
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      fullScreen={smallScreen}
      fullWidth
      maxWidth="sm"
    >
      <TsDialogTitle
        dialogTitle={titleBlock}
        closeButtonTestId="closeMCFilesTID"
        onClose={onClose}
      />
      <DialogContent sx={{ overflowX: 'hidden', overflowY: 'auto' }}>
        {/* Region 2: Selected-items summary (collapsible pill) */}
        <Box sx={{ marginBottom: 1.5 }}>
          <SelectedItemsSummary
            entries={currentEntries}
            dirProp={dirProp.current}
            defaultCollapsed={smallScreen || currentEntries.length >= 5}
          />
        </Box>

        {/* Regions 3 + 4 + 6: Destination row + Tools row + Folder list (single composition) */}
        {open && !skipTargetPicker && targetLocation && (
          <>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ display: 'block', marginTop: 1, marginBottom: 0.5 }}
            >
              {t('core:destination')}
            </Typography>
            {!smallScreen && !searchQuery && visibleRecents.length > 0 && (
              <Box sx={{ marginBottom: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    marginBottom: 0.5,
                    color: 'text.secondary',
                  }}
                >
                  <AccessTimeIcon sx={{ fontSize: '0.9rem' }} />
                  <Typography variant="caption" color="text.secondary">
                    {t('core:recent')}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.5,
                  }}
                >
                  {visibleRecents.map((r) => (
                    <TsTooltip key={r.locationId + r.path} title={r.path}>
                      <Chip
                        variant="outlined"
                        size="small"
                        clickable
                        icon={<FolderIcon style={{ fontSize: 14 }} />}
                        label={r.label}
                        onClick={() => handleClickRecent(r)}
                        sx={{
                          borderRadius: AppConfig.defaultCSSRadius,
                          maxWidth: 200,
                        }}
                      />
                    </TsTooltip>
                  ))}
                </Box>
              </Box>
            )}
            <FolderBrowser
              locations={locations}
              activeLocationId={targetLocation.uuid}
              onActiveLocationChange={handlePickLocation}
              path={targetPath || targetLocation.path || ''}
              onPathChange={setTargetPath}
              onAddLocation={openCreateEditLocationDialog}
              disabledLocationIds={disabledLocationIds}
              locationDisabledTooltip={t('core:cloudCrossLocationNotSupported')}
              filter="folders"
              onCreateFolder={(parent) =>
                openCreateDirectoryDialog(parent, () => {
                  // Stay at the parent path; bump the version so FolderList
                  // re-fetches and the new folder shows up. Auto-navigating
                  // into the new folder would hide it from the picker list
                  // and break the create-then-select flow.
                  setDirVersion((v) => v + 1);
                })
              }
              onQueryChange={setSearchQuery}
              listHeight={smallScreen ? '50vh' : 240}
              refreshKey={dirVersion}
            />
            {showInlineError && validityMessageKey && (
              <Box
                id="mcf-validity-error"
                role="alert"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  marginTop: 1,
                  color: 'error.main',
                }}
              >
                <WarningIcon fontSize="small" />
                <Typography variant="body2" color="error.main">
                  {t(validityMessageKey)}
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <TsDialogActions
        sx={{
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          rowGap: 1,
        }}
      >
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, next) => {
            if (next) {
              setMode(next);
            }
          }}
          aria-label={t('core:copyMoveEntriesTitle')}
          sx={{
            borderRadius: AppConfig.defaultCSSRadius,
            '& .MuiToggleButton-root': {
              // Align toggle button height with the adjacent TsButton small size.
              padding: '3px 11px',
              '&:first-of-type': {
                borderTopLeftRadius: AppConfig.defaultCSSRadius,
                borderBottomLeftRadius: AppConfig.defaultCSSRadius,
              },
              '&:last-of-type': {
                borderTopRightRadius: AppConfig.defaultCSSRadius,
                borderBottomRightRadius: AppConfig.defaultCSSRadius,
              },
            },
          }}
        >
          <TsToggleButton
            value="move"
            data-tid="mcfModeMove"
            disabled={moveDisallowed}
            sx={{ gap: mode === 'move' ? 0.5 : 0 }}
          >
            {mode === 'move' && <CheckIcon sx={{ fontSize: '1rem' }} />}
            {t('core:moveEntriesButton')}
          </TsToggleButton>
          <TsToggleButton
            value="copy"
            data-tid="mcfModeCopy"
            sx={{ gap: mode === 'copy' ? 0.5 : 0 }}
          >
            {mode === 'copy' && <CheckIcon sx={{ fontSize: '1rem' }} />}
            {t('core:copyEntriesButton')}
          </TsToggleButton>
        </ToggleButtonGroup>
        <Stack direction="row" spacing={1}>
          <TsButton data-tid="closeMoveCopyDialog" onClick={() => onClose()}>
            {t('core:cancel')}
          </TsButton>
          <TsButton
            data-tid={mode === 'copy' ? 'confirmCopyFiles' : 'confirmMoveFiles'}
            disabled={primaryDisabled}
            onClick={onPrimary}
            variant="contained"
            aria-describedby={
              showInlineError ? 'mcf-validity-error' : undefined
            }
          >
            {mode === 'copy' ? t('core:copyHere') : t('core:moveHere')}
          </TsButton>
        </Stack>
      </TsDialogActions>
    </Dialog>
  );
}

export default MoveCopyFilesDialog;
