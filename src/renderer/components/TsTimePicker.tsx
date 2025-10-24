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
import { Box } from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import { alpha, useTheme } from '@mui/material/styles';
import { TimePicker } from '@mui/x-date-pickers';
import { useSelector } from 'react-redux';

function TsTimePicker(props) {
  const { label, ...restProps } = props;
  const theme = useTheme();
  const desktopMode = useSelector(isDesktopMode);

  return (
    <Box>
      {label && (
        <FormHelperText sx={{ marginLeft: '5px', marginTop: 0 }}>
          {label}
        </FormHelperText>
      )}
      <TimePicker
        sx={{
          border: '0px transparent !important',
          borderRadius: AppConfig.defaultCSSRadius,
          backgroundColor: alpha(theme.palette.divider, 0.2),
          transition: '0.3s',
          '&:hover': {
            backgroundColor: alpha(theme.palette.divider, 0.5),
          },
          '& .Mui-focused': {
            backgroundColor: 'transparent !important',
            borderRadius: AppConfig.defaultCSSRadius,
          },
          '& .MuiPickersOutlinedInput-root': {
            border: '0px solid transparent !important',
            borderRadius: AppConfig.defaultCSSRadius,
          },
          '&:hover .MuiPickersOutlinedInput-root': {
            border: '0px transparent !important',
            borderRadius: AppConfig.defaultCSSRadius,
          },
          '& .Mui-focused .MuiPickersOutlinedInput-root': {
            border: `0px solid ${alpha(theme.palette.divider, 0.5)} !important`,
            borderRadius: AppConfig.defaultCSSRadius,
          },
        }}
        {...restProps}
        label={undefined}
      />
    </Box>
  );
}

export default TsTimePicker;
