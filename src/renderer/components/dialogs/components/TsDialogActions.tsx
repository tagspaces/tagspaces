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

import React from 'react';
import { useSelector } from 'react-redux';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import DialogActions, { DialogActionsProps } from '@mui/material/DialogActions';
import { isDesktopMode } from '-/reducers/settings';
import AppConfig from '-/AppConfig';

export type TSDialogActions = DialogActionsProps & {};

function TSDialogActions(props: TSDialogActions) {
  const { children, style } = props;
  const desktopMode = useSelector(isDesktopMode);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <DialogActions
      {...props}
      style={{
        padding: fullScreen ? '10px 30px 30px 30px' : 'inherited',
        ...style,
      }}
    >
      {children}
    </DialogActions>
  );
}

export default TSDialogActions;
