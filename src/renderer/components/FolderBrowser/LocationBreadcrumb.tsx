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

import { CommonLocation } from '-/utils/CommonLocation';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import {
  cleanFrontDirSeparator,
  cleanTrailingDirSeparator,
} from '@tagspaces/tagspaces-common/paths';
import { useTranslation } from 'react-i18next';

interface Props {
  location: CommonLocation;
  /** Absolute path within the location (or equal to location.path for root). */
  path: string;
  /** Jump to an ancestor path within the location. */
  onJump: (newPath: string) => void;
}

function normalize(p: string): string {
  if (!p) return '';
  // Convert backslashes to forward slashes for splitting, then strip surrounding separators.
  return cleanTrailingDirSeparator(
    cleanFrontDirSeparator(p.replace(/\\/g, '/')),
  );
}

function LocationBreadcrumb({ location, path, onJump }: Props) {
  const { t } = useTranslation();
  const sep = location.getDirSeparator?.() || '/';
  const rootNorm = normalize(location.path || '');
  const pathNorm = normalize(path || '');

  // Compute the segments inside the location.
  let inside = pathNorm;
  if (
    rootNorm &&
    (pathNorm === rootNorm || pathNorm.startsWith(rootNorm + '/'))
  ) {
    inside = pathNorm.slice(rootNorm.length).replace(/^\/+/, '');
  }
  const segments = inside.split('/').filter((s) => s.length > 0);

  // At the location root → render a single muted separator so the row never looks empty.
  if (segments.length === 0) {
    return (
      <Typography
        component="span"
        variant="body2"
        color="text.secondary"
        sx={{ padding: '2px 4px' }}
        title={location.path || location.name}
      >
        {sep}
      </Typography>
    );
  }

  const jumpTo = (i: number) => {
    const subset = segments.slice(0, i + 1).join(sep);
    const newPath = location.path
      ? location.path.replace(/[\\/]+$/, '') + sep + subset
      : subset;
    onJump(newPath);
  };

  return (
    <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
      <Breadcrumbs
        separator={sep}
        aria-label={t('core:destination')}
        maxItems={4}
        itemsBeforeCollapse={1}
        itemsAfterCollapse={2}
        sx={{
          '& .MuiBreadcrumbs-ol': {
            flexWrap: 'nowrap',
          },
          '& .MuiBreadcrumbs-li': {
            minWidth: 0,
          },
          '& .MuiBreadcrumbs-separator': {
            marginLeft: 0.5,
            marginRight: 0.5,
          },
        }}
      >
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1;
          return (
            <Link
              key={`${seg}-${i}`}
              component="button"
              type="button"
              underline="hover"
              color={isLast ? 'text.primary' : 'text.secondary'}
              onClick={() => jumpTo(i)}
              sx={{
                fontSize: '0.85rem',
                fontWeight: isLast ? 600 : 500,
                maxWidth: 160,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                padding: '2px 4px',
                borderRadius: 1,
                lineHeight: 1.4,
              }}
              title={seg}
            >
              {seg}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}

export default LocationBreadcrumb;
