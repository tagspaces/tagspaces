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
  extractDirectoryName,
} from '@tagspaces/tagspaces-common/paths';
import { TS } from '-/tagspaces.namespace';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';

interface Props {
  open: boolean;
  onClose: (clearSelection?: boolean) => void;
  selected?: TS.FileSystemEntry[];
}

function AddRemoveTagsDialog(props: Props) {
  const { t } = useTranslation();
  const { selectedEntries } = useSelectedEntriesContext();
  const selected = props.selected ? props.selected : selectedEntries;

  const { currentLocation } = useCurrentLocationContext();
  const { addTags, removeTags, removeAllTags } = useTaggingActionsContext();
  const [newlyAddedTags, setNewlyAddedTags] = useState<Array<TS.Tag>>([]);

  const handleChange = (name: string, value: Array<TS.Tag>, action: string) => {
    if (action === 'remove-value') {
      const tagsToRemove: Array<string> = value.map((tag) => tag.title);
      setNewlyAddedTags(
        newlyAddedTags.filter((tag) => !tagsToRemove.includes(tag.title)),
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
    if (selected && selected.length > 0) {
      const paths = selected.map((entry) => entry.path);
      addTags(paths, newlyAddedTags);
    }
    onCloseDialog(true);
  };

  const removeTagsAction = () => {
    if (selected && selected.length > 0) {
      const paths = selected.map((entry) => entry.path);
      removeTags(paths, newlyAddedTags);
    }
    onCloseDialog(true);
  };

  const removeAllTagsAction = () => {
    if (selected && selected.length > 0) {
      const paths = selected.map((entry) => entry.path);
      removeAllTags(paths);
    }
    onCloseDialog(true);
  };

  const { open } = props;
  const disabledButtons =
    !newlyAddedTags || newlyAddedTags.length < 1 || selected.length < 1;

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
          overflowX: 'hidden',
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
          {selected.length > 0 &&
            selected.map((entry) => (
              <ListItem key={entry.path} title={entry.path}>
                <ListItemIcon>
                  {entry.isFile ? <FileIcon /> : <FolderIcon />}
                </ListItemIcon>
                <Typography variant="inherit" noWrap>
                  {entry.isFile
                    ? extractFileName(
                        entry.path || '',
                        currentLocation?.getDirSeparator(),
                      )
                    : extractDirectoryName(
                        entry.path || '',
                        currentLocation?.getDirSeparator(),
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
          disabled={selected.length < 1}
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
