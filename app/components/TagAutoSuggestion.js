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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import uuidv1 from 'uuid';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import { type Tag, getAllTags } from '../reducers/taglibrary';
import i18n from '../services/i18n';
import { isStr, isArr, isNum, shape } from '../utils/misc';

type Props = {
  classes: Array<string>,
  allTags?: Array<Tag>,
  onAddTag: () => void,
  onRemoveTag: () => void,
  selectedEntries?: Array,
  newlyAddedTags?: Array
};

type State = {
  query?: string,
  tags?: Array<Object>,
  suggestions?: Array<Object>,
  isValidQuery?: boolean,
  targetTagGroupColor?: string
};

const styles = {
  component: {
    position: 'relative',
    width: '640px',
    height: '260px',
    maxWidth: '100%',
    overflow: 'visible'
  },
  componentTip: {
    display: 'none',
    padding: '10px 0 0 0',
    fontSize: '12px',
    color: '#f44336',
    '&.active': {
      display: 'block'
    }
  },
  fieldContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  fieldBox: {
    width: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tagField: {
    width: '100%'
  },
  addTagButton: {
    width: '120px',
    margin: '16px 0 0 16px'
  },
  suggestions: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    margin: '0 auto',
    width: 'calc(100% - 2px)',
    maxHeight: '200px',
    overflowY: 'overlay',
    overflowX: 'hidden',
    display: 'none',
    backgroundColor: '#fff',
    zIndex: 100,
    boxShadow: '0 1px 1px 0 rgba(0, 0, 0, 0.16),0 1px 1px 0 rgba(239, 239, 239, 0.12)',
    '&.active': {
      display: 'block'
    }
  },
  addSuggestion: {
    width: '100%',
    border: 'none',
    backgroundColor: 'transparent',
    textAlign: 'left',
    transition: 'all 0.15s ease-in-out',
    padding: '12px',
    '&:not(:last-child)': {
      borderBottom: '1px solid rgba(0, 0, 0, 0.16)'
    },
    '&:hover, &:active, &:focus': {
      border: 'none',
      outline: 'none',
      cursor: 'pointer',
      backgroundColor: '#1dd19f',
      color: '#fff',
      transition: 'all 0.15s ease-in-out'
    }
  },
  tags: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    padding: '10px 0 0 0',
    margin: 0,
    backgroundColor: '#f9f7f7',
    borderRadius: 4,
    '&.active': {
      margin: '20px 0 0 0'
    }
  },
  tag: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: '4px',
    backgroundColor: '#008000',
    color: 'white',
    padding: '2px 6px',
    boxShadow: '0 1px 1px 0 rgba(0, 0, 0, 0.16),0 1px 1px 0 rgba(239, 239, 239, 0.12)',
    margin: '0 0 10px 10px'
  },
  removeTagButton: {
    border: 'none',
    backgroundColor: '#008000',
    padding: 0,
    position: 'relative',
    left: 4,
    top: 1,
    '&:hover, &:active, &:focus': {
      cursor: 'pointer',
      outline: 'none'
    }
  }
}

class TagAutoSuggestion extends Component<Props, State> {
  state = {
    query: '',
    tags: [],
    suggestions: [],
    isValidQuery: true,
    targetTagGroupColor: '#008000'
  };

  componentWillReceiveProps = ({ selectedItem = {} }) => {
    const { tags = [] } = selectedItem;
    this.setState({ tags });
    this.setState({ query: '' });
  };

  sanitizeQuery = query => query.trim();

