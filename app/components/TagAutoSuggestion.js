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

import React from 'react';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import Paper from 'material-ui/Paper';
import uuidv1 from 'uuid';
import { withStyles } from 'material-ui/styles';
import { MenuItem } from 'material-ui/Menu';
import { FormControl } from 'material-ui/Form';
import { ListItemSecondaryAction } from 'material-ui/List';
import { type Tag } from '../reducers/taglibrary';
import TagContainer from './TagContainer';
import i18n from '../services/i18n';
// import { extractFileName } from '../utils/paths';

function renderInput(inputProps) {
  const { classes, autoFocus, value, ref, ...other } = inputProps;
  return (
    <TextField
      autoFocus={autoFocus}
      className={classes.textField}
      value={value}
      inputRef={ref}
      InputProps={{
        classes: {
          input: classes.input,
        },
        ...other,
      }}
    />
  );
}

function renderSuggestion(suggestion, { query, isHighlighted }) {
  const matches = match(suggestion.title, query);
  const parts = parse(suggestion.title, matches);
  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        {parts.map((part, index) => {
          return part.highlight ? (
            <span key={String(index)} style={{ fontWeight: 300 }}>
              {part.text}
            </span>
          ) : (
            <strong key={String(index)} style={{ fontWeight: 400 }}>
              {part.text}
            </strong>
          );
        })}
      </div>
    </MenuItem>
  );
}

function renderSuggestionsContainer(options) {
  return (
    <Paper {...options.containerProps} square>
      {options.children}
    </Paper>
  );
}

const styles = theme => ({
  container: {
    flexGrow: 1,
    position: 'relative',
    height: 120
  },
  suggestionsContainerOpen: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 2,
    position: 'absolute',
    display: 'block',
    top: '31px',
    border: '1px solid #aaa',
    backgroundColor: '#fff',
    fontFamily: 'Open Sans,sans-serif',
    fontWeight: 300,
    fontSize: '16px',
    borderBottomLeftRadius: '4px',
    borderBottomRightRadius: '4px',
    zIndex: 7777,
    left: 0,
    right: 0
  },
  suggestion: {
    display: 'block'
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none'
  },
  textField: {
    width: '85%'
  },
  root: {
    marginTop: '15px',
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    padding: theme.spacing.unit / 3,
  },
  alignAddButton: {
    top: '20%'
  }
});

type Props = {
  allTags: Array<Tag>,
  classes: Object,
  updateSelectedTags: (tags: Array<Tag>) => void
};

type State = {
  value?: string,
  suggestions?: Array<Object>,
  tagContainerSuggestions?: Array<Object>
};

class TagAutoSuggestion extends React.Component<Props, State> {
  state = {
    value: '',
    suggestions: [],
    tagContainerSuggestions: []
  };

  handleTagSearchChange = (event) => {
    this.setState({
      value: event.target.value
    });
  };

  handleRemoveTag = (event, tag) => {
    const tagsData = [...this.state.tagContainerSuggestions];
    const tagToDelete = tagsData.indexOf(tag);
    tagsData.splice(tagToDelete, 1);
    this.setState({ tagContainerSuggestions: tagsData });
    this.props.updateSelectedTags(tagsData);
  };

  handleSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  };

  handleSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  handleAddTag = () => {
    const tagContainerSuggestions = this.state.tagContainerSuggestions;
    const value = this.state.value;
    // find by value/title
    tagContainerSuggestions.push({
      uuid: uuidv1(),
      title: value,
      value
    });
    this.setState({
      value: '',
      tagContainerSuggestions
    });
    this.props.updateSelectedTags(tagContainerSuggestions);
  };

  getSuggestions = (value) => {
    const queryValue = value.trim().toLowerCase();
    const queryLength = queryValue.length;
    let count = 0;

    return queryLength === 0
      ? []
      : this.props.allTags.filter(suggestion => {
        const keep =
          count < 5 && suggestion.title.toLowerCase().slice(0, queryLength) === queryValue;
        if (keep) {
          count += 1;
        }
        return keep;
      });
  }

  renderTagSuggestions = tag => (
    <TagContainer
      key={tag.uuid}
      tag={tag}
      handleRemoveTag={this.handleRemoveTag}
      tagMode={'remove'}
    />
  );

  render() {
    return (
      <div>
        <FormControl fullWidth={true}>
          <Autosuggest
            theme={{
              container: this.props.classes.container,
              suggestionsContainerOpen: this.props.classes.suggestionsContainerOpen,
              suggestionsList: this.props.classes.suggestionsList,
              suggestion: this.props.classes.suggestion,
              textField: this.props.classes.textField
            }}
            renderInputComponent={renderInput}
            suggestions={this.state.suggestions}
            onSuggestionsFetchRequested={this.handleSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.handleSuggestionsClearRequested}
            renderSuggestionsContainer={renderSuggestionsContainer}
            getSuggestionValue={suggestion => suggestion.title}
            renderSuggestion={renderSuggestion}
            inputProps={{
              autoFocus: true,
              classes: this.props.classes,
              placeholder: i18n.t('core:tagOperationTagsPlaceholder'),
              value: this.state.value,
              onChange: this.handleTagSearchChange,
            }}
          />
          <ListItemSecondaryAction className={this.props.classes.alignAddButton}>
            <Button
              data-tid="addTag"
              color="primary"
              onClick={this.handleAddTag}
            >
              {i18n.t('core:addTags')}
            </Button>
          </ListItemSecondaryAction>
        </FormControl>
        <FormControl fullWidth={true}>
          <Paper className={this.props.classes.root}>
            {this.state.tagContainerSuggestions && this.state.tagContainerSuggestions.map(this.renderTagSuggestions)}
          </Paper>
          {i18n.t('core:editTagNamesRestrictionsHelp')}
        </FormControl>
      </div>
    );
  }
}

export default withStyles(styles)(TagAutoSuggestion);
