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
import Button from 'material-ui/Button';
import { DialogActions, DialogContent, DialogTitle } from 'material-ui/Dialog';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import { type Tag } from '../../reducers/taglibrary';
import TagAutosuggestion from '../TagAutosuggestion/';
import i18n from '../../services/i18n';
import ConfirmDialog from '../dialogs/ConfirmDialog';
import { isArr, isObj, shape } from '../../utils/misc';

type Props = {
  open: boolean,
  onClose: () => void,
  selectedItems?: Array<Object>,
  selectedItem?: Object,
  addTags: (paths: Array<string>, tags: Array<Tag>) => void,
  allTags?: Array<Tag>,
  selectedEntries?: Array,
  isSingleFile?: boolean,
  removeTags: (paths: Array<string>, tags: Array<Tag>) => void,
  removeAllTags: (paths: Array<string>) => void,
  showNotification: (text: string, notificationType: string, autohide: boolean) => void
};

type State = {
  inputError?: boolean,
  disableConfirmButton?: boolean,
  open?: boolean,
  tags?: Array<Tag>,
  selectedTags?: Array<Tag>,
  selectedItem?: Object,
  isConfirmDialogOpened?: boolean
};

class AddRemoveTagsDialog extends React.Component<Props, State> {
  state = {
    inputError: false,
    disableConfirmButton: true,
    newlyAddedTags: [],
    open: false,
    tags: [],
    selectedTags: [],
    selectedItem: {},
    isConfirmDialogOpened: false,
    isRemoveAllTags: true
  };

  onRemoveAllTags = () => {
    const { selectedItem, removeAllTags } = this.props;
    removeAllTags([selectedItem.path]);
  };

  onRemoveNewlyAddedTags = () => {
    this.setState({ newlyAddedTags: [] });
  };

  onAddTag = (tag) => {
    const { newlyAddedTags } = this.state;
    newlyAddedTags.push(tag);
    this.setState({ newlyAddedTags });
  };

  onRemoveTag = (tag) => {
    const { newlyAddedTags } = this.state;
    const modifiedTags = newlyAddedTags.filter(addedTag => addedTag.title !== tag.title);
    this.setState({ newlyAddedTags: modifiedTags });
  };

  render() {
    const {
      open,
      allTags,
      selectedItems,
      selectedItem,
      selectedEntries,
      isSingleFile = false,
      addTags,
      removeTags,
      removeAllTags,
      onClose
    } = this.props;
    const { newlyAddedTags, isRemoveAllTags } = this.state;

    const selectedEntriesTagCount = !isSingleFile
      ? isArr(selectedEntries) && isObj(selectedEntries[0]) ? shape(selectedEntries).reduceTo('tags').fetch().length : 0
      : isObj(selectedItem) && isArr(selectedItem.tags) ? selectedItem.tags.length : 0;

    return (
      <GenericDialog
        open={open}
        onClose={onClose}
        // onEnterKey={(event) => onEnterKeyHandler(event, this.onConfirm)}
        renderTitle={() => (
          <DialogTitle>{i18n.t('core:tagOperationTitle')}</DialogTitle>
        )}
        renderContent={() => (
          <DialogContent>

            <ConfirmDialog
              open={this.state.isConfirmDialogOpened}
              onClose={() => {
                this.setState({
                  isConfirmDialogOpened: false
                });
              }}
              title={i18n.t('core:confirm')}
              content={i18n.t(`core:${isRemoveAllTags ? 'confirmAllTagsDeletion' : 'confirmSelectedTagsDeletion'}`)}
              confirmCallback={result => {
                if (result) {
                  if (isRemoveAllTags) {
                    this.onRemoveAllTags();
                  } else {
                    if (!isArr(selectedEntries)) {
                      removeTags([selectedItem.path], newlyAddedTags);
                    } else {
                      const paths = shape(selectedEntries)
                        .filterByUnique('uuid')
                        .reduceTo('path')
                        .fetch();
                      removeTags(paths, newlyAddedTags);
                    }
                    this.onRemoveNewlyAddedTags();
                    onClose();
                  }
                  this.onRemoveNewlyAddedTags();
                  onClose();
                }
              }}
              cancelDialogActionId={'cancelAllTagsDeletionDialog'}
              confirmDialogActionId={'confirmAllTagsDeletionDialog'}
              confirmDialogContent={'confirmAllTagsDeletionDialogContent'}
            />

            <TagAutosuggestion
              isModalOpened={open}
              selectedItem={selectedItem}
              selectedItems={selectedItems}
              selectedEntries={selectedEntries}
              newlyAddedTags={newlyAddedTags}
              allTags={allTags}
              addTags={this.onAddTag}
              removeTags={this.onRemoveTag}
              removeAllTags={removeAllTags}
            />
          </DialogContent>
        )}
        renderActions={() => (
          <DialogActions>
            <Button
              data-tid="cancel"
              onClick={() => {
                this.onRemoveNewlyAddedTags();
                onClose();
              }}
            >
              {i18n.t('core:cancel')}
            </Button>
            <Button
              data-tid="cleanTags"
              disabled={selectedEntriesTagCount === 0}
              onClick={() => this.setState({ isConfirmDialogOpened: true })}
            >
              {i18n.t('core:tagOperationCleanTags')}
            </Button>
            <Button
              data-tid="ok"
              disabled={newlyAddedTags.length === 0}
              onClick={() => {
                this.setState({
                  isConfirmDialogOpened: true,
                  isRemoveAllTags: false
                });
              }}
            >
              {i18n.t('core:tagOperationRemoveTag')}
            </Button>
            <Button
              data-tid="ok"
              color="primary"
              disabled={newlyAddedTags.length === 0}
              onClick={() => {
                if (!isArr(selectedEntries)) {
                  addTags([selectedItem.path], newlyAddedTags);
                } else {
                  const paths = shape(selectedEntries)
                    .filterByUnique('uuid')
                    .reduceTo('path')
                    .fetch();
                  addTags(paths, newlyAddedTags);
                }
                this.onRemoveNewlyAddedTags();
                onClose();
              }}
            >
              {i18n.t('core:tagOperationAddTag')}
            </Button>
          </DialogActions>
        )}
      />
    );
  }
}

export default AddRemoveTagsDialog;
