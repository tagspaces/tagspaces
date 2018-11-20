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
 * @flow
 */

export default (theme) => ({
  panel: {
    height: '100%',
    maxHeight: '100%',
    padding: 5,
    paddingBottom: 50,
    overflowY: 'hidden',
    backgroundColor: theme.palette.background.default
  },
  fontIcon: {
    color: theme.palette.text.primary
  },
  icon: {
    margin: theme.spacing.unit
  },
  locationListArea: {
    // paddingRight: 10, // place for scroll
    paddingTop: 0,
    marginTop: 0,
    marginBottom: 10,
    maxHeight: '100%',
    overflowY: 'overlay'
  },
  taggroupsArea: {
    paddingTop: 0,
    marginTop: 0,
    height: 'calc(100% - 50px)',
    maxHeight: 'calc(100% - 50px)',
    overflowY: 'overlay'
  },
  searchArea: {
    paddingTop: 0,
    paddingLeft: 5,
    marginTop: 0,
    maxHeight: '100%',
    overflowY: 'overlay'
  },
  topShadow: {
    borderTop: '1px solid lightgray',
    height: 10,
    boxShadow: '0px -7px 20px 0px rgba(255, 255, 255, 1)'
  },
  listItem: {
    paddingLeft: 0,
    paddingTop: 2,
    paddingBottom: 2,
    paddingRight: 0,
    borderRadius: 5,
    backgroundColor: 'transparent'
  },
  listItemSelected: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: 5,
    backgroundColor: theme.palette.primary.light
  },
  panelTitle: {
    textTransform: 'uppercase',
    flex: 1,
    paddingLeft: 5,
    paddingTop: 6,
  },
  nested: {
    paddingLeft: theme.spacing.unit * 4
  },
  listItemTitleText: {
    fontWeight: 'bold',
  },
  hiddenFileInput: {
    display: 'none',
  },
  toolbar: {
    display: 'flex',
  },
  formControl: {
    width: '100%',
    marginBottom: 10
  },
  mainActionButton: {
    marginTop: 10,
    marginLeft: 0,
    paddingLeft: 8
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  }
});
