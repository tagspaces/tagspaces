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
import { useSelector } from 'react-redux';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import { isDesktopMode } from '-/reducers/settings';

type TSTextFieldProps = TextFieldProps & {
  updateValue?: (string) => void;
  retrieveValue?: () => string;
};

function TsSelect(props: TSTextFieldProps) {
  const { children, label } = props;
  const desktopMode = useSelector(isDesktopMode);

  return (
    <>
      <FormHelperText style={{ marginLeft: 0, marginTop: 0 }}>
        {label}
      </FormHelperText>
      <TextField
        style={{ cursor: 'context-menu', marginTop: 0 }}
        margin="dense"
        size={desktopMode ? 'small' : 'medium'}
        variant="outlined"
        select
        fullWidth={true}
        {...props}
        label={undefined}
      >
        {children}
      </TextField>
    </>
  );
}

export default TsSelect;
