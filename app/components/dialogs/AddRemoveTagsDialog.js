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
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import GenericDialog from './GenericDialog';
import { type Tag } from '../../reducers/taglibrary';
import TagAutoSuggestion from '../TagAutoSuggestion';
import i18n from '../../services/i18n';

type Props = {
  open: boolean,
  selectedEntries?: Array<Object>,
  onClose: () => void,
  addTags: (paths: Array<string>, tags: Array<Tag>) => void,
  removeTags: (paths: Array<string>, tags: Array<Tag>) => void,
  removeAllTags: (paths: Array<string>) => void
};

type State = {
  disableConfirmButton?: boolean,
  open?: boolean,
  newlyAddedTags?: Array<Tag>,
  isConfirmDialogOpened?: boolean
};

class AddRemoveTagsDialog extends React.Component<Props, State> {
  state = {
    disableConfirmButton: true,
    newlyAddedTags: [],
    open: false,
    isConfirmDialogOpened: false
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

  onClose = () => {
    this.setState({newlyAddedTags: []});
    this.props.onClose();
  }

  render() {
    const {
      open,
      selectedEntries = [],
      addTags,
      removeTags,
      removeAllTags,
      onClose
    } = this.props;
    const { newlyAddedTags = [] } = this.state;

    return (
      <GenericDialog
        open={open}
        onClose={onClose}
        renderTitle={() => (
          <DialogTitle>{i18n.t('core:tagOperationTitle')}</DialogTitle>
        )}
        renderContent={() => (
          <DialogContent>
            <TagAutoSuggestion
              selectedEntries={selectedEntries}
              newlyAddedTags={newlyAddedTags}
              onAddTag={this.onAddTag}
              onRemoveTag={this.onRemoveTag}
            />
          </DialogContent>
        )}
        renderActions={() => (
          <DialogActions>
            <Button
              data-tid="cancel"
              onClick={this.onClose}
            >
              {i18n.t('core:cancel')}
            </Button>
            <Button
              data-tid="cleanTagsMultipleEntries"
              disabled={selectedEntries.length < 1}
              onClick={() => {
                if (selectedEntries && selectedEntries.length > 0) {
                  const paths = [];
                  selectedEntries.map((entry) => {
                    paths.push(entry.path);
                    return true;
                  });
                  removeAllTags(paths);
                }
                this.onClose();
              }}
            >
              {i18n.t('core:tagOperationCleanTags')}
            </Button>
            <Button
              data-tid="removeTagsMultipleEntries"
              disabled={newlyAddedTags.length === 0 || selectedEntries.length < 1}
              onClick={() => {
                if (selectedEntries && selectedEntries.length > 0) {
                  const paths = [];
                  selectedEntries.map((entry) => {
                    paths.push(entry.path);
                    return true;
                  });
                  removeTags(paths, newlyAddedTags);
                }
                this.onClose();
              }}
            >
              {i18n.t('core:tagOperationRemoveTag')}
            </Button>
            <Button
              data-tid="addTagsMultipleEntries"
              disabled={newlyAddedTags.length < 1 || selectedEntries.length < 1}
              onClick={() => {
                if (selectedEntries && selectedEntries.length > 0) {
                  const paths = [];
                  selectedEntries.map((entry) => {
                    paths.push(entry.path);
                    return true;
                  });
                  addTags(paths, newlyAddedTags);
                }
                this.onClose();
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
