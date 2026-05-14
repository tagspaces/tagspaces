/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2024-present TagSpaces GmbH
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
import { CheckIcon } from '-/components/CommonIcons';
import DraggablePaper from '-/components/DraggablePaper';
import { FolderBrowser } from '-/components/FolderBrowser';
import TsButton from '-/components/TsButton';
import TsToggleButton from '-/components/TsToggleButton';
import SelectedItemsSummary from '-/components/dialogs/components/SelectedItemsSummary';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import {
  actions as SettingsActions,
  getLastLinkType,
} from '-/reducers/settings';
import {
  buildRelativeLinkForEntry,
  buildSharingLinkForEntry,
} from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import TsTextField from '-/components/TsTextField';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { extractDirectoryName } from '@tagspaces/tagspaces-common/paths';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

export type FilePickerMode = 'file' | 'folder' | 'any';
export type FilePickerLinkType = 'ts' | 'relative';

export interface FilePickerDialogProps {
  open: boolean;
  onClose: () => void;
  mode?: FilePickerMode;
  initialLocationId?: string;
  initialPath?: string;
  /** Source context for relative-link computation. When provided AND the
   *  picked entry is in the same location, the dialog shows a link-format
   *  toggle. Without these, output is always ts://.
   *
   *  `sourceDir` is the directory the relative path will be resolved against.
   *  For a file's description: pass the file's containing directory.
   *  For a folder's description: pass the folder itself. */
  sourceLocationId?: string;
  sourceDir?: string;
  title?: string;
  confirmLabel?: string;
  /** When true, render an editable "Link text" field. Default value is
   *  `initialLabel` (if set) otherwise the picked entry's name. The user can
   *  edit before confirming; the final value is returned in onSelect. */
  showLabelField?: boolean;
  initialLabel?: string;
  onSelect: (
    entry: TS.FileSystemEntry,
    link: string,
    linkType: FilePickerLinkType,
    label: string,
  ) => void;
}

function modeAccepts(entry: TS.FileSystemEntry, mode: FilePickerMode): boolean {
  if (mode === 'any') return true;
  if (mode === 'file') return entry.isFile === true;
  return entry.isFile === false;
}

