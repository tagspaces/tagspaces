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
import FileExtBadge from '-/components/FileExtBadge';
import {
  getDefaultFolderColor,
  getSupportedFileTypes,
} from '-/reducers/settings';
import { findColorForEntry } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { formatBytes } from '@tagspaces/tagspaces-common/misc';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

type DirSize = { totalSize?: number };

interface Props {
  entries: TS.FileSystemEntry[];
  /** Pre-fetched directory sizes, keyed by directory path. */
  dirProp?: Record<string, DirSize>;
  /** When true (e.g. on <md or large selections), the pill starts collapsed. */
  defaultCollapsed?: boolean;
}

function getTotalSize(
  entries: TS.FileSystemEntry[],
  dirProp: Record<string, DirSize>,
): number {
  let total = 0;
  for (const entry of entries) {
    if (entry.isFile && typeof entry.size === 'number') {
      total += entry.size;
    } else if (!entry.isFile && dirProp[entry.path]?.totalSize) {
      total += dirProp[entry.path].totalSize as number;
    }
  }
  return total;
}

const TILE_SX = {
  minWidth: 36,
  height: 22,
  fontSize: 10,
  lineHeight: 1,
  padding: '0 4px',
} as const;

function ExtensionTile({
  entry,
  supportedFileTypes,
  defaultFolderColor,
}: {
  entry: TS.FileSystemEntry;
  supportedFileTypes: Array<any>;
  defaultFolderColor: string;
}) {
  const color = findColorForEntry(
    entry,
    supportedFileTypes,
    defaultFolderColor,
  );
  return (
    <FileExtBadge
      noWrap
      sx={{
        ...TILE_SX,
        backgroundColor: color,
      }}
    >
      {entry.isFile ? (
        entry.extension || '·'
      ) : (
        <FolderIcon style={{ fontSize: 14, color: 'white' }} />
      )}
    </FileExtBadge>
  );
}

function SelectedItemsSummary({ entries, dirProp, defaultCollapsed }: Props) {
  const { t } = useTranslation();
  const supportedFileTypes = useSelector(getSupportedFileTypes);
  const defaultFolderColor = useSelector(getDefaultFolderColor);
  const itemCount = entries.length;
  const [expanded, setExpanded] = useState(!defaultCollapsed);

  if (itemCount === 0) {
    return null;
  }

  const totalSize = getTotalSize(entries, dirProp || {});
  const sizeLabel = totalSize > 0 ? formatBytes(totalSize) : null;

  // Single-item shortcut — no collapsible chrome.
  if (itemCount === 1) {
    const entry = entries[0];
    const itemSize = entry.isFile
      ? entry.size
      : dirProp?.[entry.path]?.totalSize;
    return (
      <Paper
        variant="outlined"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          padding: '8px 12px',
          width: '100%',
          boxSizing: 'border-box',
          borderRadius: AppConfig.defaultCSSRadius,
        }}
      >
        <ExtensionTile
          entry={entry}
          supportedFileTypes={supportedFileTypes}
          defaultFolderColor={defaultFolderColor}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" noWrap title={entry.path}>
            {entry.name}
          </Typography>
        </Box>
        {typeof itemSize === 'number' && itemSize > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ flexShrink: 0 }}
          >
            {formatBytes(itemSize)}
          </Typography>
        )}
      </Paper>
    );
  }

  const visibleTiles = entries.slice(0, 3);
  const overflowCount = itemCount - visibleTiles.length;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          boxSizing: 'border-box',
          borderRadius: AppConfig.defaultCSSRadius,
          overflow: 'hidden',
        }}
      >
        <ButtonBase
          onClick={() => setExpanded((v) => !v)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            padding: '8px 12px',
            width: '100%',
            justifyContent: 'flex-start',
            textAlign: 'left',
          }}
          aria-expanded={expanded}
          aria-label={t('core:selectedFilesAndFolders')}
        >
          <Stack
            direction="row"
            sx={{
              flexShrink: 0,
              '& > :not(:first-of-type)': { marginLeft: '-6px' },
            }}
          >
            {visibleTiles.map((entry) => (
              <ExtensionTile
                key={entry.path}
                entry={entry}
                supportedFileTypes={supportedFileTypes}
                defaultFolderColor={defaultFolderColor}
              />
            ))}
            {overflowCount > 0 && (
              <Box
                sx={{
                  ...TILE_SX,
                  marginLeft: '-6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                  backgroundColor: 'action.selected',
                  color: 'text.primary',
                  fontWeight: 600,
                  fontSize: 10,
                }}
              >
                +{overflowCount}
              </Box>
            )}
          </Stack>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" component="span" noWrap>
              <Box component="strong" sx={{ fontWeight: 600 }}>
                {t('core:itemCount', { count: itemCount })}
              </Box>
              {sizeLabel && (
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  sx={{ marginLeft: 0.75 }}
                >
                  · {sizeLabel}
                </Typography>
              )}
            </Typography>
          </Box>
          {expanded ? (
            <ExpandLess fontSize="small" />
          ) : (
            <ExpandMore fontSize="small" />
          )}
        </ButtonBase>
        <Collapse in={expanded} unmountOnExit>
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
            <List
              dense
              sx={{
                overflowY: 'auto',
                maxHeight: '200px',
                paddingY: 0,
              }}
            >
              {entries.map((entry) => {
                const itemSize = entry.isFile
                  ? entry.size
                  : dirProp?.[entry.path]?.totalSize;
                const sizeText =
                  typeof itemSize === 'number' && itemSize > 0
                    ? formatBytes(itemSize)
                    : null;
                return (
                  <ListItem title={entry.path} key={entry.path} sx={{ gap: 1 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {entry.isFile ? <FileIcon /> : <FolderIcon />}
                    </ListItemIcon>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" noWrap>
                        {entry.name}
                      </Typography>
                    </Box>
                    {sizeText && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                      >
                        {sizeText}
                      </Typography>
                    )}
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
}

export default SelectedItemsSummary;
