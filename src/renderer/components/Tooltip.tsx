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

import { adjustKeyBinding } from '-/components/dialogs/KeyboardDialog';
import Tooltip from '@mui/material/Tooltip';

interface Props {
  title: any;
  keyBinding?: string;
  children: any;
  classes?: any;
  placeCloser?: boolean;
  placement?:
    | 'bottom-end'
    | 'bottom-start'
    | 'bottom'
    | 'left-end'
    | 'left-start'
    | 'left'
    | 'right-end'
    | 'right-start'
    | 'right'
    | 'top-end'
    | 'top-start'
    | 'top';
}

function TooltipTS(props: Props) {
  const {
    title,
    placement = 'top',
    keyBinding,
    placeCloser = false,
    ...restProps
  } = props;
  let tooltipText = title;
  if (keyBinding) {
    tooltipText = title + ' (' + adjustKeyBinding(keyBinding) + ')';
  }
  return (
    <Tooltip
      arrow
      title={tooltipText}
      disableInteractive
      placement={placement}
      slotProps={{
        popper: {
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
      {...restProps}
    />
  );
}

export default TooltipTS;
