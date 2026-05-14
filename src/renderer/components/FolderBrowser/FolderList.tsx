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
import { FolderIcon } from '-/components/CommonIcons';
import FileExtBadge from '-/components/FileExtBadge';
import TsTooltip from '-/components/TsTooltip';
import {
  getDefaultFolderColor,
  getSupportedFileTypes,
} from '-/reducers/settings';
import { findColorForEntry } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { extractFileExtension } from '@tagspaces/tagspaces-common/paths';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

const TILE_SX = {
  minWidth: 36,
  height: 22,
  fontSize: 10,
  lineHeight: 1,
  padding: '0 4px',
} as const;

function getDisplayExtension(entry: TS.FileSystemEntry): string {
  if (entry.extension) return entry.extension;
  const source = entry.name || entry.path || '';
  return source ? extractFileExtension(source) : '';
}

function ExtensionTile({
  entry,
  supportedFileTypes,
  defaultFolderColor,
}: {
  entry: TS.FileSystemEntry;
  supportedFileTypes: Array<any>;
  defaultFolderColor: string;
}) {
  const ext = getDisplayExtension(entry);
  const normalizedEntry: TS.FileSystemEntry =
    entry.isFile && !entry.extension && ext
      ? { ...entry, extension: ext }
      : entry;
  const color = findColorForEntry(
    normalizedEntry,
    supportedFileTypes,
    defaultFolderColor,
  );
  return (
    <FileExtBadge noWrap sx={{ ...TILE_SX, backgroundColor: color }}>
      {entry.isFile ? (
        ext || '·'
      ) : (
        <FolderIcon style={{ fontSize: 14, color: 'white' }} />
      )}
    </FileExtBadge>
  );
}

export type FolderListFilter = 'folders' | 'files' | 'all';

interface Props {
  location: CommonLocation;
  /** Absolute path within the location whose immediate children to list. */
  path: string;
  /** Optional case-insensitive substring filter over entry names. */
  query?: string;
  /** Whether to list folders only (default), files only, or both. */
  filter?: FolderListFilter;
  /** Highlight a specific entry's path (e.g. just-created folder). */
  selectedPath?: string;
  /** Called when the user descends into a folder. */
  onDescend?: (path: string) => void;
  /** Called when the user clicks a file (file-picker mode). */
  onFileSelect?: (entry: TS.FileSystemEntry) => void;
  /** Fixed visible height for the list area. Content scrolls; loading and
   *  empty states center inside this area so the parent's layout stays stable. */
  height?: number | string;
  /** Bump to force a re-fetch of the current path (e.g. after creating a folder). */
  refreshKey?: number;
}

function FolderList({
  location,
  path,
  query,
  filter = 'folders',
  selectedPath,
  onDescend,
  onFileSelect,
  height = 240,
  refreshKey = 0,
}: Props) {
  const { t } = useTranslation();
  const supportedFileTypes = useSelector(getSupportedFileTypes);
  const defaultFolderColor = useSelector(getDefaultFolderColor);
  const [entries, setEntries] = useState<TS.FileSystemEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<HTMLUListElement | null>(null);

  function handleListKeyDown(event: React.KeyboardEvent<HTMLUListElement>) {
    if (!listRef.current) return;
    const buttons = Array.from(
      listRef.current.querySelectorAll<HTMLElement>('[data-tid^="MoveTarget"]'),
    );
    if (buttons.length === 0) return;
    const active = document.activeElement as HTMLElement | null;
    let idx = active ? buttons.indexOf(active) : -1;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        idx = idx < 0 ? 0 : Math.min(idx + 1, buttons.length - 1);
        buttons[idx].focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        idx = idx <= 0 ? 0 : idx - 1;
        buttons[idx].focus();
        break;
      case 'Home':
        event.preventDefault();
        buttons[0].focus();
        break;
      case 'End':
        event.preventDefault();
        buttons[buttons.length - 1].focus();
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    if (!location?.listDirectoryPromise) {
      setEntries([]);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }
    location
      .listDirectoryPromise(path, [], [])
      .then((results: TS.FileSystemEntry[] | undefined) => {
        if (cancelled) return;
        setEntries(
          (results || []).filter(
            (e) =>
              e.name !== AppConfig.metaFolder &&
              !e.name.endsWith('/' + AppConfig.metaFolder) &&
              !e.name.startsWith('.'),
          ),
        );
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error('FolderList listDirectoryPromise', err);
        setEntries([]);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [location, path, refreshKey]);

  const visible = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    const filtered = entries.filter((e) => {
      if (filter === 'folders' && e.isFile) return false;
      if (filter === 'files' && !e.isFile) return false;
      if (q && !e.name.toLowerCase().includes(q)) return false;
      return true;
    });
    // Show folders first, then files. Within each group keep the order from
    // listDirectoryPromise (typically the location's natural sort).
    return [...filtered].sort((a, b) => {
      if (a.isFile === b.isFile) return 0;
      return a.isFile ? 1 : -1;
    });
  }, [entries, filter, query]);

  function handleClick(entry: TS.FileSystemEntry) {
    if (entry.isFile) {
      onFileSelect?.(entry);
    } else {
      onDescend?.(entry.path);
    }
  }

  const containerSx = {
    height,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  };

  if (loading) {
    return (
      <Box sx={{ ...containerSx, padding: 1 }}>
        {[0, 1, 2].map((i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={36}
            sx={{ marginBottom: 0.5, borderRadius: 1 }}
          />
        ))}
      </Box>
    );
  }

  if (visible.length === 0) {
    let emptyMessage: string;
    if (query) {
      emptyMessage = t('core:noFoldersMatch');
    } else if (filter === 'folders' && entries.some((e) => e.isFile)) {
      // Folder is not actually empty — it just has no subfolders, only files
      // that the picker is filtering out.
      emptyMessage = t('core:noSubfoldersHere');
    } else if (filter === 'files' && entries.some((e) => !e.isFile)) {
      emptyMessage = t('core:noFilesHere');
    } else {
      emptyMessage = t('core:thisFolderIsEmpty');
    }
    return (
      <Box
        sx={{
          ...containerSx,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 3,
          textAlign: 'center',
          color: 'text.secondary',
          fontSize: '0.875rem',
        }}
      >
        {emptyMessage}
      </Box>
    );
  }

  return (
    <Box sx={containerSx}>
      <List
        dense
        ref={listRef}
        onKeyDown={handleListKeyDown}
        aria-label={t('core:destination')}
        sx={{
          flex: 1,
          overflowY: 'auto',
          padding: 0,
        }}
      >
        {visible.map((entry) => {
          const isSelected = selectedPath === entry.path;
          return (
            <TsTooltip key={entry.path} title={entry.path}>
              <ListItemButton
                data-tid={'MoveTarget' + entry.name}
                selected={isSelected}
                onClick={() => handleClick(entry)}
                onDoubleClick={() => !entry.isFile && onDescend?.(entry.path)}
                sx={{ gap: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 44 }}>
                  <ExtensionTile
                    entry={entry}
                    supportedFileTypes={supportedFileTypes}
                    defaultFolderColor={defaultFolderColor}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" noWrap>
                      {entry.name}
                    </Typography>
                  }
                />
                {!entry.isFile && (
                  <ChevronRightIcon
                    fontSize="small"
                    sx={{ color: 'text.disabled', flexShrink: 0 }}
                  />
                )}
              </ListItemButton>
            </TsTooltip>
          );
        })}
      </List>
    </Box>
  );
}

export default FolderList;
