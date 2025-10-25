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
import TooltipTS from '-/components/Tooltip';
import { isDesktopMode } from '-/reducers/settings';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

export type TSIconButtonProps = IconButtonProps & {
  tooltip?: string;
  keyBinding?: string;
};

const TsIconButton: React.FC<TSIconButtonProps> = ({
  children,
  sx,
  keyBinding,
  tooltip,
  disabled,
  ...restProps
}) => {
  const desktopMode = useSelector(isDesktopMode);

  // Memoize the icon button for performance
  const iconButton = useMemo(
    () => (
      <IconButton
        size={desktopMode ? 'medium' : 'large'}
        sx={{ borderRadius: AppConfig.defaultCSSRadius, ...sx }}
        disabled={disabled}
        {...restProps}
      >
        {children}
      </IconButton>
    ),
    [desktopMode, sx, disabled, restProps, children],
  );

  if (tooltip && !disabled) {
    return (
      <TooltipTS keyBinding={keyBinding} title={tooltip}>
        {iconButton}
      </TooltipTS>
    );
  }
  return iconButton;
};

export default React.memo(TsIconButton);
