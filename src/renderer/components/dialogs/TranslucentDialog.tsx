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

import React, { useState, useEffect, useRef } from 'react';
import { alpha, useTheme, styled } from '@mui/material/styles';
import Dialog, { DialogProps } from '@mui/material/Dialog';

// const TranslucentDialog1 = styled(Dialog)(({ theme }) => ({
//   '& .MuiDialog-paper': {
//     background: alpha(theme.palette.background.default, 0.85),
//     backdropFilter: 'blur(5px)',
//   },
// })) as typeof Dialog;

const TranslucentDialog = (props: DialogProps) => {
  const theme = useTheme();
  return (
    <Dialog
      {...props}
      sx={{
        '& .MuiDialog-paper': {
          background: props.fullScreen
            ? theme.palette.background.default
            : alpha(theme.palette.background.default, 0.85),
          backdropFilter: props.fullScreen ? 'unset' : 'blur(5px)',
        },
      }}
    />
  );
};

export default TranslucentDialog;
