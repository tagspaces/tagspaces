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

import React from 'react';
import uuidv1 from 'uuid';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Tag, getAllTags } from '../reducers/taglibrary';
import { getTagColor, getTagTextColor } from '../reducers/settings';
import TagContainer from './TagContainer';

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
  classes?: any;
  theme?: any;
  tags: Array<Tag>;
  label?: string;
  tagSearchType?: string;
  defaultBackgroundColor?: string;
  defaultTextColor?: string;
  handleChange?: (param1: any, param2: any, param3?: any) => void;
  allTags?: Array<Tag>;
  isReadOnlyMode?: boolean;
  placeholderText?: string;
}

const TagsSelect = (props: Props) => {
  function handleTagChange(
    event: Object,
    selectedTags: Array<Tag>,
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
        const newTag: Tag = {
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
    tags,
    defaultBackgroundColor,
    defaultTextColor,
    placeholderText = '',
    label
  } = props;

  return (
    <div className={classes.root}>
      <Autocomplete
        multiple
        options={allTags}
        getOptionLabel={option => option.title}
        freeSolo
        value={tags}
        onChange={handleTagChange}
        renderTags={(value: Tag[]) =>
          value.map((tag: Tag, index: number) => (
            <TagContainer
              key={tag.title + index}
              tag={tag}
              tagMode="remove"
              handleRemoveTag={(event, cTag) => {
                for (let i = 0; i < tags.length; i += 1) {
                  if (tags[i].title === cTag.title) {
                    tags.splice(i, 1);
                  }
                }
                handleTagChange(event, [...tags], 'remove-value' )
              }}
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
            style={{ marginTop: 0, marginBottom: 0 }}
            fullWidth
          />
        )}
      />
    </div>
  );
};

const mapStateToProps = state => ({
  allTags: getAllTags(state),
  defaultBackgroundColor: getTagColor(state),
  defaultTextColor: getTagTextColor(state)
});

export default connect(mapStateToProps)(
  withStyles(styles, { withTheme: true })(TagsSelect)
);
