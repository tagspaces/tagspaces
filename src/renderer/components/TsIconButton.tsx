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
import { useSelector } from 'react-redux';

export type TSIconButtonProps = IconButtonProps & {
  tooltip?: string;
  keyBinding?: string;
};

function TsIconButton(props: TSIconButtonProps) {
  const { children, style, keyBinding, tooltip, disabled, ...restProps } =
    props;
  const desktopMode = useSelector(isDesktopMode);
  const iconButton = (
    <IconButton
      size={desktopMode ? 'medium' : 'large'}
      style={{ borderRadius: AppConfig.defaultCSSRadius, ...style }}
      disabled={disabled}
      {...restProps}
    >
      {children}
    </IconButton>
  );
  return tooltip && !disabled ? (
    <TooltipTS keyBinding={keyBinding} title={tooltip}>
      {iconButton}
    </TooltipTS>
  ) : (
    iconButton
  );
}

export default TsIconButton;
