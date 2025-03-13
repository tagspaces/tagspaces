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

import AppConfig from '-/AppConfig';
import { isDesktopMode } from '-/reducers/settings';
import FormHelperText from '@mui/material/FormHelperText';
import { alpha, useTheme } from '@mui/material/styles';
import { TimePicker } from '@mui/x-date-pickers';
import { useSelector } from 'react-redux';

function TsTimePicker(props) {
  const { children, label } = props;
  const theme = useTheme();
  const desktopMode = useSelector(isDesktopMode);

  return (
    <div>
      {label && (
        <FormHelperText style={{ marginLeft: 5, marginTop: 0 }}>
          {label}
        </FormHelperText>
      )}
      <TimePicker
        sx={{
          backgroundColor: alpha(theme.palette.divider, 0.2),
          '&:hover': {
            backgroundColor: alpha(theme.palette.divider, 0.5),
          },
          '& .Mui-focused': {
            backgroundColor: 'transparent !important',
            borderRadius: AppConfig.defaultCSSRadius + 'px',
          },
          borderRadius: AppConfig.defaultCSSRadius + 'px',
          transition: '0.3s',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            border: '2px solid transparent !important',
            borderRadius: AppConfig.defaultCSSRadius + 'px',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: '2px solid transparent',
            borderRadius: AppConfig.defaultCSSRadius + 'px',
          },
          '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: `2px solid ${alpha(theme.palette.divider, 0.5)} !important`,
            borderRadius: AppConfig.defaultCSSRadius + 'px',
          },
        }}
        {...props}
        label={undefined}
      >
        {children}
      </TimePicker>
    </div>
  );
}

export default TsTimePicker;
