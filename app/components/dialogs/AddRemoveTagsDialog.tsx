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
import Dialog from '@material-ui/core/Dialog';
import { Tag } from '-/reducers/taglibrary';
import TagsSelect from '../TagsSelect';
import i18n from '-/services/i18n';
import { extractFileName } from '-/utils/paths';
import PlatformIO from '-/services/platform-io';

interface Props {
  open: boolean;
  fullScreen: boolean;
  selectedEntries: Array<any>;
  onClose: (clearSelection?: boolean) => void;
  addTags: (paths: Array<string>, tags: Array<Tag>) => void;
  removeTags: (paths: Array<string>, tags: Array<Tag>) => void;
  removeAllTags: (paths: Array<string>) => void;
}

interface State {
  disableConfirmButton: boolean;
  open: boolean;
  newlyAddedTags: Array<Tag>;
  isConfirmDialogOpened: boolean;
}

class AddRemoveTagsDialog extends React.Component<Props, State> {
  state = {
    disableConfirmButton: true,
    newlyAddedTags: [],
    open: false,
    isConfirmDialogOpened: false
  };

  handleChange = (name: string, value: Array<Tag>, action: string) => {
    if (action === 'remove-value') {
      const tagsToRemove: Array<string> = value.map(tag => tag.title);
      // eslint-disable-next-line react/no-access-state-in-setstate
      const newlyAddedTags = this.state.newlyAddedTags.filter(
        tag => !tagsToRemove.includes(tag.title)
      );
      this.setState({
        newlyAddedTags
      });
    } else {
      this.setState({
        newlyAddedTags: value
      });
    }
  };

  onClose = (clearSelection?: boolean) => {
    this.setState({ newlyAddedTags: [] });
    this.props.onClose(clearSelection);
  };

  addTags = () => {
    if (this.props.selectedEntries && this.props.selectedEntries.length > 0) {
      const paths = [];
      this.props.selectedEntries.map(entry => {
        paths.push(entry.path);
        return true;
      });
      this.props.addTags(paths, this.state.newlyAddedTags);
    }
    this.onClose(true);
  };

  removeTags = () => {
    const { selectedEntries = [], removeTags } = this.props;
    const { newlyAddedTags = [] } = this.state;
    if (selectedEntries && selectedEntries.length > 0) {
      const paths = [];
      selectedEntries.map(entry => {
        paths.push(entry.path);
        return true;
      });
      removeTags(paths, newlyAddedTags);
    }
    this.onClose(true);
  };

  removeAllTags = () => {
    const { selectedEntries = [], removeAllTags } = this.props;
    if (selectedEntries && selectedEntries.length > 0) {
      const paths = [];
      selectedEntries.map(entry => {
        paths.push(entry.path);
        return true;
      });
      removeAllTags(paths);
    }
    this.onClose(true);
  };

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
    const disabledButtons =
      !newlyAddedTags ||
      newlyAddedTags.length < 1 ||
      selectedEntries.length < 1;

    return (
      <Dialog
        open={open}
        fullScreen={fullScreen}
        onClose={onClose}
        keepMounted
        scroll="paper"
      >
        <DialogTitle>{i18n.t('core:tagOperationTitle')}</DialogTitle>
        <DialogContent style={{ minHeight: 330 }}>
          <TagsSelect
            placeholderText={i18n.t('core:selectTags')}
            tags={newlyAddedTags}
            handleChange={this.handleChange}
            tagMode="remove"
          />
          <List dense style={{ width: 550 }}>
            {selectedEntries.length > 0 &&
              selectedEntries.map(entry => (
                <ListItem key={uuidv1()} title={entry.path}>
                  <ListItemIcon>
                    <FileIcon />
                  </ListItemIcon>
                  <Typography variant="inherit" noWrap>
                    {extractFileName(
                      entry.path || '',
                      PlatformIO.getDirSeparator()
                    )}
                  </Typography>
                </ListItem>
              ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button
            data-tid="cancelTagsMultipleEntries"
            onClick={() => this.onClose()}
            color="primary"
          >
            {i18n.t('core:cancel')}
          </Button>
          <Button
            data-tid="cleanTagsMultipleEntries"
            disabled={selectedEntries.length < 1}
            color="primary"
            onClick={this.removeAllTags}
          >
            {i18n.t('core:tagOperationCleanTags')}
          </Button>
          <Button
            data-tid="removeTagsMultipleEntries"
            disabled={disabledButtons}
            color="primary"
            onClick={this.removeTags}
          >
            {i18n.t('core:tagOperationRemoveTag')}
          </Button>
          <Button
            data-tid="addTagsMultipleEntries"
            disabled={disabledButtons}
            color="primary"
            onClick={this.addTags}
          >
            {i18n.t('core:tagOperationAddTag')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withMobileDialog()(AddRemoveTagsDialog);
