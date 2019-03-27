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

import React, { useState } from 'react';
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
  classes: Object,
  open: boolean,
  selectedEntries?: Array<Object>,
  onClose: () => void,
  addTags: (paths: Array<string>, tags: Array<Tag>) => void,
  removeTags: (paths: Array<string>, tags: Array<Tag>) => void,
  removeAllTags: (paths: Array<string>) => void
};

/* type State = {
  disableConfirmButton?: boolean,
  open?: boolean,
  newlyAddedTags?: Array<Tag>,
  isConfirmDialogOpened?: boolean
}; */

const AddRemoveTagsDialog = (props: Props) => {
  const [disableConfirmButton, setDisableConfirmButton] = useState(true);
  const [newlyAddedTags, setNewlyAddedTags] = useState([]);
  const [open, setOpen] = useState(false);
  const [isConfirmDialogOpened, setIsConfirmDialogOpened] = useState(false);
  /*  disableConfirmButton: true,
    newlyAddedTags: [],
    open: false,
    isConfirmDialogOpened: false
  }; */

  /* handleChange = (name, value) => {
    this.setState({
      newlyAddedTags: value
    });
  }; */

  function handleChange(value) {
    setNewlyAddedTags(value);
  }

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

  function onClose() {
    setNewlyAddedTags({ newlyAddedTags: [] });
    props.onClose();
  }

  function addTags() {
    if (props.selectedEntries && props.selectedEntries.length > 0) {
      const paths = [];
      props.selectedEntries.map((entry) => {
        paths.push(entry.path);
        return true;
      });
      props.addTags(paths, newlyAddedTags);
    }
    onClose();
  }

  function renderActions() {
    return (
      <DialogActions>
        <Button
          data-tid="cancel"
          onClick={onClose}
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
            onClose();
          }}
        >
          {i18n.t('core:tagOperationCleanTags')}
        </Button>
        <Button
          data-tid="removeTagsMultipleEntries"
          disabled={newlyAddedTags.length === 0 || selectedEntries.length < 1}
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
            onClose();
          }}
        >
          {i18n.t('core:tagOperationRemoveTag')}
        </Button>
        <Button
          data-tid="addTagsMultipleEntries"
          disabled={newlyAddedTags.length < 1 || selectedEntries.length < 1}
          color="primary"
          onClick={addTags}
        >
          {i18n.t('core:tagOperationAddTag')}
        </Button>
      </DialogActions>
    );
  }

  function renderContent() {
    return (
      <DialogContent style={{ minHeight: 330 }}>
        <TagsSelect tags={newlyAddedTags} handleChange={handleChange} />
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
    );
  }

  function renderTitle() {
    return (
      <DialogTitle>{i18n.t('core:tagOperationTitle')}</DialogTitle>
    );
  }

  /* render() {
    return (
      <GenericDialog
        open={open}
        onClose={onClose}
        onEnterKey={(event) => onEnterKeyHandler(event, addTags)}
        renderTitle={() => (
          <DialogTitle>{i18n.t('core:tagOperationTitle')}</DialogTitle>
        )}
        renderContent={() => (
          <DialogContent style={{ minHeight: 330 }}>
            <TagsSelect tags={newlyAddedTags} handleChange={handleChange} />
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
              onClick={onClose}
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
                onClose();
              }}
            >
              {i18n.t('core:tagOperationCleanTags')}
            </Button>
            <Button
              data-tid="removeTagsMultipleEntries"
              disabled={newlyAddedTags.length === 0 || selectedEntries.length < 1}
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
                onClose();
              }}
            >
              {i18n.t('core:tagOperationRemoveTag')}
            </Button>
            <Button
              data-tid="addTagsMultipleEntries"
              disabled={newlyAddedTags.length < 1 || selectedEntries.length < 1}
              color="primary"
              onClick={addTags}
            >
              {i18n.t('core:tagOperationAddTag')}
            </Button>
          </DialogActions>
        )}
      />
    );
  } */

  const {
    selectedEntries = [],
    removeTags,
    removeAllTags,
  } = props;
  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      onEnterKey={(event) => onEnterKeyHandler(event, addTags)}
      renderTitle={renderTitle}
      renderContent={renderContent}
      renderActions={renderActions}
    />
  );
};

export default AddRemoveTagsDialog;
