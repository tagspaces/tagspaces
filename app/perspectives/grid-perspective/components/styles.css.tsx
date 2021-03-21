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
import AppConfig from '-/config';

export default (theme: any): any => ({
  gridContainer: {
    display: 'grid',
    gridGap: '0px 0px',
    padding: 0,
    paddingRight: 4,
    paddingBottom: 20
  },
  rowContainer: {
    display: 'grid',
    gridGap: '0px 0px',
    padding: 0,
    paddingRight: 4,
    margin: 0,
    paddingBottom: 10
  },
  gridCell: {
    border: '2px solid transparent',
    marginTop: 1,
    marginLeft: 2,
    marginBottom: 1,
    marginRight: 1
  },
  rowCell: {
    boxShadow: 'none',
    borderLeft: '1px solid transparent',
    borderRight: '1px solid transparent',
    borderTop: '1px solid transparent',
    borderBottom: '1px solid ' + theme.palette.divider,
    margin: 0,
    marginTop: 0,
    marginBottom: 0
  },
  rowHover: {
    '&:hover': {
      backgroundColor: theme.palette.divider + ' !important'
    }
  },
  selectedGridCell: {
    border: '2px solid' + theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + ' !important'
  },
  selectedRowCell: {
    borderRadius: 0,
    border: '1px solid' + theme.palette.primary.main + ' !important'
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
    zIndex: 100,
    maxHeight: 100,
    overflowY: 'auto',
    overflowX: 'hidden'
    // opacity: 0.9
  },
  gridCellDescription: {
    padding: 2,
    margin: 2,
    backgroundColor: theme.palette.background.paper,
    opacity: 0.6,
    wordBreak: 'break-word',
    display: 'block'
  },
  gridFileExtension: {
    padding: 5,
    paddingTop: 3,
    paddingBottom: 7,
    fontSize: 13,
    marginRight: 5,
    marginTop: 7,
    minWidth: 40,
    height: 16,
    color: 'white',
    borderRadius: 3,
    textAlign: 'center'
  },
  rowFileExtension: {
    flex: 1,
    padding: 5,
    paddingTop: 7,
    width: 35,
    maxWidth: 60,
    minHeight: 15,
    borderWidth: 1,
    color: 'white',
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: 'bold',
    borderRadius: 4,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  gridSizeDate: {
    overflow: AppConfig.isFirefox ? 'auto' : 'overlay',
    whiteSpace: 'nowrap',
    marginRight: 5,
    marginLeft: 'auto',
    paddingTop: 12
  },
  gridDetails: {
    display: 'flex',
    whiteSpace: 'nowrap'
  },
  gridFolder: {
    color: 'white',
    padding: 5,
    minHeight: 15,
    height: 20,
    borderRadius: 3
  },
  topToolbar: {
    paddingLeft: 5,
    paddingRight: 5,
    minHeight: 40,
    height: 53,
    position: 'absolute',
    zIndex: 1,
    background:
      'linear-gradient(0deg, ' +
      theme.palette.background.default +
      'AA 0%, ' +
      theme.palette.background.default +
      ' 99%)',
    backdropFilter: 'blur(5px)',
    // borderBottom: '1px solid ' + theme.palette.divider,
    width: 'calc(100% - 10px)',
    overflowX: AppConfig.isFirefox ? 'auto' : 'overlay'
  }
});
