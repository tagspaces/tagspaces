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

import { Typography } from '@mui/material';
import { ButtonProps } from '@mui/material/Button';
import React from 'react';
import TooltipTS from './Tooltip';

export type TSButtonProps = ButtonProps & {
  title: string;
  tooltip?: string;
  menuButton?: React.ReactNode;
};

function SidePanelTitle(props: TSButtonProps) {
  const { title, tooltip, menuButton, ...rest } = props;
  return (
    <div
      style={{
        display: 'flex',
        paddingRight: 5, //AppConfig.defaultSpaceBetweenButtons,
      }}
    >
      <TooltipTS title={tooltip}>
        <Typography
          variant="subtitle1"
          sx={{
            textTransform: 'uppercase',
            fontSize: '0.9rem',
            flex: 1,
            paddingLeft: '7px',
            paddingTop: '12px',
          }}
        >
          {title}
        </Typography>
      </TooltipTS>
      {menuButton && menuButton}
    </div>
  );
}

export default SidePanelTitle;
