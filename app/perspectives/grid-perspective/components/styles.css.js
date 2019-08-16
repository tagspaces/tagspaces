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
import AppConfig from '../../../config';

export default (theme) => ({
  gridContainer: {
    display: 'grid',
    gridGap: '2px 2px',
    padding: 10,
    marginBottom: 100
  },
  rowContainer: {
    display: 'grid',
    gridGap: '0px 0px',
    padding: 0,
    paddingRight: 10,
    margin: 0,
    marginBottom: 100
  },
  gridCell: {
    // backgroundColor: theme.palette.background.paper,
    border: '2px solid transparent',
    margin: 2,
    marginBottom: 3,
    marginRight: 3,
    // borderRadius: 5
  },
  rowCell: {
    // backgroundColor: theme.palette.background.paper,
    boxShadow: 'none',
    borderLeft: '2px solid transparent',
    borderRight: '2px solid transparent',
    borderTop: '1px solid transparent',
    borderBottom: '1px solid ' + theme.palette.divider,
    margin: 0,
    marginTop: 0,
    marginBottom: 0,
    // borderRadius: 0
  },
  selectedGridCell: {
    border: '2px solid' + theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + ' !important'
  },
  selectedRowCell: {
    // borderRadius: '4px',
    border: '2px solid' + theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + ' !important'
  },
  gridCellThumb: {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  },
  gridCellTitle: {
    padding: 5,
    minHeight: 20
  },
  gridCellTags: {
    padding: 0,
    paddingTop: 5,
    zIndex: 100,
    maxHeight: 100,
    overflowY: 'auto',
    overflowX: 'hidden',
    opacity: 0.6
  },
  gridCellDescription: {
    padding: 2,
    margin: 2,
    backgroundColor: theme.palette.background.paper,
    opacity: 0.6,
    // borderRadius: 5
  },
  gridFileExtension: {
    flex: 1,
    padding: 5,
    marginRight: 5,
    maxWidth: 50,
    minWidth: 40,
    minHeight: 16,
    // borderRadius: 3,
    borderWidth: 1,
    color: 'white',
    // color: theme.palette.getContrastText(),
    textAlign: 'center'
  },
  rowFileExtension: {
    flex: 1,
    padding: 5,
    marginTop: 5,
    marginRight: 5,
    marginLeft: 5,
    // borderRadius: 3,
    maxWidth: 45,
    minHeight: 15,
    borderWidth: 1,
    color: 'white',
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: 'bold',
    // color: theme.palette.getContrastText(),
    textAlign: 'center'
  },
  gridSizeDate: {
    overflow: AppConfig.isFirefox ? 'auto' : 'overlay',
    flex: 3,
    textAlign: 'right',
    whiteSpace: 'nowrap',
    marginRight: 5,
    paddingTop: 5
  },
  gridDetails: {
    display: 'flex',
    whiteSpace: 'nowrap'
  },
  rowFolder: {
    color: 'white',
    padding: 5,
    marginRight: 5,
    marginTop: 5,
    minHeight: 10,
    height: 20,
    // borderRadius: 3
  },
  gridFolder: {
    color: 'white',
    padding: 5,
    marginRight: 5,
    minHeight: 10,
    height: 20,
    // borderRadius: 3
  },
  topToolbar: {
    paddingLeft: 5,
    paddingRight: 5,
    minHeight: 40,
    height: 53,
    backgroundColor: theme.palette.background.default,
    borderBottom: '1px solid ' + theme.palette.divider,
    width: '100%',
    overflowX: AppConfig.isFirefox ? 'auto' : 'overlay'
  }
});
