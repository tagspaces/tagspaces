/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
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
  panel: `${PREFIX}-panel`,
  fontIcon: `${PREFIX}-fontIcon`,
  header: `${PREFIX}-header`,
  icon: `${PREFIX}-icon`,
  locationListArea: `${PREFIX}-locationListArea`,
  listItem: `${PREFIX}-listItem`,
  listItemSelected: `${PREFIX}-listItemSelected`,
  panelTitle: `${PREFIX}-panelTitle`,
  toolbar: `${PREFIX}-toolbar`,
  formControl: `${PREFIX}-formControl`,
  mainActionButton: `${PREFIX}-mainActionButton`,
  leftIcon: `${PREFIX}-leftIcon`,
};

export const SidePanel = styled('div')(({ theme }) => ({
  height: '100%',
  paddingLeft: 5,
  paddingRight: 0,
  [`& .${classes.fontIcon}`]: {
    color: theme.palette.text.primary,
  },
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
    paddingLeft: 0,
    paddingTop: 2,
    paddingBottom: 2,
    paddingRight: 0,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  [`& .${classes.listItemSelected}`]: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: 5,
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
  [`& .${classes.formControl}`]: {
    width: '100%',
    marginBottom: 10,
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
