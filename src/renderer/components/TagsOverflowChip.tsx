/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2026-present TagSpaces GmbH
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

import React, { useState } from 'react';
import { Box, Popover } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TagContainer from '-/components/TagContainer';
import { TS } from '-/tagspaces.namespace';

interface Props {
  remaining: TS.Tag[];
  entry: TS.FileSystemEntry;
  handleTagMenu?: (
    event: Object,
    tag: TS.Tag,
    entry: TS.FileSystemEntry,
  ) => void;
}

// "+N" chip rendered after the visible tags. Click opens a popover that lists
// the rest using the same TagContainer the cell would have rendered inline,
// so styling, color, and click behaviour stay consistent.
function TagsOverflowChip({ remaining, entry, handleTagMenu }: Props) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  if (!remaining || remaining.length === 0) return null;

  const open = Boolean(anchorEl);
  const label = `+${remaining.length}`;

  return (
    <>
      <Box
        component="span"
        role="button"
        aria-label={t('core:moreTags', { count: remaining.length })}
        title={t('core:moreTags', { count: remaining.length })}
        onClick={(event) => {
          event.stopPropagation();
          setAnchorEl(event.currentTarget);
        }}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          height: 18,
          padding: '0 6px',
          margin: '2px 2px 0 2px',
          borderRadius: 2,
          fontSize: 12,
          lineHeight: '18px',
          cursor: 'pointer',
          backgroundColor: 'rgba(0,0,0,0.45)',
          color: '#fff',
          userSelect: 'none',
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.65)' },
        }}
      >
        {label}
      </Box>
      {open && (
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          onClick={(e) => e.stopPropagation()}
        >
          <Box
            sx={{
              padding: 1,
              maxWidth: 320,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.5,
            }}
          >
            {remaining.map((tag) => (
              <TagContainer
                tag={tag}
                key={(entry?.path ?? '') + ':' + tag.title}
                entry={entry}
                handleTagMenu={handleTagMenu}
              />
            ))}
          </Box>
        </Popover>
      )}
    </>
  );
}

export default React.memo(TagsOverflowChip);
