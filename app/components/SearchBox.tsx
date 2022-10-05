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

import React, { useEffect, useRef, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import makeStyles from '@mui/styles/makeStyles';
import ClearSearchIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import Tooltip from '-/components/Tooltip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import {
  escapeRegExp,
  parseTextQuery,
  removeAllTagsFromSearchQuery
} from '@tagspaces/tagspaces-platforms/misc';
import { actions as AppActions, getDirectoryPath } from '../reducers/app';
import {
  actions as LocationIndexActions,
  getIndexedEntriesCount,
  isIndexing,
  getSearchQuery
} from '../reducers/location-index';
import {
  isDesktopMode,
  getMaxSearchResults,
  getShowUnixHiddenEntries,
  getCurrentLanguage
} from '-/reducers/settings';
import i18n from '-/services/i18n';
import { FileTypeGroups } from '-/services/search';
import { TS } from '-/tagspaces.namespace';
import { Pro } from '../pro';
import useFirstRender from '-/utils/useFirstRender';
import MainSearchField from '-/components/MainSearchField';
import SavedSearchesMenu from '-/components/menus/SavedSearchesMenu';
import SearchInline from '-/components/SearchInline';
import AdvancedSearchIcon from '@mui/icons-material/ManageSearch';
import Popover from '@mui/material/Popover';
import SearchPopover from '-/components/SearchPopover';
import SearchIcon from '@mui/icons-material/Search';
import withStyles from '@mui/styles/withStyles';

// type PropsClasses = Record<keyof StyleProps, string>;

interface Props {
  open: boolean;
  setAnchorSearch: (HTMLButtonElement) => void;
  anchorSearch: HTMLButtonElement | null;
}

const CustomButton: any = withStyles(theme => ({
  root: {
    // borderRadius: 15,
    // minWidth: 45,
    // height: 40
  }
}))(IconButton);

function SearchBox(props: Props) {
  return (
    <>
      <SearchInline open={props.open} />
      {props.open && (
        <>
          <Tooltip title={i18n.t('core:advancedSearch')}>
            <CustomButton
              id="advancedButton"
              data-tid="advancedSearch"
              onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
                props.setAnchorSearch(event.currentTarget)
              }
            >
              <AdvancedSearchIcon />
            </CustomButton>
          </Tooltip>
          <Popover
            open={Boolean(props.anchorSearch)}
            anchorEl={props.anchorSearch}
            onClose={() => props.setAnchorSearch(null)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            PaperProps={{
              style: {
                overflow: 'hidden',
                height: 720
              }
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
          >
            <SearchPopover onClose={() => props.setAnchorSearch(null)} />
          </Popover>
        </>
      )}
    </>
  );
}

export default SearchBox;
