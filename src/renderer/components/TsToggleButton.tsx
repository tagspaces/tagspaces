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
import { ToggleButton } from '@mui/material';
import { ButtonPropsVariantOverrides } from '@mui/material/Button';
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
  const desktopMode = useSelector(isDesktopMode);
  let button = (
    <ToggleButton
      size={desktopMode ? 'small' : 'medium'}
      variant="outlined" // text outlined contained
      {...rest}
      sx={{
        borderRadius: AppConfig.defaultCSSRadius,
        textTransform: 'none', //'capitalize',
        fontSize: 14,
        // fontWeight: selected ? 'bold' : 'normal',
        fontWeight: 'normal',
        ...sx,
      }}
    >
      {children}
    </ToggleButton>
  );

  return tooltip ? <TooltipTS title={tooltip}>{button}</TooltipTS> : button;
}

export default TsToggleButton;
