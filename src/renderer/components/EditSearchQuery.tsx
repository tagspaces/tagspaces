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
import { getSearchTypeGroupExts } from '-/services/utils-io';
import {
  AllLocationsIcon,
  ArchiveIcon,
  AudioIcon,
  BookIcon,
  BookmarkIcon,
  CaseSensitiveMatchIcon,
  DocumentIcon,
  EmailIcon,
  ExactMatchIcon,
  FileIcon,
  FolderIcon,
  InfoTooltipIcon,
  LocalLocationIcon,
  NoteIcon,
  PictureIcon,
  SimilarMatchIcon,
  UntaggedIcon,
  VideoIcon,
} from '-/components/CommonIcons';
import TagsSelect from '-/components/TagsSelect';
import TsTooltip from '-/components/TsTooltip';
import TsDatePicker from '-/components/TsDatePicker';
import TsIconButton from '-/components/TsIconButton';
import TsSelect from '-/components/TsSelect';
import TsTextField from '-/components/TsTextField';
import TsToggleButton from '-/components/TsToggleButton';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { useSearchQueryContext } from '-/hooks/useSearchQueryContext';
import { Pro } from '-/pro';
import { isDesktopMode } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { ListItemText, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { formatFileSize } from '@tagspaces/tagspaces-common/misc';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

/** [example, i18n key of its explanation] for the extended search syntax */
const searchTips: Array<[string, string]> = [
  ['sun', 'searchTipFuzzy'],
  ['=sun', 'searchTipExact'],
  ['"sun and beach"', 'searchTipPhrase'],
  ["'sun 'beach", 'searchTipOr'],
  ['!sun', 'searchTipNot'],
  ['^sun', 'searchTipStartsWith'],
  ['!^sun', 'searchTipNotStartsWith'],
  ['.pdf$', 'searchTipEndsWith'],
  ['!.pdf$', 'searchTipNotEndsWith'],
];

interface Props {
  executeSearchOnEnter?: boolean;
}

/** icon in front of a scope / accuracy toggle label */
const toggleIconSx = { marginRight: '4px', flexShrink: 0 };

function EditSearchQuery(props: Props) {
  const { t } = useTranslation();
  const { executeSearchOnEnter } = props;
  const [showTips, setShowTips] = useState<boolean>(false);
  const desktopMode = useSelector(isDesktopMode);
  const { tempSearchQuery, setTempSearchQuery, clearSearch, executeSearch } =
    useSearchQueryContext();
  const { isIndexing } = useLocationIndexContext();

  const workSpacesContext = Pro?.contextProviders?.WorkSpacesContext
    ? useContext<TS.WorkSpacesContextData>(
        Pro.contextProviders.WorkSpacesContext,
      )
    : undefined;
  const currentWorkSpace =
    workSpacesContext && workSpacesContext.getCurrentWorkSpace
      ? workSpacesContext?.getCurrentWorkSpace()
      : undefined;

  const handleFileSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value, name } = target;
    setTempSearchQuery({ fileSize: value });
  };

  const handleLastModifiedChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { target } = event;
    const { value, name } = target;

    setTempSearchQuery({ lastModified: value });
  };

  const handleDateCreatedChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { target } = event;
    const { value, name } = target;

    setTempSearchQuery({ dateCreated: value });
  };

  function removeTags(tagsArray, removeTagsArray) {
    // eslint-disable-next-line react/no-access-state-in-setstate
    return tagsArray.filter((tag) =>
      removeTagsArray.some((valueTag) => valueTag.title !== tag.title),
    );
  }

  const handleTagFieldChange = (name, value, reason) => {
    let sq;
    if (reason === 'remove-value') {
      if (name === 'tagsAND') {
        const tags = removeTags(tempSearchQuery.tagsAND, value);
        sq = tags ? { tagsAND: tags } : undefined;
      } else if (name === 'tagsNOT') {
        const tags = removeTags(tempSearchQuery.tagsNOT, value);
        sq = tags ? { tagsNOT: tags } : undefined;
      } else if (name === 'tagsOR') {
        const tags = removeTags(tempSearchQuery.tagsOR, value);
        sq = tags ? { tagsOR: tags } : undefined;
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (name === 'tagsAND') {
        sq = { tagsAND: value };
      } else if (name === 'tagsNOT') {
        sq = { tagsNOT: value };
      } else if (name === 'tagsOR') {
        sq = { tagsOR: value };
      }
    }
    if (sq) {
      setTempSearchQuery(sq);
    } else {
      clearSearch();
    }
  };

  const handleSearchTermChange = (event) => {
    const { target } = event;
    const { value } = target;
    setTempSearchQuery({ textQuery: value });
  };

  const switchSearchBoxing = (
    event: React.MouseEvent<HTMLElement>,
    boxing: 'location' | 'folder' | 'global',
  ) => {
    if (boxing !== null) {
      setTempSearchQuery({ searchBoxing: boxing });
    }
  };

  const switchSearchType = (
    event: React.MouseEvent<HTMLElement>,
    type: 'fuzzy' | 'semistrict' | 'strict',
  ) => {
    if (type !== null) {
      setTempSearchQuery({ searchType: type });
    }
  };

  const handleFileTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value, name } = target;

    const types = getSearchTypeGroupExts(value);
    setTempSearchQuery({ fileTypes: types });
  };

  function findPropertiesByValues(searchValues) {
    if (searchValues) {
      const array = Object.keys(AppConfig.SearchTypeGroups).filter(
        (key) =>
          Array.isArray(AppConfig.SearchTypeGroups[key]) &&
          searchValues.some((value) =>
            AppConfig.SearchTypeGroups[key].includes(value),
          ),
      );
      if (array.length > 0) {
        return array[0];
      }
    }
    return undefined;
  }

  return (
    <Stack component="form" spacing={2} noValidate autoComplete="off">
      <TsTextField
        id="searchTerm"
        label={t('core:searchQueryInfo')}
        value={tempSearchQuery.textQuery}
        onChange={handleSearchTermChange}
        size={desktopMode ? 'small' : 'medium'}
        onKeyDown={(event) => {
          if (executeSearchOnEnter && event.key === 'Enter') {
            executeSearch();
          }
        }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <TsIconButton
                  size="small"
                  data-tid="searchTipsToggleTID"
                  tooltip={t('core:searchTipsTitle')}
                  aria-expanded={showTips}
                  aria-controls="searchTipsTID"
                  onClick={() => setShowTips(!showTips)}
                >
                  <InfoTooltipIcon />
                </TsIconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      <Collapse in={showTips} unmountOnExit>
        <Box
          id="searchTipsTID"
          data-tid="searchTipsTID"
          sx={{
            padding: '8px 12px',
            borderRadius: AppConfig.defaultCSSRadius,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle2" sx={{ marginBottom: '4px' }}>
            {t('core:searchTipsTitle')}
          </Typography>
          {searchTips.map(([example, key]) => (
            <Typography variant="body2" key={key} sx={{ marginBottom: '2px' }}>
              <Box component="code" sx={{ fontWeight: 'bold' }}>
                {example}
              </Box>{' '}
              – {t('core:' + key)}
            </Typography>
          ))}
        </Box>
      </Collapse>
      <FormControl disabled={isIndexing !== undefined}>
        <ToggleButtonGroup
          onChange={switchSearchBoxing}
          size="small"
          exclusive
          sx={{ marginBottom: 0, alignSelf: 'center' }}
          value={tempSearchQuery.searchBoxing}
        >
          <TsToggleButton
            sx={{
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }}
            tooltip={t('searchPlaceholder')}
            value="location"
          >
            <LocalLocationIcon fontSize="small" sx={toggleIconSx} />
            {t('location')}
          </TsToggleButton>
          <TsToggleButton
            sx={{
              borderRadius: 0,
            }}
            tooltip={t('searchCurrentFolderWithSubFolders')}
            value="folder"
          >
            <FolderIcon fontSize="small" sx={toggleIconSx} />
            {t('folder')}
          </TsToggleButton>
          <TsToggleButton
            sx={{
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}
            tooltip={
              currentWorkSpace
                ? t('currentWorkspace')
                : t('searchInAllLocationTooltip')
            }
            value="global"
          >
            <AllLocationsIcon fontSize="small" sx={toggleIconSx} />
            {currentWorkSpace
              ? currentWorkSpace.fullName + ' - ' + currentWorkSpace.shortName
              : t('globalSearch')}
          </TsToggleButton>
        </ToggleButtonGroup>
      </FormControl>
      <FormControl disabled={isIndexing !== undefined}>
        <ToggleButtonGroup
          onChange={switchSearchType}
          size="small"
          exclusive
          sx={{ marginBottom: 0, alignSelf: 'center' }}
          value={tempSearchQuery.searchType}
        >
          <TsToggleButton
            sx={{
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }}
            tooltip={t('searchTypeFuzzyTooltip')}
            value="fuzzy"
            data-tid="fuzzySearchTID"
          >
            <SimilarMatchIcon fontSize="small" sx={toggleIconSx} />
            {t('searchTypeFuzzy')}
          </TsToggleButton>
          <TsToggleButton
            sx={{
              borderRadius: 0,
            }}
            tooltip={t('searchTypeSemiStrictTooltip')}
            value="semistrict"
            data-tid="semiStrictSearchTID"
          >
            <ExactMatchIcon fontSize="small" sx={toggleIconSx} />
            {t('searchTypeSemiStrict')}
          </TsToggleButton>
          <TsToggleButton
            sx={{
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}
            tooltip={t('searchTypeStrictTooltip')}
            value="strict"
            data-tid="strictSearchTID"
          >
            <CaseSensitiveMatchIcon fontSize="small" sx={toggleIconSx} />
            {t('searchTypeStrict')}
          </TsToggleButton>
        </ToggleButtonGroup>
      </FormControl>
      <FormControl disabled={isIndexing !== undefined}>
        <TagsSelect
          dataTid="searchTagsAndTID"
          placeholderText={t('core:selectTags')}
          label={t('core:mustContainTheseTags')}
          tags={tempSearchQuery.tagsAND}
          handleChange={handleTagFieldChange}
          tagSearchType="tagsAND"
          tagMode="remove"
        />
      </FormControl>
      <FormControl disabled={isIndexing !== undefined}>
        <TagsSelect
          dataTid="searchTagsOrTID"
          placeholderText={t('core:selectTags')}
          tags={tempSearchQuery.tagsOR}
          label={t('core:atLeastOneOfTheseTags')}
          handleChange={handleTagFieldChange}
          tagSearchType="tagsOR"
          tagMode="remove"
        />
      </FormControl>
      <FormControl disabled={isIndexing !== undefined}>
        <TagsSelect
          dataTid="searchTagsNotTID"
          placeholderText={t('core:selectTags')}
          tags={tempSearchQuery.tagsNOT}
          label={t('core:noneOfTheseTags')}
          handleChange={handleTagFieldChange}
          tagSearchType="tagsNOT"
          tagMode="remove"
        />
      </FormControl>
      <FormControl disabled={isIndexing !== undefined}>
        <FormHelperText sx={{ marginLeft: 0 }}></FormHelperText>
        <TsSelect
          value={findPropertiesByValues(tempSearchQuery.fileTypes)}
          onChange={handleFileTypeChange}
          label={t('core:fileType')}
          // title={t('filterByTypTooltip')}
        >
          <MenuItem value={AppConfig.SearchTypes.any}>
            <ListItemText primary={t('core:anyType')} />
          </MenuItem>
          <MenuItem value={AppConfig.SearchTypes.folders}>
            <TsIconButton size="small">
              <FolderIcon />
            </TsIconButton>
            {t('core:searchFolders')}
          </MenuItem>
          <MenuItem value={AppConfig.SearchTypes.files}>
            <TsIconButton size="small">
              <FileIcon />
            </TsIconButton>
            {t('core:searchFiles')}
          </MenuItem>
          <MenuItem value={AppConfig.SearchTypes.untagged}>
            <TsIconButton size="small">
              <UntaggedIcon />
            </TsIconButton>
            {t('core:searchUntaggedEntries')}
          </MenuItem>
          <MenuItem
            title={AppConfig.SearchTypeGroups.images?.toString()}
            value={AppConfig.SearchTypes.images}
          >
            <TsIconButton size="small">
              <PictureIcon />
            </TsIconButton>
            {t('core:searchPictures')}
          </MenuItem>
          <MenuItem
            title={AppConfig.SearchTypeGroups.documents?.toString()}
            value={AppConfig.SearchTypes.documents}
          >
            <TsIconButton size="small">
              <DocumentIcon />
            </TsIconButton>
            {t('core:searchDocuments')}
          </MenuItem>
          <MenuItem
            title={AppConfig.SearchTypeGroups.notes?.toString()}
            value={AppConfig.SearchTypes.notes}
          >
            <TsIconButton size="small">
              <NoteIcon />
            </TsIconButton>
            {t('core:searchNotes')}
          </MenuItem>
          <MenuItem
            title={AppConfig.SearchTypeGroups.audio?.toString()}
            value={AppConfig.SearchTypes.audio}
          >
            <TsIconButton size="small">
              <AudioIcon />
            </TsIconButton>
            {t('core:searchAudio')}
          </MenuItem>
          <MenuItem
            title={AppConfig.SearchTypeGroups.video?.toString()}
            value={AppConfig.SearchTypes.video}
          >
            <TsIconButton size="small">
              <VideoIcon />
            </TsIconButton>
            {t('core:searchVideoFiles')}
          </MenuItem>
          <MenuItem
            title={AppConfig.SearchTypeGroups.archives?.toString()}
            value={AppConfig.SearchTypes.archives}
          >
            <TsIconButton size="small">
              <ArchiveIcon />
            </TsIconButton>
            {t('core:searchArchives')}
          </MenuItem>
          <MenuItem
            title={AppConfig.SearchTypeGroups.bookmarks?.toString()}
            value={AppConfig.SearchTypes.bookmarks}
          >
            <TsIconButton size="small">
              <BookmarkIcon />
            </TsIconButton>
            {t('core:searchBookmarks')}
          </MenuItem>
          <MenuItem
            title={AppConfig.SearchTypeGroups.ebooks?.toString()}
            value={AppConfig.SearchTypes.ebooks}
          >
            <TsIconButton size="small">
              <BookIcon />
            </TsIconButton>
            {t('core:searchEbooks')}
          </MenuItem>
          <MenuItem
            title={AppConfig.SearchTypeGroups.emails?.toString()}
            value={AppConfig.SearchTypes.emails}
          >
            <TsIconButton size="small">
              <EmailIcon />
            </TsIconButton>
            {t('core:searchEmails')}
          </MenuItem>
        </TsSelect>
      </FormControl>
      <FormControl disabled={isIndexing !== undefined}>
        <TsSelect
          value={tempSearchQuery.fileSize}
          onChange={handleFileSizeChange}
          label={t('core:sizeSearchTitle')}
          title={t('filterBySizeTooltip')}
        >
          <MenuItem value="">{t('core:sizeAny')}</MenuItem>
          <MenuItem value={AppConfig.SearchSizes.empty.key}>
            {t('core:sizeEmpty')}&nbsp;({formatFileSize(0)})
          </MenuItem>
          <MenuItem value={AppConfig.SearchSizes.tiny.key}>
            {t('core:sizeTiny')}
            &nbsp;(&lt;&nbsp;
            {formatFileSize(AppConfig.SearchSizes.tiny.thresholdBytes)})
          </MenuItem>
          <MenuItem value={AppConfig.SearchSizes.verySmall.key}>
            {t('core:sizeVerySmall')}
            &nbsp;({formatFileSize(AppConfig.SearchSizes.tiny.thresholdBytes)}
            &nbsp;-&nbsp;
            {formatFileSize(AppConfig.SearchSizes.verySmall.thresholdBytes)})
          </MenuItem>
          <MenuItem value={AppConfig.SearchSizes.small.key}>
            {t('core:sizeSmall')}
            &nbsp;(
            {formatFileSize(AppConfig.SearchSizes.verySmall.thresholdBytes)}
            &nbsp;-&nbsp;
            {formatFileSize(AppConfig.SearchSizes.small.thresholdBytes)})
          </MenuItem>
          <MenuItem value={AppConfig.SearchSizes.medium.key}>
            {t('core:sizeMedium')}
            &nbsp;({formatFileSize(AppConfig.SearchSizes.small.thresholdBytes)}
            &nbsp;-&nbsp;
            {formatFileSize(AppConfig.SearchSizes.medium.thresholdBytes)})
          </MenuItem>
          <MenuItem value={AppConfig.SearchSizes.large.key}>
            {t('core:sizeLarge')}
            &nbsp;({formatFileSize(AppConfig.SearchSizes.medium.thresholdBytes)}
            &nbsp;-&nbsp;
            {formatFileSize(AppConfig.SearchSizes.large.thresholdBytes)})
          </MenuItem>
          <MenuItem value={AppConfig.SearchSizes.huge.key}>
            {t('core:sizeHuge')}
            &nbsp;(&gt;&nbsp;
            {formatFileSize(AppConfig.SearchSizes.huge.thresholdBytes)})
          </MenuItem>
        </TsSelect>
      </FormControl>
      <FormControl disabled={isIndexing !== undefined}>
        <TsSelect
          value={tempSearchQuery.lastModified}
          onChange={handleLastModifiedChange}
          label={t('core:lastModifiedSearchTitle')}
          // title={t('filterByLastModifiedDateTooltip')}
        >
          <MenuItem value="">{t('core:anyTime')}</MenuItem>
          <MenuItem value={AppConfig.SearchTimePeriods.today.key}>
            {t('core:today')}
          </MenuItem>
          <MenuItem value={AppConfig.SearchTimePeriods.yesterday.key}>
            {t('core:yesterday')}
          </MenuItem>
          <MenuItem value={AppConfig.SearchTimePeriods.past7Days.key}>
            {t('core:past7Days')}
          </MenuItem>
          <MenuItem value={AppConfig.SearchTimePeriods.past30Days.key}>
            {t('core:past30Days')}
          </MenuItem>
          <MenuItem value={AppConfig.SearchTimePeriods.past6Months.key}>
            {t('core:past6Months')}
          </MenuItem>
          <MenuItem value={AppConfig.SearchTimePeriods.pastYear.key}>
            {t('core:pastYear')}
          </MenuItem>
          <MenuItem value={AppConfig.SearchTimePeriods.moreThanYear.key}>
            {t('core:moreThanYear')}
          </MenuItem>
        </TsSelect>
      </FormControl>
      <FormControl disabled={isIndexing !== undefined}>
        <TsSelect
          value={tempSearchQuery.dateCreated}
          onChange={handleDateCreatedChange}
          label={t('core:creationDate')}
        >
          <MenuItem value="">{t('core:anyTime')}</MenuItem>
          <MenuItem value={AppConfig.SearchTimePeriods.today.key}>
            {t('core:today')}
          </MenuItem>
          <MenuItem value={AppConfig.SearchTimePeriods.yesterday.key}>
            {t('core:yesterday')}
          </MenuItem>
          <MenuItem value={AppConfig.SearchTimePeriods.past7Days.key}>
            {t('core:past7Days')}
          </MenuItem>
          <MenuItem value={AppConfig.SearchTimePeriods.past30Days.key}>
            {t('core:past30Days')}
          </MenuItem>
          <MenuItem value={AppConfig.SearchTimePeriods.past6Months.key}>
            {t('core:past6Months')}
          </MenuItem>
          <MenuItem value={AppConfig.SearchTimePeriods.pastYear.key}>
            {t('core:pastYear')}
          </MenuItem>
          <MenuItem value={AppConfig.SearchTimePeriods.moreThanYear.key}>
            {t('core:moreThanYear')}
          </MenuItem>
        </TsSelect>
      </FormControl>
      <FormControl>
        <TsTooltip title={t('enterTimePeriodTooltip')}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box
              sx={{
                position: 'relative',
                display: 'inline-flex',
              }}
            >
              <div style={{ maxWidth: 180 }}>
                <FormHelperText sx={{ marginLeft: 0, marginTop: 0 }}>
                  {t('core:enterTagTimePeriodFrom')}
                </FormHelperText>
                <TsDatePicker
                  disabled={isIndexing !== undefined}
                  value={
                    tempSearchQuery.tagTimePeriodFrom
                      ? new Date(tempSearchQuery.tagTimePeriodFrom)
                      : undefined
                  }
                  onChange={(fromDataTime: Date) => {
                    if (fromDataTime) {
                      setTempSearchQuery({
                        tagTimePeriodFrom: fromDataTime.getTime(),
                      });
                    }
                  }}
                />
              </div>
              <div style={{ marginLeft: 5, maxWidth: 180 }}>
                <FormHelperText sx={{ marginLeft: 0, marginTop: 0 }}>
                  {t('core:enterTagTimePeriodTo')}
                </FormHelperText>
                <TsDatePicker
                  disabled={isIndexing !== undefined}
                  value={
                    tempSearchQuery.tagTimePeriodTo
                      ? new Date(tempSearchQuery.tagTimePeriodTo)
                      : undefined
                  }
                  onChange={(toDataTime: Date) => {
                    if (toDataTime) {
                      setTempSearchQuery({
                        tagTimePeriodTo: toDataTime.getTime(),
                      });
                    }
                  }}
                />
              </div>
            </Box>
          </LocalizationProvider>
        </TsTooltip>
      </FormControl>
    </Stack>
  );
}

export default EditSearchQuery;
