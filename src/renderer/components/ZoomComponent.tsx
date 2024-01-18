/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces UG (haftungsbeschraenkt)
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

import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ZoomOutIcon from '@mui/icons-material/RemoveCircleOutline';
import ZoomInIcon from '@mui/icons-material/ControlPoint';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';
import { useReducer } from 'react';

interface Props {
  preview: boolean;
}

export default function ZoomComponent(props: Props) {
  const { preview } = props;
  const { entrySize, setSettings, saveSettings } =
    usePerspectiveSettingsContext();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const theme = useTheme();
  const entrySizePercent = mapEntrySizeToPercent();

  function mapEntrySizeToPercent() {
    if (entrySize === 'huge') {
      return '120%';
    } else if (entrySize === 'big') {
      return '110%';
    } else if (entrySize === 'normal') {
      return '100%';
    } else if (entrySize === 'small') {
      return '90%';
    } else if (entrySize === 'tiny') {
      return '80%';
    }
  }

  function changeEntrySize(size) {
    setSettings({ entrySize: size });
    if (!preview) {
      saveSettings(); //isDefaultSetting);
    }
    forceUpdate();
  }

  function zoomIn() {
    if (entrySize === 'huge') {
      // changeEntrySize(TS.EntrySizes.tiny);
    } else if (entrySize === 'big') {
      changeEntrySize('huge');
    } else if (entrySize === 'normal') {
      changeEntrySize('big');
    } else if (entrySize === 'small') {
      changeEntrySize('normal');
    } else if (entrySize === 'tiny') {
      changeEntrySize('small');
    }
  }

  function zoomOut() {
    if (entrySize === 'huge') {
      changeEntrySize('big');
    } else if (entrySize === 'big') {
      changeEntrySize('normal');
    } else if (entrySize === 'normal') {
      changeEntrySize('small');
    } else if (entrySize === 'small') {
      changeEntrySize('tiny');
    } else if (entrySize === 'tiny') {
      // changeEntrySize(TS.EntrySizes.small);
    }
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <IconButton onClick={zoomOut}>
        <ZoomOutIcon />
      </IconButton>
      <Typography
        variant="overline"
        style={{ color: theme.palette.text.primary, marginTop: 4 }}
      >
        {entrySizePercent}
      </Typography>
      <IconButton onClick={zoomIn}>
        <ZoomInIcon />
      </IconButton>
    </Box>
  );
}