  validateQuery = query => {
    const isMatchingLength = query.length > 1;
    const hasSpecialCharacters = /[[\]{}()*+?.,\\^$|#%&\s]/.test(query);
    return isMatchingLength && !hasSpecialCharacters;
  };

  onGetSuggestions = query => {
    const { allTags = [] } = this.props;
    const suggestions = allTags.filter(tag => tag.title.indexOf(query) > -1);
    this.setState({ query, suggestions });
  };

  onChangeQuery = query => {
    const sanitizedQuery = this.sanitizeQuery(query);
    const isValidQuery = this.validateQuery(sanitizedQuery);
    this.setState({
      isValidQuery,
      query: sanitizedQuery
    });
  };

  onAddTag = (tag = {}) => {
    const { query, targetTagGroupColor } = this.state;

    const addedTag = isStr(tag.title) ? tag : {
      id: uuidv1(),
      color: targetTagGroupColor,
      description: query,
      title: query,
      type: 'plain'
    };

    this.props.onAddTag(addedTag);
    this.setState({ query: '' });
  };

  onRemoveTag = (tag = {}) => {
    this.props.onRemoveTag(tag);
  };

  render() {
    const { classes, selectedItem = {}, selectedEntries, newlyAddedTags } = this.props;
    const { query, isValidQuery, suggestions = [] } = this.state;
    const suggestionsLength = suggestions.length;
    let { tags = [] } = selectedItem;

    /* if (isArr(selectedEntries)) {
      const uniqueEntries = shape(selectedEntries).filterByUnique('uuid').fetch();
      const tagsOnly = shape(uniqueEntries).reduceTo('tags').fetch();

      tags = shape(tagsOnly)
        .filterByDuplicate('title', uniqueEntries.length)
        .filterByUnique('title')
        .fetch();
    } */

    return (
      <div
        className={`component ${classes.component}`}
        data-component="tag-autosuggestion"
        style={{
          height: 260
        }}
      >
        <FormControl fullWidth={true} className={classes.fieldContainer}>
          <div className={classes.fieldBox}>
            <InputLabel
              htmlFor="name-disabled"
              shrink={query !== ''}
              focused={query !== ''}
              error={!isValidQuery && query !== ''}
            >
              {i18n.t('core:tagOperationTagsPlaceholder')}
            </InputLabel>
            <Input
              className={classes.tagField}
              value={query}
              error={!isValidQuery && query !== ''}
              onChange={event => this.onChangeQuery(event.target.value)}
              onKeyUp={event => {
                if (event.key === 'Enter') {
                  return false;
                }
                this.onGetSuggestions(event.target.value);
              }}
              onKeyDown={event => {
                if (event.key !== 'Enter') {
                  return false;
                }
                this.onAddTag();
              }}
            />
          </div>
          <Button
            disabled={!isValidQuery || query === ''}
            className={classes.addTagButton}
            data-tid="addTag"
            color="primary"
            onClick={this.onAddTag}
          >{i18n.t('core:addTag')}</Button>
        </FormControl>
        {query !== '' && (
          <div
            className={`suggestions ${classes.suggestions} ${isValidQuery && suggestionsLength > 0 ? 'active' : ''}`}
            title={i18n.t('core:existingTags')}
          >
            {suggestions.map(suggestion => (
              <button
                className={`trigger add-suggestion ${classes.addSuggestion}`}
                key={suggestion.title}
                title={`${i18n.t('core:addTag')} '${suggestion.title}'`}
                onClick={() => this.onAddTag(suggestion)}
              >
                {suggestion.title}
              </button>
            ))}
          </div>
        )}
        {newlyAddedTags && newlyAddedTags.length > 0 && (
          <div className={`tags ${classes.tags} ${tags.length > 0 ? 'active' : ''}`}>
            {newlyAddedTags.map(tag => (
              <div key={tag.title} className={`tag ${classes.tag}`}>
                <span className="text">{tag.title}</span>
                <button
                  className={`trigger remove-tag ${classes.removeTagButton}`}
                  title={`${i18n.t('core:removeTag')} '${tag.title}'`}
                  onClick={() => {
                    this.onRemoveTag(tag);
                  }}
                >
                  <CloseIcon style={{ fill: '#fff', pointerEvents: 'none' }} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className={`component-tip ${classes.componentTip} ${!isValidQuery && query !== '' ? 'active' : ''}`}>
          <span className="text">
            {i18n.t('core:editTagNamesRestrictionsHelp')}
          </span>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  allTags: getAllTags(state),
});

export default connect(mapStateToProps)(withStyles(styles)(TagAutoSuggestion));
