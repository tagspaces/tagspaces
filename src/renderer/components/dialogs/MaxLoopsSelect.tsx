import React from 'react';
import { MenuItem } from '@mui/material';
import TsSelect from '-/components/TsSelect';
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
      style={{
        minWidth: 100,
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
