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
  ArchiveIcon,
  AudioIcon,
  BookIcon,
  BookmarkIcon,
  DocumentIcon,
  EmailIcon,
  FileIcon,
  FolderIcon,
  InfoTooltipIcon,
  NoteIcon,
  PictureIcon,
  UntaggedIcon,
  VideoIcon,
} from '-/components/CommonIcons';
import TagsSelect from '-/components/TagsSelect';
import TooltipTS from '-/components/Tooltip';
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
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { formatFileSize } from '@tagspaces/tagspaces-common/misc';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

interface Props {
  executeSearchOnEnter?: boolean;
}

function EditSearchQuery(props: Props) {
  const { t } = useTranslation();
  const { executeSearchOnEnter } = props;
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

    const types = AppConfig.SearchTypeGroups[value];
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
        onKeyDown={() => {
          if (executeSearchOnEnter) {
            executeSearch();
          }
        }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <TooltipTS
                  title={
                    <>
                      <Typography variant="subtitle1" color="inherit">
                        Tips for the extended search
                      </Typography>
                      <Typography variant="subtitle2" color="inherit">
                        💡 <b>{'sun'}</b> - will match entries having the word
                        sun but also san or sum in the name
                        <br />
                        💡 <b>{'=sun'}</b> - will match entries having exactly
                        the word sun in the name
                        <br />
                        💡 <b>{'"sun and beach"'}</b> - will match entries
                        having `sun and beach´ in the name
                        <br />
                        💡 <b>{"'sun 'beach"}</b> - will match entries having
                        sun or beach in the name
                        <br />
                        💡 <b>{'!sun'}</b> - will match entries which do not
                        contain sun
                        <br />
                        💡 <b>{'^sun'}</b> - will match entries beginning with
                        sun
                        <br />
                        💡 <b>{'!^sun'}</b> - will match entries witch do not
                        begin with sun
                        <br />
                        💡 <b>{'.pdf$'}</b> - will match entries ending with
                        .pdf
                        <br />
                        💡 <b>{'!.pdf$'}</b> - will match entries not ending
                        with .pdf
                        <br />
                      </Typography>
                    </>
                  }
                >
                  <InfoTooltipIcon />
                </TooltipTS>
              </InputAdornment>
            ),
          },
        }}
      />
      <FormControl disabled={isIndexing !== undefined}>
        <ToggleButtonGroup
          onChange={switchSearchBoxing}
          size="small"
          exclusive
          style={{ marginBottom: 0, alignSelf: 'center' }}
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
            {t('location')}
          </TsToggleButton>
          <TsToggleButton
            sx={{
              borderRadius: 0,
            }}
            tooltip={t('searchCurrentFolderWithSubFolders')}
            value="folder"
          >
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
          style={{ marginBottom: 0, alignSelf: 'center' }}
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
            {t('searchTypeStrict')}
          </TsToggleButton>
        </ToggleButtonGroup>
      </FormControl>
      <FormControl disabled={isIndexing !== undefined}>
        <ToggleButtonGroup
          onChange={() => {
            setTempSearchQuery({
              forceIndexing: !tempSearchQuery.forceIndexing,
            });
          }}
          size="small"
          exclusive
          style={{ marginBottom: 0, alignSelf: 'center' }}
          value={tempSearchQuery.forceIndexing}
        >
          <TsToggleButton
            tooltip={t('useCurrentIndexTooltip')}
            sx={{
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }}
            value={false}
          >
            {t('useCurrentIndex')}
          </TsToggleButton>
          <TsToggleButton
            tooltip={t('forceReindexTooltip')}
            sx={{
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}
            value={true}
            data-tid="forceIndexingTID"
          >
            {t('forceReindex')}
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
            title={AppConfig.SearchTypeGroups.images.toString()}
            value={AppConfig.SearchTypes.images}
          >
            <TsIconButton size="small">
              <PictureIcon />
            </TsIconButton>
            {t('core:searchPictures')}
          </MenuItem>
          <MenuItem
            title={AppConfig.SearchTypeGroups.documents.toString()}
            value={AppConfig.SearchTypes.documents}
          >
            <TsIconButton size="small">
              <DocumentIcon />
            </TsIconButton>
            {t('core:searchDocuments')}
          </MenuItem>
          <MenuItem
            title={AppConfig.SearchTypeGroups.notes.toString()}
            value={AppConfig.SearchTypes.notes}
          >
            <TsIconButton size="small">
              <NoteIcon />
            </TsIconButton>
            {t('core:searchNotes')}
          </MenuItem>
          <MenuItem
            title={AppConfig.SearchTypeGroups.audio.toString()}
            value={AppConfig.SearchTypes.audio}
          >
            <TsIconButton size="small">
              <AudioIcon />
            </TsIconButton>
            {t('core:searchAudio')}
          </MenuItem>
          <MenuItem
            title={AppConfig.SearchTypeGroups.video.toString()}
            value={AppConfig.SearchTypes.video}
          >
            <TsIconButton size="small">
              <VideoIcon />
            </TsIconButton>
            {t('core:searchVideoFiles')}
          </MenuItem>
          <MenuItem
            title={AppConfig.SearchTypeGroups.archives.toString()}
            value={AppConfig.SearchTypes.archives}
          >
            <TsIconButton size="small">
              <ArchiveIcon />
            </TsIconButton>
            {t('core:searchArchives')}
          </MenuItem>
          <MenuItem
            title={AppConfig.SearchTypeGroups.bookmarks.toString()}
            value={AppConfig.SearchTypes.bookmarks}
          >
            <TsIconButton size="small">
              <BookmarkIcon />
            </TsIconButton>
            {t('core:searchBookmarks')}
          </MenuItem>
          <MenuItem
            title={AppConfig.SearchTypeGroups.ebooks.toString()}
            value={AppConfig.SearchTypes.ebooks}
          >
            <TsIconButton size="small">
              <BookIcon />
            </TsIconButton>
            {t('core:searchEbooks')}
          </MenuItem>
          <MenuItem
            title={AppConfig.SearchTypeGroups.emails.toString()}
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
          label={t('core:dateCreatedSearchTitle')}
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
        <TooltipTS title={t('enterTimePeriodTooltip')}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box position="relative" display="inline-flex">
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
        </TooltipTS>
      </FormControl>
    </Stack>
  );
}

export default EditSearchQuery;
