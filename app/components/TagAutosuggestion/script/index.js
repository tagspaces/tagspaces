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
import ConfirmDialog from '../../dialogs/ConfirmDialog';
import { type Tag, getTagGroups } from '../../../reducers/taglibrary';
import i18n from '../../../services/i18n';
import styles from '../style';
import { isStr, isArr, isNum, shape } from '../../../utils/misc';

type Props = {
  classes: Array<string>,
  allTags?: Array<Tag>,
  selectedItem?: Object,
  selectedItems: Array<string>,
  addTags: (paths: Array<string>, tags: Array<Tag>) => void,
  removeTags: (paths: Array<string>, tags: Array<Tag>) => void,
  removeAllTags: (paths: Array<string>) => void,
  tagGroups: Array,
  selectedEntries?: Array,
  isModalOpened?: boolean,
  newlyAddedTags?: Array
};

type State = {
  query?: string,
  tags?: Array,
  suggestions?: Array,
  isValidQuery?: boolean,
  isConfirmDialogOpened?: boolean,
  tagForDeletion?: Object,
  targetTagGroupColor?: string
};

class TagAutoSuggestion extends Component<Props, State> {
  state = {
    query: '',
    tags: [],
    suggestions: [],
    isValidQuery: true,
    isConfirmDialogOpened: false,
    tagForDeletion: {},
    targetTagGroupColor: '#008000'
  };

  componentWillReceiveProps = ({ selectedItem = {}, isModalOpened }) => {
    const { tags = [] } = selectedItem;
    this.setState({ tags });

    if (!isModalOpened) {
      this.setState({ query: '' });
    }
  };

  /**
   * @description Sanitize query
   * @param query
   * @returns {*}
   */
  sanitizeQuery = query => query.trim();

  /**
   * @description Validate query
   * @param query
   * @returns {boolean}
   */
  validateQuery = query => {
    const isMatchingLength = query.length > 1;
    const hasSpecialCharacters = /[[\]{}()*+?.,\\^$|#%&\s]/.test(query);
    return isMatchingLength && !hasSpecialCharacters;
  };

  /**
   * @description On get suggestions
   * @param query
   */
  onGetSuggestions = query => {
    const { allTags = [] } = this.props;
    const suggestions = allTags.filter(tag => tag.title.indexOf(query) > -1);
    this.setState({ query, suggestions });
  };

  /**
   * @description On change query
   * @param query
   */
  onChangeQuery = query => {
    const sanitizedQuery = this.sanitizeQuery(query);
    const isValidQuery = this.validateQuery(sanitizedQuery);
    this.setState({
      isValidQuery,
      query: sanitizedQuery
    });
  };

  /**
   * @description On add tag
   * @param tag
   */
  onAddTag = (tag = {}) => {
    const { addTags } = this.props;
    const { query, targetTagGroupColor } = this.state;

    const addedTag = isStr(tag.title) ? tag : {
      id: uuidv1(),
      color: targetTagGroupColor,
      description: query,
      title: query,
      type: 'plain'
    };

    addTags(addedTag);
    this.setState({ query: '' });
  };

  /**
   * @description On remove tag
   * @param tag
   */
  onRemoveTag = (tag = {}) => {
    const { removeTags } = this.props;
    removeTags(tag);
  };

  render() {
    const { classes, selectedItem = {}, selectedEntries, newlyAddedTags, height } = this.props;
    const { query, isValidQuery, suggestions = [] } = this.state;
    const suggestionsLength = suggestions.length;
    let { tags = [] } = selectedItem;

    if (isArr(selectedEntries)) {
      const uniqueEntries = shape(selectedEntries).filterByUnique('uuid').fetch();
      const tagsOnly = shape(uniqueEntries).reduceTo('tags').fetch();

      tags = shape(tagsOnly)
        .filterByDuplicate('title', uniqueEntries.length)
        .filterByUnique('title')
        .fetch();
    }

    return (
      <div
        className={`component ${classes.component}`}
        data-component="tag-autosuggestion"
        style={{
          height: isNum(height) ? height : '260px'
        }}
      >

        <ConfirmDialog
          open={this.state.isConfirmDialogOpened}
          onClose={() => {
            this.setState({
              tagForDeletion: {},
              isConfirmDialogOpened: false
            });
          }}
          title={i18n.t('core:titleConfirm')}
          content={i18n.t('core:confirmTagDeletion')}
          confirmCallback={result => {
            if (result) {
              const { tagForDeletion } = this.state;
              this.onRemoveTag(tagForDeletion);
            }
          }}
          cancelDialogTID={'cancelTagDeletionDialog'}
          confirmDialogTID={'confirmTagDeletionDialog'}
          confirmDialogContent={'confirmTagDeletionDialogContent'}
        />

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

        {newlyAddedTags.length > 0 && (
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
  tagGroups: getTagGroups(state)
});

export default connect(mapStateToProps)(withStyles(styles)(TagAutoSuggestion));
