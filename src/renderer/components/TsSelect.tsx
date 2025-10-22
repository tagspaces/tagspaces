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

import TsTextField from '-/components/TsTextField';
import { Box } from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import { TextFieldProps } from '@mui/material/TextField';

type TSSelectProps = TextFieldProps & {};

function TsSelect(props: TSSelectProps) {
  const { children, label, fullWidth = true, ...restProps } = props;

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      <FormHelperText sx={{ marginLeft: '5px', marginTop: 0 }}>
        {label}
      </FormHelperText>
      <TsTextField
        slotProps={{
          select: { displayEmpty: true },
        }}
        sx={{
          cursor: 'context-menu',
          marginTop: 0,
        }}
        fullWidth={fullWidth}
        select
        {...restProps}
        label={undefined}
      >
        {children}
      </TsTextField>
    </Box>
  );
}

export default TsSelect;
