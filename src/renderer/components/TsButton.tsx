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
import LoadingButton from '@mui/lab/LoadingButton';
import Button, {
  ButtonProps,
  ButtonPropsVariantOverrides,
} from '@mui/material/Button';
import { OverridableStringUnion } from '@mui/types';
import React from 'react';
import { useSelector } from 'react-redux';

export type TSButtonProps = ButtonProps & {
  tooltip?: string;
  variant?: OverridableStringUnion<
    'text' | 'outlined' | 'contained',
    ButtonPropsVariantOverrides
  >;
  loading?: boolean;
  startIcon?: React.ReactNode;
};

function TsButton(props: TSButtonProps) {
  const { children, style, tooltip, loading, startIcon, ...rest } = props;
  const desktopMode = useSelector(isDesktopMode);
  let button;
  if (loading !== undefined) {
    button = (
      <LoadingButton
        loading={loading}
        size={desktopMode ? 'small' : 'medium'}
        variant="outlined"
        {...(startIcon && { startIcon: startIcon, loadingPosition: 'start' })}
        {...rest}
        style={{
          borderRadius: AppConfig.defaultCSSRadius,
          textTransform: 'none', // 'capitalize',
          fontSize: 14,
          fontWeight: 'normal',
          // width: 100,
          // textOverflow: 'ellipsis',
          // overflow: 'hidden',
          ...style,
        }}
      >
        {children}
      </LoadingButton>
    );
  } else {
    button = (
      <Button
        size={desktopMode ? 'small' : 'medium'}
        {...(startIcon && { startIcon: startIcon })}
        variant="outlined" // text outlined contained
        {...rest}
        style={{
          borderRadius: AppConfig.defaultCSSRadius,
          textTransform: 'none', //'capitalize',
          fontSize: 14,
          fontWeight: 'normal',
          ...style,
        }}
      >
        {children}
      </Button>
    );
  }
  return tooltip ? <TooltipTS title={tooltip}>{button}</TooltipTS> : button;
}

export default TsButton;
