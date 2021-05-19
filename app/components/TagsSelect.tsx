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

import React, { useCallback, useState } from 'react';
import uuidv1 from 'uuid';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { getAllTags } from '-/reducers/taglibrary';
import { getTagColor, getTagTextColor } from '-/reducers/settings';
import TagContainer from './TagContainer';
import EntryTagMenu from '-/components/menus/EntryTagMenu';
import { TS } from '-/tagspaces.namespace';

const styles: any = (theme: any) => ({
  root: {
    flexGrow: 1
  },
  input: {
    display: 'flex',
    padding: 0,
    height: 'auto'
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden'
  },
  noOptionsMessage: {
    padding: theme.spacing(1, 2)
  },
  singleValue: {
    fontSize: 16
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    bottom: 6,
    fontSize: 16
  },
  paper: {
    position: 'absolute',
    zIndex: 2,
    marginTop: theme.spacing(1),
    left: 0,
    right: 0
  }
});

interface Props {
  dataTid?: string;
  classes?: any;
  theme?: any;
  tags: Array<TS.Tag>;
  label?: string;
  tagSearchType?: string;
  defaultBackgroundColor?: string;
  defaultTextColor?: string;
  handleChange?: (param1: any, param2: any, param3?: any) => void;
  allTags?: Array<TS.Tag>;
  tagMode?: 'default' | 'display' | 'remove';
  isReadOnlyMode?: boolean;
  placeholderText?: string;
  selectedEntryPath?: string;
  autoFocus?: boolean;
  // removeTags: (paths: Array<string>, tags: Array<Tag>) => void;
}

const TagsSelect = (props: Props) => {
  const [tagMenuAnchorEl, setTagMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );

  const [selectedTag, setSelectedTag] = useState(undefined);

  function handleTagChange(
    event: Object,
    selectedTags: Array<TS.Tag>,
    reason: string
  ) {
    if (reason === 'select-option') {
      props.handleChange(props.tagSearchType, selectedTags, reason);
    } else if (reason === 'create-option') {
      if (
        selectedTags &&
        selectedTags.length &&
        isValidNewOption(selectedTags[selectedTags.length - 1], selectedTags)
      ) {
        const newTag: TS.Tag = {
          id: uuidv1(),
          title: '' + selectedTags[selectedTags.length - 1],
          color: defaultBackgroundColor,
          textcolor: defaultTextColor
        };
        props.allTags.push(newTag);
        selectedTags.pop();
        const newTags = [...selectedTags, newTag];
        props.handleChange(props.tagSearchType, newTags, reason);
      }
    } else if (reason === 'remove-value') {
      props.handleChange(props.tagSearchType, selectedTags, reason);
    } else if (reason === 'clear') {
      props.handleChange(props.tagSearchType, [], reason);
    }
  }

  function isValidNewOption(inputValue, selectOptions) {
    const trimmedInput = inputValue.trim();
    return (
      trimmedInput.trim().length > 0 &&
      !trimmedInput.includes(' ') &&
      !trimmedInput.includes('#') &&
      !trimmedInput.includes(',') &&
      !selectOptions.find(option => option.title === inputValue)
    );
  }

  const {
    classes,
    allTags,
    defaultBackgroundColor,
    defaultTextColor,
    placeholderText = '',
    label,
    tagMode,
    selectedEntryPath,
    autoFocus = false
  } = props;

  const tags = props.tags ? props.tags : [];

  const handleTagMenu = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, tag) => {
      setTagMenuAnchorEl(event.currentTarget);
      setSelectedTag(tag);
    },
    [tags]
  );

  const handleRemoveTag = useCallback(
    (event, cTag: Array<TS.Tag>) => {
      /* const reducedTags = [...tags];
      for (let i = 0; i < reducedTags.length; i += 1) {
        if (reducedTags[i].title === cTag.title) {
          reducedTags.splice(i, 1);
        }
      } */
      if (cTag.length > 0) {
        handleTagChange(event, cTag, 'remove-value');
      }
    },
    [tags]
  );

  const handleCloseTagMenu = () => {
    setTagMenuAnchorEl(null);
  };

  return (
    <div className={classes.root}>
      <Autocomplete
        data-tid={props.dataTid}
        multiple
        options={!props.isReadOnlyMode ? allTags : []}
        getOptionLabel={option => option.title}
        freeSolo
        autoSelect
        autoComplete
        disableClearable
        value={tags}
        onChange={handleTagChange}
        renderTags={(value: TS.Tag[]) =>
          value.map((tag: TS.Tag) => (
            <TagContainer
              key={selectedEntryPath + tag.title}
              isReadOnlyMode={props.isReadOnlyMode}
              tag={tag}
              tagMode={tagMode}
              handleTagMenu={handleTagMenu}
              handleRemoveTag={handleRemoveTag}
            />
          ))
        }
        renderInput={params => (
          <TextField
            {...params}
            // variant="filled"
            label={label}
            placeholder={placeholderText}
            margin="normal"
            autoFocus={autoFocus}
            style={{ marginTop: 0, marginBottom: 0, whiteSpace: 'nowrap' }}
            fullWidth
          />
        )}
      />
      {selectedEntryPath && (
        <EntryTagMenu
          anchorEl={tagMenuAnchorEl}
          open={Boolean(tagMenuAnchorEl)}
          onClose={handleCloseTagMenu}
          selectedTag={selectedTag}
          currentEntryPath={selectedEntryPath}
          removeTags={handleRemoveTag}
          isReadOnlyMode={props.isReadOnlyMode}
        />
      )}
    </div>
  );
};

const mapStateToProps = state => ({
  allTags: getAllTags(state),
  defaultBackgroundColor: getTagColor(state),
  defaultTextColor: getTagTextColor(state)
});

/* function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      removeTags: TaggingActions.removeTags
    },
    dispatch
  );
} */

export default connect(mapStateToProps)(
  withStyles(styles, { withTheme: true })(TagsSelect)
);
