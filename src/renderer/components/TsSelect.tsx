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
import { isDesktopMode } from '-/reducers/settings';
import FormHelperText from '@mui/material/FormHelperText';
import { TextFieldProps } from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';

type TSSelectProps = TextFieldProps & {};

function TsSelect(props: TSSelectProps) {
  const { children, label } = props;
  const theme = useTheme();
  const desktopMode = useSelector(isDesktopMode);

  return (
    <div>
      <FormHelperText style={{ marginLeft: 0, marginTop: 0 }}>
        {label}
      </FormHelperText>
      <TsTextField
        style={{
          cursor: 'context-menu',
          marginTop: 0,
        }}
        select
        {...props}
        label={undefined}
      >
        {children}
      </TsTextField>
    </div>
  );
}

export default TsSelect;
