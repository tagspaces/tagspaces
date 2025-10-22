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
import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const FileExtBadge = styled(Typography)(({ theme }) => ({
  fontSize: '12px',
  minWidth: 40,
  color: 'white',
  borderRadius: AppConfig.defaultCSSRadius,
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textShadow: '1px 1px #8f8f8f',
  height: 28,
  alignSelf: 'center',
  textTransform: 'uppercase',
}));

export default FileExtBadge;
