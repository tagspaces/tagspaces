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
import TsTooltip from '-/components/TsTooltip';
import { isDesktopMode } from '-/reducers/settings';
import { ToggleButton } from '@mui/material';
import { ButtonPropsVariantOverrides } from '@mui/material/Button';
import { alpha, useTheme } from '@mui/material/styles';
import { ToggleButtonProps } from '@mui/material/ToggleButton';
import { OverridableStringUnion } from '@mui/types';
import { useSelector } from 'react-redux';

export type TSToggleButtonProps = ToggleButtonProps & {
  tooltip?: string;
  variant?: OverridableStringUnion<
    'text' | 'outlined' | 'contained',
    ButtonPropsVariantOverrides
  >;
};

function TsToggleButton(props: TSToggleButtonProps) {
  const { children, sx, tooltip, selected, ...rest } = props;
  const theme = useTheme();
  const desktopMode = useSelector(isDesktopMode);
  let button = (
    <ToggleButton
      size={desktopMode ? 'small' : 'medium'}
      variant="outlined" // text outlined contained
      selected={selected}
      {...rest}
      sx={{
        borderRadius: AppConfig.defaultCSSRadius,
        textTransform: 'none', //'capitalize',
        fontSize: '14px',
        fontWeight: 'normal',
        // Inside a ToggleButtonGroup, non-first buttons have margin-left:-1px and
        // a 1px transparent left border. With the default `border-box` background
        // clip, the selected/hover background would paint under that transparent
        // border and cover the previous button's right border (the visible
        // separator). Clipping to the padding box keeps the separator visible.
        backgroundClip: 'padding-box',
        borderColor: theme.palette.divider,
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
          borderColor: theme.palette.divider,
        },
        '&.Mui-selected': {
          color: theme.palette.primary.main,
          backgroundColor: alpha(theme.palette.background.default, 0.9),
          borderColor: theme.palette.divider,
        },
        '&.Mui-selected:hover': {
          backgroundColor: theme.palette.action.hover,
          borderColor: theme.palette.divider,
        },
        // Caller sx wins so a parent ToggleButtonGroup can flatten inner radii
        // and the separator between buttons stays crisp instead of fading
        // behind a curved corner.
        ...sx,
      }}
    >
      {children}
    </ToggleButton>
  );

  return tooltip ? <TsTooltip title={tooltip}>{button}</TsTooltip> : button;
}

export default TsToggleButton;
