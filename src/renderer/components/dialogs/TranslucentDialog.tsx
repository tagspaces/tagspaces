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
import Dialog from '@mui/material/Dialog';

const TranslucentDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: alpha(theme.palette.background.default, 0.8),
    backdropFilter: 'blur(5px)',
  },
})) as typeof Dialog;

export default TranslucentDialog;
