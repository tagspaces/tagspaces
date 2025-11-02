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
import { CloseIcon, CreateFileIcon, EditIcon } from '-/components/CommonIcons';
import EditSearchQuery from '-/components/EditSearchQuery';
import TooltipTS from '-/components/Tooltip';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import TsSelect from '-/components/TsSelect';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { useSavedSearchesContext } from '-/hooks/useSavedSearchesContext';
import { useSearchQueryContext } from '-/hooks/useSearchQueryContext';
import { isDesktopMode } from '-/reducers/settings';
import { openURLExternally } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Links from 'assets/links';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

interface Props {
  style?: any;
  //hideDrawer?: () => void;
  onClose: () => void;
}

function SearchPopover(props: Props) {
  const { t } = useTranslation();
  const { onClose } = props;
  const desktopMode = useSelector(isDesktopMode);
  const { openCurrentDirectory, setSearchQuery, exitSearchMode } =
    useDirectoryContentContext();
  const { searches } = useSavedSearchesContext();
  const {
    tempSearchQuery,
    setTempSearchQuery,
    openSaveSearchDialog,
    executeSearch,
  } = useSearchQueryContext();
  const { getIndex, isIndexing } = useLocationIndexContext();

  const handleSavedSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { target } = event;
    const { value } = target;
    const savedSearch: TS.SearchQuery = searches.find(
      (search) => search.uuid === value,
    );
    if (!savedSearch) {
      return true;
    }
    setTempSearchQuery({ ...savedSearch }, true);
  };

  const clearSearch = () => {
    onClose();
    openCurrentDirectory().then(() => {
      setSearchQuery({});
      exitSearchMode();
    });
  };

  const indexStatus = getIndex()
    ? '(' + getIndex().length + ' indexed entries)'
    : t('core:indexEmpty');
  return (
    <div
      style={
        {
          maxWidth: 400,
          height: '100%',
          paddingLeft: 5,
          paddingRight: 0,
          WebkitAppRegion: 'no-drag',
        } as React.CSSProperties & { WebkitAppRegion?: string }
      }
    >
      <div style={{ display: 'flex' }}>
        <Typography variant="button" sx={{ margin: '12px 0 10px 10px' }}>
          {t('core:advancedSearch')}
        </Typography>
        <Typography
          variant="caption"
          sx={{ flex: 1, margin: 'auto', paddingLeft: '10px' }}
        >
          {indexStatus}
        </Typography>
        <TsIconButton
          sx={{ marginLeft: 'auto', height: '40px' }}
          data-tid="closeSearchTID"
          onClick={onClose}
        >
          <CloseIcon />
        </TsIconButton>
      </div>
      <div
        style={{
          paddingTop: 0,
          paddingLeft: 10,
          paddingRight: 10,
          marginTop: 0,
          height: 'calc(100% - 90px)',
          maxHeight: 'calc(100% - 90px)',
          overflowX: 'hidden',
          overflowY: 'auto',
          scrollbarGutter: 'stable',
        }}
        data-tid="searchAdvancedTID"
      >
        <Grid
          container
          spacing={2}
          style={{ marginBottom: 15 }}
          direction="row"
          justifyContent="center"
          alignItems="flex-end"
        >
          <Grid size={9}>
            <TooltipTS title={t('storedSearchQueriesTooltip')}>
              <FormControl
                variant="outlined"
                sx={{ width: '100%', marginTop: '6px' }}
              >
                <FormHelperText sx={{ marginLeft: 0 }}>
                  {t('core:savedSearchesTitle')}
                </FormHelperText>
                <TsSelect
                  name="savedSearch"
                  disabled={isIndexing !== undefined}
                  onChange={handleSavedSearchChange}
                  value={tempSearchQuery.uuid ? tempSearchQuery.uuid : -1}
                >
                  <MenuItem value={-1} sx={{ display: 'none' }} />
                  {searches.length < 1 && (
                    <MenuItem>{t('noSavedSearches')}</MenuItem>
                  )}
                  {searches.map((search) => (
                    <MenuItem key={search.uuid} value={search.uuid}>
                      <span style={{ width: '100%' }}>{search.title}</span>
                    </MenuItem>
                  ))}
                </TsSelect>
              </FormControl>
            </TooltipTS>
          </Grid>
          <Grid
            size={3}
            style={{ display: 'flex', alignSelf: 'center', paddingTop: 25 }}
          >
            <ButtonGroup
              sx={{
                textAlign: 'center',
                width: '100%',
              }}
            >
              {tempSearchQuery.uuid && (
                <TsIconButton
                  tooltip={t('editSavedSearchTitle')}
                  data-tid="editSearchBtnTID"
                  onClick={() => openSaveSearchDialog(tempSearchQuery.uuid)}
                >
                  <EditIcon />
                </TsIconButton>
              )}
              <TsIconButton
                tooltip={t('createNewSavedSearchTitle')}
                data-tid="addSearchBtnTID"
                onClick={() => openSaveSearchDialog('new_from_search')}
              >
                <CreateFileIcon />
              </TsIconButton>
            </ButtonGroup>
          </Grid>
          <Grid size={12}>
            <EditSearchQuery />
          </Grid>
        </Grid>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: AppConfig.defaultSpaceBetweenButtons,
          paddingTop: 0,
        }}
      >
        <TsButton
          data-tid="helpSearchButtonTID"
          onClick={() =>
            openURLExternally(Links.documentationLinks.search, true)
          }
        >
          {t('help')}
        </TsButton>
        <div>
          <TsButton onClick={clearSearch} id="resetSearchButton">
            {t('resetBtn')}
          </TsButton>
          <TsButton
            sx={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}
            variant="contained"
            disabled={isIndexing !== undefined}
            id="searchButtonAdvTID"
            onClick={() => {
              executeSearch();
              onClose();
            }}
          >
            {isIndexing !== undefined
              ? 'Search disabled while indexing'
              : t('searchTitle')}
          </TsButton>
        </div>
      </div>
    </div>
  );
}

export default SearchPopover;