function FilePickerDialog(props: FilePickerDialogProps) {
  const { t } = useTranslation();
  const {
    open,
    onClose,
    mode = 'file',
    initialLocationId,
    initialPath,
    sourceLocationId,
    sourceDir,
    title,
    confirmLabel,
    showLabelField,
    initialLabel,
    onSelect,
  } = props;

  const { locations, findLocation } = useCurrentLocationContext();
  const { currentDirectoryPath } = useDirectoryContentContext();
  const { getMetadataID } = useIOActionsContext();
  const dispatch = useDispatch();
  const lastLinkType = useSelector(getLastLinkType);
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const defaultLocation = findLocation();
  const [activeTargetLocationId, setActiveTargetLocationId] = useState<
    string | undefined
  >(initialLocationId || defaultLocation?.uuid);
  const targetLocation = findLocation(activeTargetLocationId);
  const [path, setPath] = useState<string>(
    initialPath || currentDirectoryPath || targetLocation?.path || '',
  );
  const [selectedEntry, setSelectedEntry] = useState<
    TS.FileSystemEntry | undefined
  >(undefined);
  const [linkType, setLinkTypeState] =
    useState<FilePickerLinkType>(lastLinkType);
  // Wrap setLinkType to also persist the user's choice in settings so it
  // becomes the default the next time the dialog opens. Mirrors the
  // `lastMoveCopyMode` pattern in MoveCopyFilesDialog.
  const setLinkType = (next: FilePickerLinkType) => {
    setLinkTypeState(next);
    dispatch(SettingsActions.setLastLinkType(next));
  };
  // Editable "Link text" field. If `initialLabel` is provided (e.g. text was
  // selected in a markdown editor before opening), use it as the default;
  // otherwise empty until the user picks an entry (then auto-fills from name).
  const [linkLabel, setLinkLabel] = useState<string>(initialLabel || '');
  // Tracks whether the user has typed in the label field. If so we stop
  // auto-overwriting it from the picked entry's name.
  const userEditedLabelRef = useRef<boolean>(!!initialLabel);
  // Tracks the previous entry's name so we can auto-update the label when
  // the user switches to a different entry — but only as long as the label
  // still matches the previous entry's name (i.e. they haven't customized).
  const prevEntryNameRef = useRef<string>('');

  // Reset all transient state on each fresh open of the dialog so reuse from a
  // keepMounted context provider doesn't show stale selection between opens.
  useEffect(() => {
    if (open) {
      setActiveTargetLocationId(initialLocationId || defaultLocation?.uuid);
      setPath(
        initialPath || currentDirectoryPath || defaultLocation?.path || '',
      );
      setSelectedEntry(undefined);
      // Reset link-format to the persisted preference on each open.
      setLinkTypeState(lastLinkType);
      setLinkLabel(initialLabel || '');
      userEditedLabelRef.current = !!initialLabel;
      prevEntryNameRef.current = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Auto-fill the label from the picked entry's name unless the user has
  // customized it (or unless an initialLabel was supplied by the caller).
  useEffect(() => {
    if (!selectedEntry) return;
    const entryName = selectedEntry.name || '';
    const customized =
      userEditedLabelRef.current &&
      linkLabel !== prevEntryNameRef.current &&
      linkLabel !== '';
    if (!customized) {
      setLinkLabel(entryName);
      userEditedLabelRef.current = false;
    }
    prevEntryNameRef.current = entryName;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEntry]);

  function handleLabelChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLinkLabel(e.target.value);
    userEditedLabelRef.current = true;
  }

  function handlePickLocation(loc: any) {
    setActiveTargetLocationId(loc.uuid);
    setPath(loc.path || '');
    setSelectedEntry(undefined);
  }

  function handlePathChange(next: string) {
    setPath(next);
    // Changing folder invalidates a previous file selection.
    if (selectedEntry?.isFile) {
      setSelectedEntry(undefined);
    }
  }

  function handleFileSelect(entry: TS.FileSystemEntry) {
    setSelectedEntry(entry);
  }

  function handleSelectCurrentFolder() {
    if (!targetLocation) return;
    const sep = targetLocation.getDirSeparator?.() || '/';
    const folderName =
      extractDirectoryName(path || '', sep) || targetLocation.name;
    const folderEntry: TS.FileSystemEntry = {
      uuid: targetLocation.uuid + ':' + path,
      name: folderName,
      isFile: false,
      path: path || targetLocation.path || '',
      extension: '',
      tags: [],
      size: 0,
      lmdt: 0,
      locationID: targetLocation.uuid,
    } as TS.FileSystemEntry;
    setSelectedEntry(folderEntry);
  }

  // Relative-link availability — recomputed whenever the selection or source
  // context changes. The picked entry comes from listDirectoryPromise on the
  // currently-browsed `targetLocation` (and is cleared on location switch),
  // so by construction it lives in `targetLocation`. Many IO backends don't
  // populate `entry.locationID` on listing results, so we don't rely on it.
  const canUseRelative = useMemo(() => {
    if (!selectedEntry || !sourceLocationId || !sourceDir || !targetLocation) {
      return false;
    }
    if (targetLocation.uuid !== sourceLocationId) {
      return false;
    }
    const rel = buildRelativeLinkForEntry(
      selectedEntry,
      targetLocation,
      sourceDir,
    );
    return rel !== null;
  }, [selectedEntry, sourceLocationId, sourceDir, targetLocation]);

  const dialogTitleText =
    title ||
    (mode === 'folder'
      ? t('core:chooseFolder')
      : mode === 'any'
        ? t('core:chooseEntry')
        : t('core:chooseFile'));

  const emptyStateCaption =
    mode === 'folder'
      ? t('core:selectAFolder')
      : mode === 'any'
        ? t('core:selectAnEntry')
        : t('core:selectAFile');

  const primaryDisabled =
    !selectedEntry || !modeAccepts(selectedEntry, mode) || !targetLocation;

  async function handleConfirm() {
    if (!selectedEntry || !targetLocation) return;
    let link: string;
    if (linkType === 'relative' && canUseRelative && sourceDir) {
      const rel = buildRelativeLinkForEntry(
        selectedEntry,
        targetLocation,
        sourceDir,
      );
      link =
        rel ??
        (await buildSharingLinkForEntry(
          selectedEntry,
          targetLocation,
          getMetadataID,
        ));
    } else {
      link = await buildSharingLinkForEntry(
        selectedEntry,
        targetLocation,
        getMetadataID,
      );
    }
    const finalLabel =
      (linkLabel && linkLabel.trim()) || selectedEntry.name || '';
    onSelect(selectedEntry, link, canUseRelative ? linkType : 'ts', finalLabel);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      scroll="paper"
      aria-labelledby="fpd-title"
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      fullScreen={smallScreen}
      fullWidth
      maxWidth="sm"
    >
      <TsDialogTitle
        dialogTitle={
          <Typography
            component="div"
            variant="h6"
            id="fpd-title"
            sx={{ fontSize: '1.05rem', fontWeight: 600 }}
          >
            {dialogTitleText}
          </Typography>
        }
        closeButtonTestId="closeFilePickerTID"
        onClose={onClose}
      />
      <DialogContent sx={{ overflowX: 'hidden', overflowY: 'auto' }}>
        {open && targetLocation && (
          <FolderBrowser
            locations={locations}
            activeLocationId={targetLocation.uuid}
            onActiveLocationChange={handlePickLocation}
            path={path || targetLocation.path || ''}
            onPathChange={handlePathChange}
            filter={mode === 'folder' ? 'folders' : 'all'}
            onFileSelect={handleFileSelect}
            listHeight={smallScreen ? '50vh' : 240}
          />
        )}

        {/* Folder-mode / any-mode: explicit "Select this folder" affordance */}
        {mode !== 'file' && targetLocation && (
          <Box sx={{ marginTop: 1 }}>
            <TsButton
              data-tid="filePickerSelectCurrentFolder"
              onClick={handleSelectCurrentFolder}
            >
              {t('core:selectThisFolder')}
            </TsButton>
          </Box>
        )}

        <Box sx={{ marginTop: 1.5 }}>
          {selectedEntry ? (
            <SelectedItemsSummary entries={[selectedEntry]} />
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ padding: '8px 12px' }}
            >
              {emptyStateCaption}
            </Typography>
          )}
        </Box>

        {showLabelField && (
          <Box sx={{ marginTop: 1.5 }}>
            <TsTextField
              label={t('core:linkText')}
              value={linkLabel}
              onChange={handleLabelChange}
              updateValue={(v: string) => {
                setLinkLabel(v);
                userEditedLabelRef.current = true;
              }}
              retrieveValue={() => linkLabel}
              placeholder={selectedEntry?.name || ''}
              slotProps={{
                htmlInput: { 'data-tid': 'fpdLinkLabelField' },
              }}
            />
          </Box>
        )}
      </DialogContent>
      <TsDialogActions
        sx={{
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          rowGap: 1,
        }}
      >
        {/* Link-format toggle — visible whenever the caller supplied source
            context (so the option is discoverable). The "Relative link"
            option is disabled until the user selects an entry that lives in
            the same location as the source. */}
        {sourceLocationId && sourceDir ? (
          <ToggleButtonGroup
            value={linkType}
            exclusive
            onChange={(_, next) => {
              if (next) setLinkType(next);
            }}
            aria-label={t('core:link')}
            sx={{
              borderRadius: AppConfig.defaultCSSRadius,
              '& .MuiToggleButton-root': {
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
              value="relative"
              data-tid="fpdLinkTypeRelative"
              sx={{ gap: linkType === 'relative' ? 0.5 : 0 }}
            >
              {linkType === 'relative' && (
                <CheckIcon sx={{ fontSize: '1rem' }} />
              )}
              {t('core:relativeLink')}
            </TsToggleButton>
            <TsToggleButton
              value="ts"
              data-tid="fpdLinkTypeTs"
              sx={{ gap: linkType === 'ts' ? 0.5 : 0 }}
            >
              {linkType === 'ts' && <CheckIcon sx={{ fontSize: '1rem' }} />}
              {t('core:sharingLink')}
            </TsToggleButton>
          </ToggleButtonGroup>
        ) : (
          <Box />
        )}
        <Stack direction="row" spacing={1}>
          <TsButton data-tid="closeFilePickerDialog" onClick={onClose}>
            {t('core:cancel')}
          </TsButton>
          <TsButton
            data-tid="confirmFilePicker"
            disabled={primaryDisabled}
            onClick={handleConfirm}
            variant="contained"
          >
            {confirmLabel || t('core:select')}
          </TsButton>
        </Stack>
      </TsDialogActions>
    </Dialog>
  );
}

export default FilePickerDialog;
