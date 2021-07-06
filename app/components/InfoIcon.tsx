/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
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
import IconButton from '@material-ui/core/IconButton';
import HelpIcon from '@material-ui/icons/InfoOutlined';
import Tooltip from '@material-ui/core/Tooltip';

interface Props {
  tooltip?: string;
}

const InfoIcon = (props: Props) => {
  const { tooltip } = props;
  return (
    <Tooltip arrow title={tooltip}>
      <IconButton edge="end" aria-label="delete">
        <HelpIcon />
      </IconButton>
    </Tooltip>
  );
};

export default InfoIcon;
