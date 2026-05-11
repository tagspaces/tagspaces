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

import AppConfig from '-/AppConfig';
import { adjustKeyBinding } from '-/components/dialogs/KeyboardDialog';
import Tooltip, { TooltipProps } from '@mui/material/Tooltip';

export type TsTooltipProps = Omit<TooltipProps, 'title'> & {
  title: React.ReactNode;
  keyBinding?: string;
  placeCloser?: boolean;
};

function TsTooltip(props: TsTooltipProps) {
  const {
    title,
    placement = 'top',
    keyBinding,
    placeCloser = false,
    arrow = true,
    ...rest
  } = props;
  const tooltipText = keyBinding
    ? `${title} (${adjustKeyBinding(keyBinding)})`
    : title;
  return (
    <Tooltip
      arrow={arrow}
      title={tooltipText}
      disableInteractive
      placement={placement}
      slotProps={{
        popper: {
          sx: {
            '& .MuiTooltip-tooltip': {
              borderRadius: AppConfig.defaultCSSRadius,
            },
          },
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, placeCloser ? -12 : -6],
              },
            },
          ],
        },
      }}
      {...rest}
    />
  );
}

export default TsTooltip;
