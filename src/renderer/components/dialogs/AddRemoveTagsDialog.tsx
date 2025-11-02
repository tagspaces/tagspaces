/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

import DraggablePaper from '-/components/DraggablePaper';
import TsButton from '-/components/TsButton';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { TS } from '-/tagspaces.namespace';
import FolderIcon from '@mui/icons-material/FolderOpen';
import FileIcon from '@mui/icons-material/InsertDriveFileOutlined';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  extractDirectoryName,
  extractFileName,
} from '@tagspaces/tagspaces-common/paths';
import { useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TagsSelect from '../TagsSelect';

interface Props {
  open: boolean;
  onClose: (clearSelection?: boolean) => void;
  selected?: TS.FileSystemEntry[];
}

function AddRemoveTagsDialog(props: Props) {
  const { t } = useTranslation();
  const { open, selected } = props;

  const { findLocation } = useCurrentLocationContext();
  const { addTagsToFsEntries, removeTags } = useTaggingActionsContext();
  const { selectedEntries } = useSelectedEntriesContext();
  const [newlyAddedTags, setNewlyAddedTags] = useState<TS.Tag[]>([]);
  const inputTags = useRef<TS.Tag[]>([]);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const currentLocation = findLocation();
  const currentEntries = selected || selectedEntries;

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

  const handleNewTags = (newTags: TS.Tag[]) => {
    if (newTags === undefined) {
      if (inputTags.current.length > 0) {
        setNewlyAddedTags(
          uniqueTags([...newlyAddedTags, ...inputTags.current]),
        );
      }
    } else {
      inputTags.current = newTags;
      forceUpdate();
    }
  };
  function uniqueTags(tagsArray: TS.Tag[]): TS.Tag[] {
    return tagsArray.reduce((acc: TS.Tag[], current) => {
      // Check if an object with the same 'id' exists in the accumulator
      if (!acc.some((item) => item.title === current.title)) {
        acc.push(current);
      }
      return acc;
    }, []);
  }

  /*const onClose = () => {
    onCloseDialog();
  };*/

  const onCloseDialog = (clearSelection?: boolean) => {
    setNewlyAddedTags([]);
    props.onClose(clearSelection);
  };

  const addTagsAction = () => {
    if (currentEntries && currentEntries.length > 0) {
      addTagsToFsEntries(
        currentEntries,
        uniqueTags([...newlyAddedTags, ...inputTags.current]),
      );
    }
    onCloseDialog(true);
  };

  const removeTagsAction = () => {
    if (currentEntries && currentEntries.length > 0) {
      removeTags(currentEntries, [...newlyAddedTags, ...inputTags.current]);
    }
    onCloseDialog(true);
  };

  const removeAllTagsAction = () => {
    if (currentEntries && currentEntries.length > 0) {
      removeTags(currentEntries);
    }
    onCloseDialog(true);
  };

  const disabledButtons =
    (!newlyAddedTags && !inputTags.current) ||
    (newlyAddedTags.length < 1 && inputTags.current.length < 1) ||
    currentEntries.length < 1;

  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog
      open={open}
      fullScreen={smallScreen}
      onClose={onCloseDialog}
      keepMounted
      scroll="paper"
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      aria-labelledby="draggable-dialog-title"
    >
      <TsDialogTitle
        dialogTitle={t('core:tagOperationTitle')}
        closeButtonTestId="closeAddRemoveTagsTID"
        onClose={onCloseDialog}
      />
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
          handleNewTags={handleNewTags}
          tagMode="remove"
          autoFocus={true}
        />
        <Typography sx={{ marginTop: '10px' }} variant="subtitle2">
          {t('selectedFilesAndFolders')}
        </Typography>
        <List dense sx={{ width: '550px', marginLeft: '-15px' }}>
          {currentEntries.length > 0 &&
            currentEntries.map((entry) => (
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
      <TsDialogActions>
        <TsButton
          data-tid="cancelTagsMultipleEntries"
          onClick={() => onCloseDialog()}
        >
          {t('core:cancel')}
        </TsButton>
        <TsButton
          data-tid="cleanTagsMultipleEntries"
          disabled={currentEntries.length < 1}
          onClick={removeAllTagsAction}
        >
          {t('core:tagOperationCleanTags')}
        </TsButton>
        <TsButton
          data-tid="removeTagsMultipleEntries"
          disabled={disabledButtons}
          onClick={removeTagsAction}
        >
          {t('core:tagOperationRemoveTag')}
        </TsButton>
        <TsButton
          data-tid="addTagsMultipleEntries"
          disabled={disabledButtons}
          variant="contained"
          onClick={addTagsAction}
        >
          {t('core:tagOperationAddTag')}
        </TsButton>
      </TsDialogActions>
    </Dialog>
  );
}

export default AddRemoveTagsDialog;
