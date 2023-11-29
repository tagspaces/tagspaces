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
import { alpha, styled } from '@mui/material/styles';

const PREFIX = 'GridStyles';
export const classes = {
  gridCell: `${PREFIX}-gridCell`,
  rowCell: `${PREFIX}-rowCell`,
  rowHover: `${PREFIX}-rowHover`,
  selectedGridCell: `${PREFIX}-selectedGridCell`,
  selectedRowCell: `${PREFIX}-selectedRowCell`,
  gridCellThumb: `${PREFIX}-gridCellThumb`,
  gridCellTitle: `${PREFIX}-gridCellTitle`,
  gridCellTags: `${PREFIX}-gridCellTags`,
  gridCellDescription: `${PREFIX}-gridCellDescription`,
  gridFileExtension: `${PREFIX}-gridFileExtension`,
  gridSizeDate: `${PREFIX}-gridSizeDate`,
  gridDetails: `${PREFIX}-gridDetails`,
  gridFolder: `${PREFIX}-gridFolder`,
  topToolbar: `${PREFIX}-topToolbar`,
};

export const GridStyles = styled('div')(({ theme }) => ({
  // rowContainer: {
  //   display: 'grid',
  //   gridGap: '0px 0px',
  //   padding: 0,
  //   margin: 0,
  //   paddingBottom: 10
  // },
  [`& .${classes.gridCell}`]: {
    border: '2px solid transparent',
    marginTop: 1,
    marginLeft: 2,
    marginBottom: 1,
    marginRight: 1,
  },
  [`& .${classes.rowCell}`]: {
    boxShadow: 'none',
    borderLeft: '1px solid transparent',
    borderRight: '1px solid transparent',
    borderTop: '1px solid transparent',
    borderBottom: '1px solid ' + theme.palette.divider,
    margin: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  [`& .${classes.rowHover}`]: {
    '&:hover': {
      backgroundColor: theme.palette.divider + ' !important',
    },
  },
  [`& .${classes.selectedGridCell}`]: {
    border: '2px solid' + theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + ' !important',
  },
  [`& .${classes.selectedRowCell}`]: {
    border: '1px solid' + theme.palette.primary.main + ' !important',
  },
  [`& .${classes.gridCellThumb}`]: {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    borderRadius: 5,
    marginBottom: 5,
  },
  [`& .${classes.gridCellTitle}`]: {
    padding: '0px 5px 0 5px',
    minHeight: 45,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  [`& .${classes.gridCellTags}`]: {
    padding: 0,
    paddingTop: 2,
    height: 100,
    overflowY: 'auto',
    overflowX: 'hidden',
    position: 'relative',
  },
  [`& .${classes.gridCellDescription}`]: {
    padding: 2,
    margin: 2,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 5,
    opacity: 0.6,
    wordBreak: 'break-word',
    display: 'block',
  },
  [`& .${classes.gridFileExtension}`]: {
    paddingTop: 1,
    paddingBottom: 7,
    paddingLeft: 3,
    paddingRight: 3,
    fontSize: 13,
    marginRight: 5,
    marginTop: 7,
    minWidth: 35,
    height: 16,
    color: 'white',
    borderRadius: 3,
    textAlign: 'center',
  },
  [`& .${classes.gridSizeDate}`]: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    marginRight: 5,
    marginLeft: 'auto',
    paddingTop: 12,
  },
  [`& .${classes.gridDetails}`]: {
    display: 'flex',
    whiteSpace: 'nowrap',
  },
  [`& .${classes.gridFolder}`]: {
    color: 'white',
    padding: 5,
    minHeight: 15,
    height: 20,
    borderRadius: 3,
  },
  [`& .${classes.topToolbar}`]: {
    paddingLeft: 5,
    paddingRight: 5,
    minHeight: 40,
    height: 53,
    position: 'absolute',
    zIndex: 1,
    background:
      'linear-gradient(0deg, ' +
      alpha(theme.palette.background.default, 0.67) +
      ' 0%, ' +
      theme.palette.background.default +
      ' 99%)',
    backdropFilter: 'blur(5px)',
    // borderBottom: '1px solid ' + theme.palette.divider,
    width: 'calc(100% - 10px)',
    overflowX: 'auto',
    overflowY: 'hidden',
  },
}));
