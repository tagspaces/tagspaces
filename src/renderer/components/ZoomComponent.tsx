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
import Box from '@mui/material/Box';
import ZoomOutIcon from '@mui/icons-material/RemoveCircleOutline';
import ZoomInIcon from '@mui/icons-material/ControlPoint';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

interface Props {
  entrySize: EntrySizes;
  changeEntrySize: (entrySize: EntrySizes) => void;
}

export enum EntrySizes {
  huge = 'huge',
  big = 'big',
  normal = 'normal',
  small = 'small',
  tiny = 'tiny',
}

function mapEntrySizeToPercent(entrySize: EntrySizes) {
  if (entrySize === EntrySizes.huge) {
    return '120%';
  } else if (entrySize === EntrySizes.big) {
    return '110%';
  } else if (entrySize === EntrySizes.normal) {
    return '100%';
  } else if (entrySize === EntrySizes.small) {
    return '90%';
  } else if (entrySize === EntrySizes.tiny) {
    return '80%';
  }
}

export default function ZoomComponent(props: Props) {
  const { changeEntrySize, entrySize } = props;
  const entrySizePercent = mapEntrySizeToPercent(entrySize);

  function zoomIn() {
    if (entrySize === EntrySizes.huge) {
      // changeEntrySize(EntrySizes.tiny);
    } else if (entrySize === EntrySizes.big) {
      changeEntrySize(EntrySizes.huge);
    } else if (entrySize === EntrySizes.normal) {
      changeEntrySize(EntrySizes.big);
    } else if (entrySize === EntrySizes.small) {
      changeEntrySize(EntrySizes.normal);
    } else if (entrySize === EntrySizes.tiny) {
      changeEntrySize(EntrySizes.small);
    }
  }

  function zoomOut() {
    if (entrySize === EntrySizes.huge) {
      changeEntrySize(EntrySizes.big);
    } else if (entrySize === EntrySizes.big) {
      changeEntrySize(EntrySizes.normal);
    } else if (entrySize === EntrySizes.normal) {
      changeEntrySize(EntrySizes.small);
    } else if (entrySize === EntrySizes.small) {
      changeEntrySize(EntrySizes.tiny);
    } else if (entrySize === EntrySizes.tiny) {
      // changeEntrySize(EntrySizes.small);
    }
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <IconButton onClick={zoomOut}>
        <ZoomOutIcon />
      </IconButton>
      <Typography variant="overline" style={{ marginTop: 4 }}>
        {entrySizePercent}
      </Typography>
      <IconButton onClick={zoomIn}>
        <ZoomInIcon />
      </IconButton>
    </Box>
  );
}
