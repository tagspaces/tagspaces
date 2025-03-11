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
import AppConfig from '-/AppConfig';
import { styled } from '@mui/material/styles';

const PREFIX = 'SidePanel';
export const classes = {
  panel: `${PREFIX}-panel`,
  header: `${PREFIX}-header`,
  icon: `${PREFIX}-icon`,
  locationListArea: `${PREFIX}-locationListArea`,
  listItem: `${PREFIX}-listItem`,
  listItemSelected: `${PREFIX}-listItemSelected`,
  panelTitle: `${PREFIX}-panelTitle`,
  toolbar: `${PREFIX}-toolbar`,
  mainActionButton: `${PREFIX}-mainActionButton`,
  leftIcon: `${PREFIX}-leftIcon`,
};

export const SidePanel = styled('div')(({ theme }) => ({
  height: '100%',
  paddingLeft: 5,
  paddingRight: 0,
  [`& .${classes.header}`]: {
    color: theme.palette.text.primary,
  },
  [`& .${classes.icon}`]: {
    margin: theme.spacing(1),
  },
  [`& .${classes.locationListArea}`]: {
    paddingTop: 0,
    marginTop: 0,
    overflowY: 'auto',
  },
  [`& .${classes.listItem}`]: {
    padding: 0,
    paddingRight: 15,
    borderRadius: AppConfig.defaultCSSRadius,
  },
  [`& .${classes.listItemSelected}`]: {
    padding: 0,
    paddingRight: 15,
    borderRadius: AppConfig.defaultCSSRadius,
    backgroundColor: theme.palette.primary.light,
  },
  [`& .${classes.panelTitle}`]: {
    textTransform: 'uppercase',
    fontSize: '0.9rem',
    flex: 1,
    paddingLeft: 7,
    paddingTop: 12,
  },
  [`& .${classes.toolbar}`]: {
    display: 'flex',
  },
  [`& .${classes.mainActionButton}`]: {
    marginTop: 10,
    marginLeft: 0,
    paddingLeft: 8,
  },
  [`& .${classes.leftIcon}`]: {
    marginRight: theme.spacing(1),
  },
}));
