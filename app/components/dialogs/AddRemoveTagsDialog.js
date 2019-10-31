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
import withMobileDialog from '@material-ui/core/withMobileDialog';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import FileIcon from '@material-ui/icons/InsertDriveFileOutlined';
import Typography from '@material-ui/core/Typography';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import { type Tag } from '../../reducers/taglibrary';
import TagsSelect from '../TagsSelect';
import i18n from '../../services/i18n';
import { extractFileName } from '../../utils/paths';

type Props = {
  open: boolean,
  fullScreen: boolean,
  selectedEntries: Array<Object>,
  onClose: () => void,
  addTags: (paths: Array<string>, tags: Array<Tag>) => void,
  removeTags: (paths: Array<string>, tags: Array<Tag>) => void,
  removeAllTags: (paths: Array<string>) => void
};

type State = {
  disableConfirmButton: boolean,
  open: boolean,
  newlyAddedTags: Array<Tag>,
  isConfirmDialogOpened: boolean
};

class AddRemoveTagsDialog extends React.Component<Props, State> {
  state = {
    disableConfirmButton: true,
    newlyAddedTags: [],
    open: false,
    isConfirmDialogOpened: false
  };

  handleChange = (name, value) => {
    this.setState({
      newlyAddedTags: value
    });
  };

  /* onAddTag = (tag) => {
    const { newlyAddedTags } = this.state;
    newlyAddedTags.push(tag);
    this.setState({ newlyAddedTags });
  };

  onRemoveTag = (tag) => {
    const { newlyAddedTags } = this.state;
    const modifiedTags = newlyAddedTags.filter(addedTag => addedTag.title !== tag.title);
    this.setState({ newlyAddedTags: modifiedTags });
  }; */

  onClose = () => {
    this.setState({ newlyAddedTags: [] });
    this.props.onClose();
  };

  addTags = () => {
    if (this.props.selectedEntries && this.props.selectedEntries.length > 0) {
      const paths = [];
      this.props.selectedEntries.map((entry) => {
        paths.push(entry.path);
        return true;
      });
      this.props.addTags(paths, this.state.newlyAddedTags);
    }
    this.onClose();
  }

  render() {
    const {
      open,
      selectedEntries = [],
      removeTags,
      removeAllTags,
      fullScreen,
      onClose
    } = this.props;
    const { newlyAddedTags = [] } = this.state;

    return (
      <GenericDialog
        open={open}
        fullScreen={fullScreen}
        onClose={onClose}
        onEnterKey={(event) => onEnterKeyHandler(event, this.addTags)}
        renderTitle={() => (
          <DialogTitle>{i18n.t('core:tagOperationTitle')}</DialogTitle>
        )}
        renderContent={() => (
          <DialogContent style={{ minHeight: 330 }}>
            <TagsSelect placeholderText={i18n.t('core:selectTags')} tags={newlyAddedTags} handleChange={this.handleChange} />
            <List dense style={{ width: 550 }}>
              {selectedEntries.length > 0 && selectedEntries.map((entry) => (
                <ListItem title={entry.path}>
                  <ListItemIcon>
                    <FileIcon />
                  </ListItemIcon>
                  <Typography variant="inherit" noWrap>{extractFileName(entry.path || '')}</Typography>
                </ListItem>
              ))}
            </List>
          </DialogContent>
        )}
        renderActions={() => (
          <DialogActions>
            <Button
              data-tid="cancel"
              onClick={this.onClose}
              color="primary"
            >
              {i18n.t('core:cancel')}
            </Button>
            <Button
              data-tid="cleanTagsMultipleEntries"
              disabled={selectedEntries.length < 1}
              color="primary"
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
              disabled={!newlyAddedTags || newlyAddedTags.length < 1 || selectedEntries.length < 1}
              color="primary"
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
              disabled={!newlyAddedTags || newlyAddedTags.length < 1 || selectedEntries.length < 1}
              color="primary"
              onClick={this.addTags}
            >
              {i18n.t('core:tagOperationAddTag')}
            </Button>
          </DialogActions>
        )}
      />
    );
  }
}

export default withMobileDialog()(AddRemoveTagsDialog);
