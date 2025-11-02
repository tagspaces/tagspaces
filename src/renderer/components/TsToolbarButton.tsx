/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2025-present TagSpaces GmbH
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
import { Typography } from '@mui/material';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';

export type TSIconButtonProps = IconButtonProps & {
  title?: string;
  tooltip?: string;
  keyBinding?: string;
  showTitle?: boolean;
};

function TsToolbarButton(props: TSIconButtonProps) {
  const {
    children,
    keyBinding,
    tooltip,
    title = '‎',
    disabled,
    sx: style,
    // showTitle = false,
    ...restProps
  } = props;
  const showTitle = true;
  const desktopMode = useSelector(isDesktopMode);
  const theme = useTheme();
  const iconButton = (
    <IconButton
      size={desktopMode ? 'medium' : 'large'}
      disabled={disabled}
      sx={{
        '& .MuiSvgIcon-root ': {
          width: showTitle ? '0.9em' : '1em',
          heigh: showTitle ? '0.9em' : '1em',
        },
        borderRadius: AppConfig.defaultCSSRadius,
        padding: '8px',
        paddingLeft: '6px',
        paddingRight: '6px',
        display: 'block',
        ...style,
      }}
      {...restProps}
    >
      {children}
      {showTitle && (
        <Typography
          sx={{
            display: 'block',
            fontSize: 11,
            marginTop: '-5px',
            width: '45px',
            padding: 0,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
        >
          {title}
        </Typography>
      )}
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

export default TsToolbarButton;
