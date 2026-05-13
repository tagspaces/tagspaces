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
import { FileIcon, FolderIcon } from '-/components/CommonIcons';
import TsTooltip from '-/components/TsTooltip';
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
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
}: Props) {
  const { t } = useTranslation();
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
  }, [location, path]);

  const visible = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    return entries.filter((e) => {
      if (filter === 'folders' && e.isFile) return false;
      if (filter === 'files' && !e.isFile) return false;
      if (q && !e.name.toLowerCase().includes(q)) return false;
      return true;
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
        {query ? t('core:noFoldersMatch') : t('core:thisFolderIsEmpty')}
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
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {entry.isFile ? <FileIcon /> : <FolderIcon />}
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
