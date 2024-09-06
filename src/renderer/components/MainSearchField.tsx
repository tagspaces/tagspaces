/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

import React from 'react';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

const MainSearchField = styled(TextField)(({ theme }) => ({
  overflow: 'hidden',
  '& input': {
    padding: 6,
  },
  '& .MuiInputBase-root': {
    borderRadius: 7,
    paddingRight: 5,
    paddingLeft: 5,
  },
  '& .Mui-focused': {
    color:
      theme.palette.mode === 'light'
        ? theme.palette.grey[900]
        : theme.palette.grey[200],
    backgroundColor:
      theme.palette.mode === 'light'
        ? theme.palette.grey[200]
        : theme.palette.grey[900],
  },
  // '&$focused': {
  //   outline: 'none',
  //   boxShadow: '0 0 0 4px rgba(21, 156, 228, 0.4)'
  // },
  '&:hover': {
    backgroundColor: theme.palette.background.paper,
    // boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`
  },
}));

export default MainSearchField;
