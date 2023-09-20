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
import { useDispatch } from 'react-redux';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import FolderIcon from '@mui/icons-material/FolderOpen';
import FileIcon from '@mui/icons-material/InsertDriveFileOutlined';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DraggablePaper from '-/components/DraggablePaper';
import TagsSelect from '../TagsSelect';
import {
  extractFileName,
  extractDirectoryName
} from '@tagspaces/tagspaces-common/paths';
import PlatformIO from '-/services/platform-facade';
import { TS } from '-/tagspaces.namespace';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { AppDispatch } from '-/reducers/app';
import { useTranslation } from 'react-i18next';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';

interface Props {
  open: boolean;
  selectedEntries: Array<any>;
  onClose: (clearSelection?: boolean) => void;
}

function AddRemoveTagsDialog(props: Props) {
  const { t } = useTranslation();

  const { addTags, removeTags, removeAllTags } = useTaggingActionsContext();
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

  const addTagsAction = () => {
    if (props.selectedEntries && props.selectedEntries.length > 0) {
      addTags(
        selectedEntries.map(entry => entry.path),
        newlyAddedTags
      );
    }
    onCloseDialog(true);
  };

  const removeTagsAction = () => {
    const { selectedEntries } = props;
    if (selectedEntries && selectedEntries.length > 0) {
      removeTags(
        selectedEntries.map(entry => entry.path),
        newlyAddedTags
      );
    }
    onCloseDialog(true);
  };

  const removeAllTagsAction = () => {
    const { selectedEntries } = props;
    if (selectedEntries && selectedEntries.length > 0) {
      removeAllTags(selectedEntries.map(entry => entry.path));
    }
    onCloseDialog(true);
  };

  const { open, selectedEntries = [] } = props;
  const disabledButtons =
    !newlyAddedTags || newlyAddedTags.length < 1 || selectedEntries.length < 1;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog
      open={open}
      fullScreen={fullScreen}
      onClose={onClose}
      keepMounted
      scroll="paper"
      PaperComponent={fullScreen ? Paper : DraggablePaper}
      aria-labelledby="draggable-dialog-title"
    >
      <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
        {t('core:tagOperationTitle')}
        <DialogCloseButton testId="closeAddRemoveTagsTID" onClose={onClose} />
      </DialogTitle>
      <DialogContent
        style={{
          minHeight: 330,
          paddingTop: 10,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <TagsSelect
          dataTid="AddRemoveTagsSelectTID"
          placeholderText={t('core:selectTags')}
          label={t('core:fileTags')}
          tags={newlyAddedTags}
          handleChange={handleChange}
          tagMode="remove"
          autoFocus={true}
        />
        <Typography style={{ marginTop: 10 }} variant="subtitle2">
          {t('selectedFilesAndFolders')}
        </Typography>
        <List dense style={{ width: 550, marginLeft: -15 }}>
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
      <DialogActions
        style={fullScreen ? { padding: '10px 30px 30px 30px' } : {}}
      >
        <Button
          data-tid="cancelTagsMultipleEntries"
          onClick={() => onCloseDialog()}
        >
          {t('core:cancel')}
        </Button>
        <Button
          data-tid="cleanTagsMultipleEntries"
          disabled={selectedEntries.length < 1}
          color="primary"
          onClick={removeAllTagsAction}
        >
          {t('core:tagOperationCleanTags')}
        </Button>
        <Button
          data-tid="removeTagsMultipleEntries"
          disabled={disabledButtons}
          color="primary"
          onClick={removeTagsAction}
        >
          {t('core:tagOperationRemoveTag')}
        </Button>
        <Button
          data-tid="addTagsMultipleEntries"
          disabled={disabledButtons}
          color="primary"
          variant="contained"
          onClick={addTagsAction}
        >
          {t('core:tagOperationAddTag')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddRemoveTagsDialog;
