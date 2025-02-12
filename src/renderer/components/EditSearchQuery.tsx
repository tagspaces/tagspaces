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

import React from 'react';
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
import { classes } from '-/components/SidePanels.css';
import TooltipTS from '-/components/Tooltip';
import TsIconButton from '-/components/TsIconButton';
import TsTextField from '-/components/TsTextField';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { isDesktopMode } from '-/reducers/settings';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import TagsSelect from './TagsSelect';
import { useSearchQueryContext } from '-/hooks/useSearchQueryContext';
import { Stack } from '@mui/material';

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

  const handleFileSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value, name } = target;
    if (name === 'fileSize') {
      setTempSearchQuery({ fileSize: value });
    }
  };

  const handleLastModifiedChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'lastModified') {
      setTempSearchQuery({ lastModified: value });
    }
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

    if (name === 'fileTypes') {
      const types = JSON.parse(value);
      setTempSearchQuery({ fileTypes: types });
    }
  };

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
      <FormControl
        className={classes.formControl}
        disabled={isIndexing !== undefined}
      >
        <ToggleButtonGroup
          onChange={switchSearchBoxing}
          size="small"
          exclusive
          style={{ marginBottom: 10, alignSelf: 'center' }}
          value={tempSearchQuery.searchBoxing}
        >
          <ToggleButton value="location">
            <TooltipTS title={t('searchPlaceholder')}>
              <div>{t('location')}</div>
            </TooltipTS>
          </ToggleButton>
          <ToggleButton value="folder">
            <TooltipTS title={t('searchCurrentFolderWithSubFolders')}>
              <div>{t('folder')}</div>
            </TooltipTS>
          </ToggleButton>
          <ToggleButton value="global">
            <TooltipTS title={t('searchInAllLocationTooltip')}>
              <div>{t('globalSearch')}</div>
            </TooltipTS>
          </ToggleButton>
        </ToggleButtonGroup>
      </FormControl>
      <FormControl
        className={classes.formControl}
        disabled={isIndexing !== undefined}
      >
        <ToggleButtonGroup
          onChange={switchSearchType}
          size="small"
          exclusive
          style={{ marginBottom: 10, alignSelf: 'center' }}
          value={tempSearchQuery.searchType}
        >
          <ToggleButton value="fuzzy" data-tid="fuzzySearchTID">
            <TooltipTS title={t('searchTypeFuzzyTooltip')}>
              <div>{t('searchTypeFuzzy')}</div>
            </TooltipTS>
          </ToggleButton>
          <ToggleButton value="semistrict" data-tid="semiStrictSearchTID">
            <TooltipTS title={t('searchTypeSemiStrictTooltip')}>
              <div>{t('searchTypeSemiStrict')}</div>
            </TooltipTS>
          </ToggleButton>
          <ToggleButton value="strict" data-tid="strictSearchTID">
            <TooltipTS title={t('searchTypeStrictTooltip')}>
              <div>{t('searchTypeStrict')}</div>
            </TooltipTS>
          </ToggleButton>
        </ToggleButtonGroup>
      </FormControl>
      <FormControl
        className={classes.formControl}
        disabled={isIndexing !== undefined}
      >
        <ToggleButtonGroup
          onChange={() => {
            setTempSearchQuery({
              forceIndexing: !tempSearchQuery.forceIndexing,
            });
          }}
          size="small"
          exclusive
          style={{ marginBottom: 10, alignSelf: 'center' }}
          value={tempSearchQuery.forceIndexing}
        >
          <ToggleButton value={false}>
            <TooltipTS title={t('useCurrentIndexTooltip')}>
              <div>{t('useCurrentIndex')}</div>
            </TooltipTS>
          </ToggleButton>
          <ToggleButton value={true} data-tid="forceIndexingTID">
            <TooltipTS title={t('forceReindexTooltip')}>
              <div>{t('forceReindex')}</div>
            </TooltipTS>
          </ToggleButton>
        </ToggleButtonGroup>
      </FormControl>
      <FormControl
        className={classes.formControl}
        disabled={isIndexing !== undefined}
      >
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
      <FormControl
        className={classes.formControl}
        disabled={isIndexing !== undefined}
      >
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
      <FormControl
        className={classes.formControl}
        disabled={isIndexing !== undefined}
      >
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
      <FormControl
        className={classes.formControl}
        disabled={isIndexing !== undefined}
      >
        <TooltipTS title={t('filterByTypTooltip')}>
          <FormHelperText style={{ marginLeft: 0 }}>
            {t('core:fileType')}
          </FormHelperText>
          <Select
            fullWidth
            value={JSON.stringify(tempSearchQuery.fileTypes)}
            onChange={handleFileTypeChange}
            size={desktopMode ? 'small' : 'medium'}
            input={<OutlinedInput name="fileTypes" id="file-type" />}
          >
            <MenuItem value={JSON.stringify(AppConfig.SearchTypeGroups.any)}>
              {t('core:anyType')}
            </MenuItem>
            <MenuItem
              value={JSON.stringify(AppConfig.SearchTypeGroups.folders)}
            >
              <TsIconButton size="small">
                <FolderIcon />
              </TsIconButton>
              {t('core:searchFolders')}
            </MenuItem>
            <MenuItem value={JSON.stringify(AppConfig.SearchTypeGroups.files)}>
              <TsIconButton size="small">
                <FileIcon />
              </TsIconButton>
              {t('core:searchFiles')}
            </MenuItem>
            <MenuItem
              value={JSON.stringify(AppConfig.SearchTypeGroups.untagged)}
            >
              <TsIconButton size="small">
                <UntaggedIcon />
              </TsIconButton>
              {t('core:searchUntaggedEntries')}
            </MenuItem>
            <MenuItem
              value={JSON.stringify(AppConfig.SearchTypeGroups.images)}
              title={AppConfig.SearchTypeGroups.images.toString()}
            >
              <TsIconButton size="small">
                <PictureIcon />
              </TsIconButton>
              {t('core:searchPictures')}
            </MenuItem>
            <MenuItem
              value={JSON.stringify(AppConfig.SearchTypeGroups.documents)}
              title={AppConfig.SearchTypeGroups.documents.toString()}
            >
              <TsIconButton size="small">
                <DocumentIcon />
              </TsIconButton>
              {t('core:searchDocuments')}
            </MenuItem>
            <MenuItem
              value={JSON.stringify(AppConfig.SearchTypeGroups.notes)}
              title={AppConfig.SearchTypeGroups.notes.toString()}
            >
              <TsIconButton size="small">
                <NoteIcon />
              </TsIconButton>
              {t('core:searchNotes')}
            </MenuItem>
            <MenuItem
              value={JSON.stringify(AppConfig.SearchTypeGroups.audio)}
              title={AppConfig.SearchTypeGroups.audio.toString()}
            >
              <TsIconButton size="small">
                <AudioIcon />
              </TsIconButton>
              {t('core:searchAudio')}
            </MenuItem>
            <MenuItem
              value={JSON.stringify(AppConfig.SearchTypeGroups.video)}
              title={AppConfig.SearchTypeGroups.video.toString()}
            >
              <TsIconButton size="small">
                <VideoIcon />
              </TsIconButton>
              {t('core:searchVideoFiles')}
            </MenuItem>
            <MenuItem
              value={JSON.stringify(AppConfig.SearchTypeGroups.archives)}
              title={AppConfig.SearchTypeGroups.archives.toString()}
            >
              <TsIconButton size="small">
                <ArchiveIcon />
              </TsIconButton>
              {t('core:searchArchives')}
            </MenuItem>
            <MenuItem
              value={JSON.stringify(AppConfig.SearchTypeGroups.bookmarks)}
              title={AppConfig.SearchTypeGroups.bookmarks.toString()}
            >
              <TsIconButton size="small">
                <BookmarkIcon />
              </TsIconButton>
              {t('core:searchBookmarks')}
            </MenuItem>
            <MenuItem
              value={JSON.stringify(AppConfig.SearchTypeGroups.ebooks)}
              title={AppConfig.SearchTypeGroups.ebooks.toString()}
            >
              <TsIconButton size="small">
                <BookIcon />
              </TsIconButton>
              {t('core:searchEbooks')}
            </MenuItem>
            <MenuItem
              value={JSON.stringify(AppConfig.SearchTypeGroups.emails)}
              title={AppConfig.SearchTypeGroups.emails.toString()}
            >
              <TsIconButton size="small">
                <EmailIcon />
              </TsIconButton>
              {t('core:searchEmails')}
            </MenuItem>
          </Select>
        </TooltipTS>
      </FormControl>
      <FormControl
        className={classes.formControl}
        disabled={isIndexing !== undefined}
      >
        <TooltipTS title={t('filterBySizeTooltip')}>
          <FormHelperText style={{ marginLeft: 0 }}>
            {t('core:sizeSearchTitle')}
          </FormHelperText>
          <Select
            fullWidth
            value={tempSearchQuery.fileSize}
            onChange={handleFileSizeChange}
            size={desktopMode ? 'small' : 'medium'}
            input={<OutlinedInput name="fileSize" id="file-size" />}
            displayEmpty
          >
            <MenuItem value="">{t('core:sizeAny')}</MenuItem>
            <MenuItem value="sizeEmpty">{t('core:sizeEmpty')}</MenuItem>
            <MenuItem value="sizeTiny">
              {t('core:sizeTiny')}
              &nbsp;(&lt;&nbsp;10KB)
            </MenuItem>
            <MenuItem value="sizeVerySmall">
              {t('core:sizeVerySmall')}
              &nbsp;(&lt;&nbsp;100KB)
            </MenuItem>
            <MenuItem value="sizeSmall">
              {t('core:sizeSmall')}
              &nbsp;(&lt;&nbsp;1MB)
            </MenuItem>
            <MenuItem value="sizeMedium">
              {t('core:sizeMedium')}
              &nbsp;(&lt;&nbsp;50MB)
            </MenuItem>
            <MenuItem value="sizeLarge">
              {t('core:sizeLarge')}
              &nbsp;(&lt;&nbsp;1GB)
            </MenuItem>
            <MenuItem value="sizeHuge">
              {t('core:sizeHuge')}
              &nbsp;(&gt;&nbsp;1GB)
            </MenuItem>
          </Select>
        </TooltipTS>
      </FormControl>
      <FormControl
        className={classes.formControl}
        disabled={isIndexing !== undefined}
      >
        <TooltipTS title={t('filterByLastModifiedDateTooltip')}>
          <FormHelperText style={{ marginLeft: 0 }}>
            {t('core:lastModifiedSearchTitle')}
          </FormHelperText>
          <Select
            fullWidth
            value={tempSearchQuery.lastModified}
            onChange={handleLastModifiedChange}
            size={desktopMode ? 'small' : 'medium'}
            input={<OutlinedInput name="lastModified" id="modification-date" />}
            displayEmpty
          >
            <MenuItem value="">{t('core:anyTime')}</MenuItem>
            <MenuItem value="today">{t('core:today')}</MenuItem>
            <MenuItem value="yesterday">{t('core:yesterday')}</MenuItem>
            <MenuItem value="past7Days">{t('core:past7Days')}</MenuItem>
            <MenuItem value="past30Days">{t('core:past30Days')}</MenuItem>
            <MenuItem value="past6Months">{t('core:past6Months')}</MenuItem>
            <MenuItem value="pastYear">{t('core:pastYear')}</MenuItem>
            <MenuItem value="moreThanYear">{t('core:moreThanYear')}</MenuItem>
          </Select>
        </TooltipTS>
      </FormControl>
      <FormControl className={classes.formControl}>
        <TooltipTS title={t('enterTimePeriodTooltip')}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box position="relative" display="inline-flex">
              <div>
                <FormHelperText style={{ marginLeft: 0, marginTop: 0 }}>
                  {t('core:enterTagTimePeriodFrom')}
                </FormHelperText>
                <DatePicker
                  disabled={isIndexing !== undefined}
                  format="yyyy-MM-dd"
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
              <div style={{ marginLeft: 5 }}>
                <FormHelperText style={{ marginLeft: 0, marginTop: 0 }}>
                  {t('core:enterTagTimePeriodTo')}
                </FormHelperText>
                <DatePicker
                  disabled={isIndexing !== undefined}
                  format="yyyy-MM-dd"
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
