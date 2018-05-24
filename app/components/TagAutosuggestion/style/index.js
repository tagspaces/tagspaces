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

export default () => ({
  component: {
    position: 'relative',
    width: '640px',
    height: '260px',
    maxWidth: '100%',
    overflow: 'visible'
  },
  componentTip: {
    display: 'none',
    padding: '10px 0 0 0',
    fontSize: '12px',
    color: '#f44336',
    '&.active': {
      display: 'block'
    }
  },
  fieldContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  fieldBox: {
    width: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tagField: {
    width: '100%'
  },
  addTagButton: {
    width: '120px',
    margin: '16px 0 0 16px'
  },
  suggestions: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    margin: '0 auto',
    width: 'calc(100% - 2px)',
    maxHeight: '200px',
    overflowY: 'overlay',
    overflowX: 'hidden',
    display: 'none',
    backgroundColor: '#fff',
    zIndex: 100,
    boxShadow: '0 1px 1px 0 rgba(0, 0, 0, 0.16),0 1px 1px 0 rgba(239, 239, 239, 0.12)',
    '&.active': {
      display: 'block'
    }
  },
  addSuggestion: {
    width: '100%',
    border: 'none',
    backgroundColor: 'transparent',
    textAlign: 'left',
    transition: 'all 0.15s ease-in-out',
    padding: '12px',
    '&:not(:last-child)': {
      borderBottom: '1px solid rgba(0, 0, 0, 0.16)'
    },
    '&:hover, &:active, &:focus': {
      border: 'none',
      outline: 'none',
      cursor: 'pointer',
      backgroundColor: '#1dd19f',
      color: '#fff',
      transition: 'all 0.15s ease-in-out'
    }
  },
  tags: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    padding: '10px 0 0 0',
    margin: 0,
    backgroundColor: '#f9f7f7',
    borderRadius: 4,
    '&.active': {
      margin: '20px 0 0 0'
    }
  },
  tag: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: '4px',
    backgroundColor: '#008000',
    color: 'white',
    padding: '2px 6px',
    boxShadow: '0 1px 1px 0 rgba(0, 0, 0, 0.16),0 1px 1px 0 rgba(239, 239, 239, 0.12)',
    margin: '0 0 10px 10px'
  },
  removeTagButton: {
    border: 'none',
    backgroundColor: '#008000',
    padding: 0,
    position: 'relative',
    left: 4,
    top: 1,
    '&:hover, &:active, &:focus': {
      cursor: 'pointer',
      outline: 'none'
    }
  }
});
