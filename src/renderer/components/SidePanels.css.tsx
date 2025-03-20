/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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
import { styled } from '@mui/material/styles';

const PREFIX = 'SidePanel';
export const classes = {
  panelTitle: `${PREFIX}-panelTitle`,
};

export const SidePanel = styled('div')(({ theme }) => ({
  height: '100%',
  paddingLeft: 5,
  paddingRight: 0,
  [`& .${classes.panelTitle}`]: {
    textTransform: 'uppercase',
    fontSize: '0.9rem',
    flex: 1,
    paddingLeft: 7,
    paddingTop: 12,
  },
}));
