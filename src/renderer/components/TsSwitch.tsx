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

import TsTooltip from '-/components/TsTooltip';
import { isDesktopMode } from '-/reducers/settings';
import Switch, { SwitchProps } from '@mui/material/Switch';
import { styled, Theme } from '@mui/material/styles';
import { useSelector } from 'react-redux';

export type TsSwitchProps = SwitchProps & {
  tooltip?: string;
};

type IOSSwitchProps = SwitchProps & {
  /** Enlarge the invisible tap area without changing the rendered size. */
  touchTarget?: boolean;
};

const IOSSwitch = styled(
  (props: IOSSwitchProps) => (
    <Switch
      focusVisibleClassName=".Mui-focusVisible"
      disableRipple
      {...props}
    />
  ),
  // touchTarget only drives the styles below, it must not reach the input
  { shouldForwardProp: (prop) => prop !== 'touchTarget' },
)(({ theme, size, touchTarget }: IOSSwitchProps & { theme: Theme }) => {
  const small = size === 'small';
  const width = small ? 28 : 42;
  const height = small ? 18 : 26;
  const thumbSize = small ? 14 : 22;
  const translate = width - thumbSize - 4; // 4 = 2px margin on each side
  // What receives the tap is the switch base, and here it is only as big as
  // the thumb (14px for a small switch) - far below a finger-sized target.
  // On touch layouts pad the base out and take the extra size back off with
  // a negative margin: the hit box grows to 48x34 (small) / 62x42 while the
  // switch keeps its rendered size and its exact place in the layout.
  const pad = touchTarget ? 10 : 0;
  return {
    width: width + 2 * pad,
    height: height + 2 * pad,
    padding: pad,
    margin: small ? `${4 - pad}px ${3 - pad}px` : `${6 - pad}px ${4 - pad}px`,
    '& .MuiSwitch-switchBase': {
      padding: pad,
      margin: 2,
      transitionDuration: '300ms',
      '&.Mui-checked': {
        transform: `translateX(${translate}px)`,
        color: '#fff',
        '& + .MuiSwitch-track': {
          backgroundColor: theme.palette.primary.main,
          opacity: 1,
          border: 0,
        },
        '&.Mui-disabled + .MuiSwitch-track': {
          opacity: 0.5,
        },
      },
      '&.Mui-focusVisible .MuiSwitch-thumb': {
        color: theme.palette.primary.light,
        border: '6px solid #fff',
      },
      '&.Mui-disabled .MuiSwitch-thumb': {
        color: theme.palette.grey[100],
        ...theme.applyStyles('dark', {
          color: theme.palette.grey[600],
        }),
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.7,
        ...theme.applyStyles('dark', {
          opacity: 0.3,
        }),
      },
    },
    '& .MuiSwitch-thumb': {
      boxSizing: 'border-box',
      width: thumbSize,
      height: thumbSize,
    },
    '& .MuiSwitch-track': {
      boxSizing: 'border-box',
      borderRadius: height / 2,
      backgroundColor: '#E9E9EA',
      opacity: 1,
      transition: theme.transitions.create(['background-color'], {
        duration: 500,
      }),
      ...theme.applyStyles('dark', {
        backgroundColor: '#39393D',
        border: `1px solid ${theme.palette.divider}`,
      }),
    },
  };
});

function TsSwitch(props: TsSwitchProps) {
  const { tooltip, ...rest } = props;
  const desktopMode = useSelector(isDesktopMode);
  const sw = <IOSSwitch touchTarget={!desktopMode} {...rest} />;
  return tooltip ? <TsTooltip title={tooltip}>{sw}</TsTooltip> : sw;
}

export default TsSwitch;
