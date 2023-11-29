import React from 'react';
import { MenuItem, Select } from '@mui/material';

interface Props {
  maxLoops: number;
  changeMaxLoops: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function MaxLoopsSelect(props: Props) {
  const { maxLoops, changeMaxLoops } = props;
  return (
    <Select
      data-tid="maxLoopsTID"
      name="maxLoops"
      onChange={changeMaxLoops}
      value={maxLoops}
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
    </Select>
  );
}

export default MaxLoopsSelect;
