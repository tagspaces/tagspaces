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

import React from 'react';
import { InfoTooltipIcon } from '-/components/CommonIcons';
import Button from '@mui/material/Button';
import Tooltip from '-/components/Tooltip';

interface Props {
  tagTitle?: string;
  textColor?: string;
  backgroundColor?: string;
  isDragging?: boolean;
  children?: any;
}

function Tag(props: Props) {
  const { tagTitle, textColor, backgroundColor, isDragging, children } = props;
  return (
    <Tooltip title={tagTitle}>
      <Button
        size="small"
        style={{
          opacity: isDragging ? 0.5 : 1,
          fontSize: 13,
          fontWeight: 'normal',
          lineHeight: '10px',
          textTransform: 'none',
          textWrap: 'nowrap',
          whiteSpace: 'nowrap',
          color: textColor,
          backgroundColor: backgroundColor,
          minHeight: 18,
          minWidth: 0,
          margin: 2,
          paddingTop: 0,
          paddingBottom: 0,
          paddingRight: 0,
          paddingLeft: 5,
          borderRadius: 5,
        }}
      >
        {children}
      </Button>
    </Tooltip>
  );
}

export default Tag;
