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
import { ParentFolderIcon } from '-/components/CommonIcons';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import ClearIcon from '@mui/icons-material/Clear';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import {
  cleanFrontDirSeparator,
  cleanTrailingDirSeparator,
  extractParentDirectoryPath,
} from '@tagspaces/tagspaces-common/paths';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FolderList, { FolderListFilter } from './FolderList';
import LocationBreadcrumb from './LocationBreadcrumb';
import LocationPicker from './LocationPicker';

function normalizePath(p: string): string {
  if (!p) return '';
  return cleanTrailingDirSeparator(
    cleanFrontDirSeparator(p.replace(/\\/g, '/')),
  );
}

interface Props {
  locations: CommonLocation[];
  activeLocationId: string;
  onActiveLocationChange: (location: CommonLocation) => void;
  /** Absolute path within the active location. Controlled by parent. */
  path: string;
  onPathChange: (newPath: string) => void;
  /** Optional handler for the "Add location…" menu item. */
  onAddLocation?: () => void;
  /** Locations rendered as disabled in the picker. */
  disabledLocationIds?: string[];
  /** Tooltip shown on disabled location rows. */
  locationDisabledTooltip?: string;
  /** Which entries the folder list shows. Default: 'folders'. */
  filter?: FolderListFilter;
  /** File-picker callback (when filter includes files). */
  onFileSelect?: (entry: TS.FileSystemEntry) => void;
  /** When provided, shows a "New folder" button. Receives the current path. */
  onCreateFolder?: (parentPath: string) => void;
  /** Notifies parent when the search query changes (so e.g. recents can hide). */
  onQueryChange?: (query: string) => void;
  /** Fixed height of the folder list area. */
  listHeight?: number | string;
  /** Bump to force the folder list to re-fetch its current path. */
  refreshKey?: number;
}

function FolderBrowser({
  locations,
  activeLocationId,
  onActiveLocationChange,
  path,
  onPathChange,
  onAddLocation,
  disabledLocationIds,
  locationDisabledTooltip,
  filter = 'folders',
  onFileSelect,
  onCreateFolder,
  onQueryChange,
  listHeight = 240,
  refreshKey,
}: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const activeLocation = locations.find((l) => l.uuid === activeLocationId);
  const sep = activeLocation?.getDirSeparator?.() || '/';

  // We can't always compare `path` against `activeLocation.path` directly:
  // extconfig-defined locations carry a *relative* path like
  // `./tests/testdata-0/file-structure/supported-filestypes` while the
  // runtime `path` is absolute (`/Users/.../supported-filestypes`). Anchor
  // the "are we at the location root?" check on the location's leaf folder
  // name (basename) so the equality holds in both shapes.
  const rootNorm = normalizePath(activeLocation?.path || '');
  const pathNorm = normalizePath(path || '');
  const rootSegments = rootNorm.split('/').filter((s) => s.length > 0);
  const rootLeaf = rootSegments[rootSegments.length - 1];
  const pathSegments = pathNorm.split('/').filter((s) => s.length > 0);
  const pathLeaf = pathSegments[pathSegments.length - 1];

  const atLocationRoot =
    !!activeLocation &&
    (pathNorm === rootNorm ||
      (pathNorm === '' && !rootNorm) ||
      (!!rootLeaf && !!pathLeaf && rootLeaf === pathLeaf));

  function setQueryAndNotify(next: string) {
    setQuery(next);
    onQueryChange?.(next);
  }

  function handleUp() {
    if (atLocationRoot || !activeLocation) return;
    onPathChange(extractParentDirectoryPath(path, sep));
  }

  if (!activeLocation) {
    return null;
  }

  return (
    <Box>
      {/* Destination row */}
      <Paper
        variant="outlined"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          padding: '4px 4px 4px 6px',
          borderRadius: AppConfig.defaultCSSRadius,
          minHeight: 40,
        }}
      >
        <LocationPicker
          locations={locations}
          activeLocationId={activeLocation.uuid}
          onSelect={onActiveLocationChange}
          onAddLocation={onAddLocation}
          disabledLocationIds={disabledLocationIds}
          locationDisabledTooltip={locationDisabledTooltip}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <LocationBreadcrumb
            location={activeLocation}
            path={path || activeLocation.path || ''}
            onJump={onPathChange}
          />
        </Box>
        <TsIconButton
          size="small"
          data-tid="navigateToParentTID"
          onClick={handleUp}
          disabled={atLocationRoot}
          aria-label={t('core:upOneLevel')}
          tooltip={t('core:upOneLevel')}
        >
          <ParentFolderIcon fontSize="small" />
        </TsIconButton>
      </Paper>

      {/* Tools row: search + (optional) New folder */}
      <Box sx={{ display: 'flex', gap: 1, marginTop: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder={t('core:filterFolders')}
          value={query}
          onChange={(e) => setQueryAndNotify(e.target.value)}
          slotProps={{
            htmlInput: { 'data-tid': 'folderBrowserSearch' },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <TsIconButton
                    size="small"
                    onClick={() => setQueryAndNotify('')}
                    aria-label={t('core:clearSearch')}
                    tooltip={t('core:clearSearch')}
                  >
                    <ClearIcon fontSize="small" />
                  </TsIconButton>
                </InputAdornment>
              ) : undefined,
              sx: { borderRadius: AppConfig.defaultCSSRadius },
            },
          }}
        />
        {onCreateFolder && (
          <TsButton
            data-tid="newSubdirectoryTID"
            startIcon={<CreateNewFolderOutlinedIcon fontSize="small" />}
            onClick={() => onCreateFolder(path || activeLocation.path || '')}
            sx={{
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {t('core:createDirectory')}
          </TsButton>
        )}
      </Box>

      {/* Folder list */}
      <Box
        sx={{
          marginTop: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: AppConfig.defaultCSSRadius,
          overflow: 'hidden',
        }}
      >
        <FolderList
          location={activeLocation}
          path={path || activeLocation.path || ''}
          query={query}
          filter={filter}
          onDescend={onPathChange}
          onFileSelect={onFileSelect}
          height={listHeight}
          refreshKey={refreshKey}
        />
      </Box>
    </Box>
  );
}

export default FolderBrowser;
