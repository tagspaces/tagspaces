/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces GmbH
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

import TsSelect from '-/components/TsSelect';
import { MenuItem } from '@mui/material';
import React from 'react';
interface Props {
  maxLoops: number;
  changeMaxLoops: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function MaxLoopsSelect(props: Props) {
  const { maxLoops, changeMaxLoops } = props;
  return (
    <TsSelect
      data-tid="maxLoopsTID"
      name="maxLoops"
      fullWidth={false}
      onChange={changeMaxLoops}
      value={maxLoops}
      sx={{
        minWidth: '100px',
      }}
    >
      <MenuItem value="1">
        <span>1000</span>
      </MenuItem>
      <MenuItem value="2">
        <span>2000</span>
      </MenuItem>
      <MenuItem value="5">
        <span>5000</span>
      </MenuItem>
      <MenuItem value="10">
        <span>10000</span>
      </MenuItem>
      <MenuItem value="20">
        <span>20000</span>
      </MenuItem>
      <MenuItem value="50">
        <span>50000</span>
      </MenuItem>
      <MenuItem value="100">
        <span>100000</span>
      </MenuItem>
      <MenuItem value="150">
        <span>150000</span>
      </MenuItem>
      <MenuItem value="200">
        <span>200000</span>
      </MenuItem>
    </TsSelect>
  );
}

export default MaxLoopsSelect;
