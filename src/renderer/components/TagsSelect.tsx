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

import TagContainer from '-/components/TagContainer';
import TsTextField from '-/components/TsTextField';
import AiGenTagsButton from '-/components/chat/AiGenTagsButton';
import EntryTagMenu from '-/components/menus/EntryTagMenu';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useEditedTagLibraryContext } from '-/hooks/useEditedTagLibraryContext';
import { Pro } from '-/pro';
import {
  getTagColor,
  getTagTextColor,
  isDesktopMode,
  useOnlyTagsFromTagLibrary,
} from '-/reducers/settings';
import { getAllTags } from '-/services/taglibrary-utils';
import { tagsValidation } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { Box, InputAdornment } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import FormHelperText from '@mui/material/FormHelperText';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

interface Props {
  dataTid?: string;
  tags: TS.Tag[];
  label?: string;
  tagSearchType?: string;
  handleChange?: (name: string, value: TS.Tag[], action: string) => void;
  handleNewTags?: (newTags: TS.Tag[]) => void;
  tagMode?: 'default' | 'display' | 'remove';
  placeholderText?: string;
  selectedEntry?: TS.FileSystemEntry;
  autoFocus?: boolean;
  generateButton?: boolean;
}

function TagsSelect(props: Props) {
  const { t } = useTranslation();
  const { currentLocation } = useCurrentLocationContext();
  const { tagGroups } = useEditedTagLibraryContext();

  const workSpacesContext = Pro?.contextProviders?.WorkSpacesContext
    ? useContext<TS.WorkSpacesContextData>(
        Pro.contextProviders.WorkSpacesContext,
      )
    : undefined;

  const currentWorkSpace =
    workSpacesContext && workSpacesContext.getCurrentWorkSpace
      ? workSpacesContext?.getCurrentWorkSpace()
      : undefined;

  const desktopMode = useSelector(isDesktopMode);
  const isUseOnlyTagsFromTagLibrary = useSelector(useOnlyTagsFromTagLibrary);
  const [tagMenuAnchorEl, setTagMenuAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [selectedTag, setSelectedTag] = useState(undefined);
  const tagsError = useRef<boolean>(false);
  const allTags = useRef<Array<TS.Tag>>(
    getAllTags(tagGroups, currentWorkSpace),
  );

  const defaultBackgroundColor = useSelector(getTagColor);
  const defaultTextColor = useSelector(getTagTextColor);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const {
    placeholderText = '',
    label,
    selectedEntry,
    autoFocus = false,
    tags = [],
    tagMode,
    handleNewTags,
    generateButton,
  } = props;

  useEffect(() => {
    allTags.current = getAllTags(tagGroups, currentWorkSpace);
    forceUpdate();
  }, [currentWorkSpace, tagGroups]);

  function handleTagChange(
    event: Object,
    selectedTags: Array<TS.Tag>,
    reason: string,
  ) {
    tagsError.current = false;
    if (!currentLocation?.isReadOnly) {
      if (reason === 'blur') {
        if (handleNewTags) {
          handleNewTags(undefined);
        }
      } else {
        if (handleNewTags) {
          handleNewTags([]);
        }
        if (reason === 'selectOption') {
          props.handleChange(props.tagSearchType, selectedTags, reason);
        } else if (reason === 'createOption') {
          if (selectedTags && selectedTags.length) {
            const newTags = parseTagsInput(
              '' + selectedTags[selectedTags.length - 1],
            );
            selectedTags.pop();
            const allNewTags = [...selectedTags, ...newTags];
            props.handleChange(props.tagSearchType, allNewTags, reason);
          }
        } else if (reason === 'remove-value') {
          props.handleChange(props.tagSearchType, selectedTags, reason);
        } else if (reason === 'clear') {
          props.handleChange(props.tagSearchType, [], reason);
        }
      }
    } else {
      console.debug('tags disabled in read only mode!');
    }
  }

  function parseTagsInput(tagsInput: string): TS.Tag[] {
    let tags = tagsInput.split(' ').join(',').split(','); // handle spaces around commas
    tags = [...new Set(tags)]; // remove duplicates

    const newTags = [];
    tags.map((tag) => {
      if (tagsValidation(tag)) {
        const newTag: TS.Tag = {
          id: getUuid(),
          title: '' + tag,
          color: defaultBackgroundColor,
          textcolor: defaultTextColor,
        };
        //if (!allTags.current.find((option) => option.title === newTag.title)) {
        newTags.push(newTag);
        //allTags.current.push(newTag);
        //}
      } else {
        tagsError.current = true;
        forceUpdate();
      }
    });
    return newTags;
  }

  function handleInputChange(event: any, value: string, reason: string) {
    tagsError.current = false;
    if (reason === 'input' && !isUseOnlyTagsFromTagLibrary) {
      const newTags = parseTagsInput(value);
      if (handleNewTags) {
        handleNewTags(newTags);
      }
    }
  }

  const handleTagMenu = (event: React.ChangeEvent<HTMLInputElement>, tag) => {
    setTagMenuAnchorEl(event.currentTarget);
    setSelectedTag(tag);
  };

  const handleRemoveTag = (event, cTag: Array<TS.Tag>) => {
    /* const reducedTags = [...tags];
      for (let i = 0; i < reducedTags.length; i += 1) {
        if (reducedTags[i].title === cTag.title) {
          reducedTags.splice(i, 1);
        }
      } */
    if (cTag.length > 0) {
      handleTagChange(event, cTag, 'remove-value');
    }
  };

  const handleCloseTagMenu = () => {
    setTagMenuAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Autocomplete
        data-tid={props.dataTid}
        disabled={currentLocation?.isReadOnly}
        multiple
        options={!currentLocation?.isReadOnly ? allTags.current : []}
        getOptionLabel={(option: TS.Tag) => option.title}
        freeSolo={!isUseOnlyTagsFromTagLibrary}
        disableClearable={true}
        autoSelect
        autoComplete
        size={desktopMode ? 'small' : 'medium'}
        value={tags}
        onChange={handleTagChange}
        onInputChange={handleInputChange}
        renderTags={(value: readonly TS.Tag[], getTagProps) =>
          value.map((option: TS.Tag, index: number) => (
            <TagContainer
              key={selectedEntry?.path + option + index}
              tag={option}
              tagMode={tagMode}
              handleTagMenu={handleTagMenu}
              handleRemoveTag={handleRemoveTag}
            />
          ))
        }
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <TagContainer tag={option} tagMode={tagMode} />
          </Box>
        )}
        renderInput={(params) => (
          <>
            <TsTextField
              {...params}
              label={label}
              placeholder={placeholderText}
              autoFocus={autoFocus}
              error={tagsError.current}
              sx={{ marginTop: 0, marginBottom: 0, whiteSpace: 'nowrap' }}
              slotProps={{
                input: {
                  ...params.InputProps,
                  endAdornment: generateButton && (
                    <InputAdornment position="end">
                      <AiGenTagsButton variant="text" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            {tagsError.current && (
              <FormHelperText>{t('core:tagTitleHelper')}</FormHelperText>
            )}
          </>
        )}
      />
      {selectedEntry && (
        <EntryTagMenu
          anchorEl={tagMenuAnchorEl}
          open={Boolean(tagMenuAnchorEl)}
          onClose={handleCloseTagMenu}
          selectedTag={selectedTag}
          currentEntry={selectedEntry}
          removeTags={handleRemoveTag}
        />
      )}
    </Box>
  );
}

export default TagsSelect;
