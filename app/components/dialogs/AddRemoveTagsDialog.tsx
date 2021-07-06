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

import React, { useState } from 'react';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import FolderIcon from '@material-ui/icons/FolderOpen';
import FileIcon from '@material-ui/icons/InsertDriveFileOutlined';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import TagsSelect from '../TagsSelect';
import i18n from '-/services/i18n';
import { extractFileName, extractDirectoryName } from '-/utils/paths';
import PlatformIO from '-/services/platform-io';
import { TS } from '-/tagspaces.namespace';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';

interface Props {
  open: boolean;
  fullScreen: boolean;
  selectedEntries: Array<any>;
  onClose: (clearSelection?: boolean) => void;
  addTags: (paths: Array<string>, tags: Array<TS.Tag>) => void;
  removeTags: (paths: Array<string>, tags: Array<TS.Tag>) => void;
  removeAllTags: (paths: Array<string>) => void;
}

const AddRemoveTagsDialog = (props: Props) => {
  const [newlyAddedTags, setNewlyAddedTags] = useState<Array<TS.Tag>>([]);

  const handleChange = (name: string, value: Array<TS.Tag>, action: string) => {
    if (action === 'remove-value') {
      const tagsToRemove: Array<string> = value.map(tag => tag.title);
      setNewlyAddedTags(
        newlyAddedTags.filter(tag => !tagsToRemove.includes(tag.title))
      );
    } else {
      setNewlyAddedTags(value);
    }
  };

  const onClose = () => {
    onCloseDialog();
  };

  const onCloseDialog = (clearSelection?: boolean) => {
    setNewlyAddedTags([]);
    props.onClose(clearSelection);
  };

  const addTags = () => {
    if (props.selectedEntries && props.selectedEntries.length > 0) {
      props.addTags(
        selectedEntries.map(entry => entry.path),
        newlyAddedTags
      );
    }
    onCloseDialog(true);
  };

  const removeTags = () => {
    const { selectedEntries } = props;
    if (selectedEntries && selectedEntries.length > 0) {
      props.removeTags(
        selectedEntries.map(entry => entry.path),
        newlyAddedTags
      );
    }
    onCloseDialog(true);
  };

  const removeAllTags = () => {
    const { selectedEntries } = props;
    if (selectedEntries && selectedEntries.length > 0) {
      props.removeAllTags(selectedEntries.map(entry => entry.path));
    }
    onCloseDialog(true);
  };

  const { open, selectedEntries = [], fullScreen } = props;
  const disabledButtons =
    !newlyAddedTags || newlyAddedTags.length < 1 || selectedEntries.length < 1;

  return (
    <Dialog
      open={open}
      fullScreen={fullScreen}
      onClose={onClose}
      keepMounted
      scroll="paper"
    >
      <DialogTitle>
        {i18n.t('core:tagOperationTitle')}
        <DialogCloseButton onClose={onClose} />
      </DialogTitle>
      <DialogContent style={{ minHeight: 330 }}>
        <TagsSelect
          dataTid="AddRemoveTagsSelectTID"
          placeholderText={i18n.t('core:selectTags')}
          tags={newlyAddedTags}
          handleChange={handleChange}
          tagMode="remove"
          autoFocus={true}
        />
        <List dense style={{ width: 550 }}>
          {selectedEntries.length > 0 &&
            selectedEntries.map(entry => (
              <ListItem key={entry.path} title={entry.path}>
                <ListItemIcon>
                  {entry.isFile ? <FileIcon /> : <FolderIcon />}
                </ListItemIcon>
                <Typography variant="inherit" noWrap>
                  {entry.isFile
                    ? extractFileName(
                        entry.path || '',
                        PlatformIO.getDirSeparator()
                      )
                    : extractDirectoryName(
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
          onClick={() => onCloseDialog()}
        >
          {i18n.t('core:cancel')}
        </Button>
        <Button
          data-tid="cleanTagsMultipleEntries"
          disabled={selectedEntries.length < 1}
          color="primary"
          onClick={removeAllTags}
        >
          {i18n.t('core:tagOperationCleanTags')}
        </Button>
        <Button
          data-tid="removeTagsMultipleEntries"
          disabled={disabledButtons}
          color="primary"
          onClick={removeTags}
        >
          {i18n.t('core:tagOperationRemoveTag')}
        </Button>
        <Button
          data-tid="addTagsMultipleEntries"
          disabled={disabledButtons}
          color="primary"
          onClick={addTags}
        >
          {i18n.t('core:tagOperationAddTag')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withMobileDialog()(AddRemoveTagsDialog);
