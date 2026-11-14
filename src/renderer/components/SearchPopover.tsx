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
import {
  CloseIcon,
  EditIcon,
  ReloadIcon,
  SaveIcon,
} from '-/components/CommonIcons';
import EditSearchQuery from '-/components/EditSearchQuery';
import TsTooltip from '-/components/TsTooltip';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import TsSelect from '-/components/TsSelect';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { useSavedSearchesContext } from '-/hooks/useSavedSearchesContext';
import { useSearchQueryContext } from '-/hooks/useSearchQueryContext';
import { openURLExternally } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { Box } from '@mui/material';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Links from 'assets/links';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  /** close after the search was executed */
  onClose: () => void;
  /** close without searching, keeping the edited query as a draft */
  onDismiss: () => void;
}

function SearchPopover(props: Props) {
  const { t } = useTranslation();
  const { onClose, onDismiss } = props;
  const { currentLocation } = useCurrentLocationContext();
  const { searches } = useSavedSearchesContext();
  const {
    tempSearchQuery,
    setTempSearchQuery,
    openSaveSearchDialog,
    executeSearch,
  } = useSearchQueryContext();
  const { getIndex, isIndexing, createLocationIndex } =
    useLocationIndexContext();

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

  /** Clears the form only — the search mode and its results stay */
  const resetForm = () => {
    setTempSearchQuery(
      {
        textQuery: '',
        searchBoxing: tempSearchQuery.searchBoxing || 'location',
        searchType: 'fuzzy',
      },
      true,
    );
  };

  const rebuildIndex = () => {
    createLocationIndex(currentLocation, true, undefined, undefined, true);
  };

  const indexing = isIndexing !== undefined;
  const index = getIndex();
  const indexStatus = index
    ? t('core:indexedEntriesCount', { count: index.length })
    : t('core:indexEmpty');
  const rebuildDisabled =
    indexing || !currentLocation || currentLocation.isReadOnly;

  return (
    <Box
      sx={
        {
          width: 400,
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          flex: 1,
          paddingLeft: '5px',
          WebkitAppRegion: 'no-drag',
        } as any
      }
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Typography
          variant="caption"
          noWrap
          title={indexStatus}
          sx={{
            flex: 1,
            minWidth: 0,
            paddingLeft: '10px',
            color: 'text.secondary',
          }}
          data-tid="indexStatusTID"
        >
          {indexStatus}
        </Typography>
        <TsButton
          data-tid="rebuildIndexTID"
          variant="text"
          size="small"
          disabled={rebuildDisabled}
          tooltip={
            currentLocation?.isReadOnly
              ? t('core:readOnlyLocationIndexDisabled')
              : t('core:forceReindexTooltip')
          }
          startIcon={<ReloadIcon fontSize="small" />}
          onClick={rebuildIndex}
        >
          {t('core:rebuildIndex')}
        </TsButton>
        <TsIconButton
          sx={{ height: '40px' }}
          data-tid="closeSearchTID"
          onClick={onDismiss}
        >
          <CloseIcon />
        </TsIconButton>
      </Box>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          paddingLeft: '10px',
          paddingRight: '10px',
          overflowX: 'hidden',
          overflowY: 'auto',
          scrollbarGutter: 'stable',
        }}
        data-tid="searchAdvancedTID"
      >
        <Grid
          container
          spacing={2}
          direction="row"
          sx={{
            justifyContent: 'center',
            alignItems: 'flex-end',
            marginBottom: '15px',
          }}
        >
          <Grid size={9}>
            <TsTooltip title={t('storedSearchQueriesTooltip')}>
              <FormControl
                variant="outlined"
                sx={{ width: '100%', marginTop: '6px' }}
              >
                <FormHelperText sx={{ marginLeft: 0 }}>
                  {t('core:savedSearchesTitle')}
                </FormHelperText>
                <TsSelect
                  name="savedSearch"
                  disabled={indexing}
                  onChange={handleSavedSearchChange}
                  value={tempSearchQuery.uuid ? tempSearchQuery.uuid : -1}
                >
                  <MenuItem value={-1} sx={{ display: 'none' }} />
                  {searches.length < 1 && (
                    <MenuItem>{t('noSavedSearches')}</MenuItem>
                  )}
                  {searches.map((search) => (
                    <MenuItem
                      sx={{ width: '100%' }}
                      key={search.uuid}
                      value={search.uuid}
                    >
                      {search.title}
                    </MenuItem>
                  ))}
                </TsSelect>
              </FormControl>
            </TsTooltip>
          </Grid>
          <Grid
            size={3}
            sx={{ display: 'flex', alignSelf: 'center', paddingTop: '25px' }}
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
                <SaveIcon />
              </TsIconButton>
            </ButtonGroup>
          </Grid>
          <Grid size={12}>
            <EditSearchQuery />
          </Grid>
        </Grid>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: AppConfig.defaultSpaceBetweenButtons,
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
          <TsButton
            onClick={resetForm}
            id="resetSearchButton"
            tooltip={t('core:resetSearchFormTooltip')}
          >
            {t('resetBtn')}
          </TsButton>
          <TsButton
            sx={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}
            variant="contained"
            disabled={indexing}
            id="searchButtonAdvTID"
            onClick={() => {
              executeSearch();
              onClose();
            }}
          >
            {indexing
              ? t('core:searchDisabledWhileIndexing')
              : t('searchTitle')}
          </TsButton>
        </div>
      </Box>
    </Box>
  );
}

export default SearchPopover;
