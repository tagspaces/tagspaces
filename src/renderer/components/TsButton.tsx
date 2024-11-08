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
import Button, { ButtonProps } from '@mui/material/Button';
import { isDesktopMode } from '-/reducers/settings';
import AppConfig from '-/AppConfig';

export type TSButtonProps = ButtonProps & {};

function TsButton(props: TSButtonProps) {
  const { children, style } = props;
  const desktopMode = useSelector(isDesktopMode);

  return (
    <Button
      size={desktopMode ? 'small' : 'medium'}
      variant="outlined" // text outlined contained
      {...props}
      style={{
        borderRadius: AppConfig.defaultCSSRadius,
        // fontSize: 14,
        // textTransform: 'capitalize',
        ...style,
      }}
    >
      {children}
    </Button>
  );
}

export default TsButton;
