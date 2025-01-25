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
import i18n from '-/services/i18n';
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
import React, { useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AiGenTagsButton from '-/components/chat/AiGenTagsButton';
import { Pro } from '-/pro';
import AiGenDescButton from '-/components/chat/AiGenDescButton';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { CommonLocation } from '-/utils/CommonLocation';
import MenuItem from '@mui/material/MenuItem';
import TsSelect from '-/components/TsSelect';
import { useTagGroupsLocationContext } from '-/hooks/useTagGroupsLocationContext';
import { getTagLibrary } from '-/services/taglibrary-utils';

interface Props {
  open: boolean;
  onClose: (clearSelection?: boolean) => void;
  selected?: TS.FileSystemEntry[];
}

function AiGenerationDialog(props: Props) {
  const { t } = useTranslation();
  const { selectedEntries } = useSelectedEntriesContext();
  const selected = props.selected ? props.selected : selectedEntries;

  const { currentLocation } = useCurrentLocationContext();
  const useTagsFromTagLibrary = useRef<boolean>(false);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const tagGroups = getTagLibrary();

  const onClose = () => {
    onCloseDialog();
  };

  const onCloseDialog = (clearSelection?: boolean) => {
    props.onClose(clearSelection);
  };

  const { open } = props;

  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog
      open={open}
      fullScreen={smallScreen}
      onClose={onClose}
      keepMounted
      scroll="paper"
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      aria-labelledby="draggable-dialog-title"
    >
      <TsDialogTitle
        dialogTitle={t('core:aiOperationTitle')}
        closeButtonTestId="closeAiOperationsTID"
        onClose={onClose}
      />
      <DialogContent
        style={{
          minHeight: 330,
          paddingTop: 10,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <AiGenTagsButton
          disabled={!Pro}
          entries={selected}
          variant="outlined"
          generationCompleted={() => onCloseDialog()}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={useTagsFromTagLibrary.current}
              onChange={(event, checked) => {
                useTagsFromTagLibrary.current = checked;
                forceUpdate();
              }}
              value={useTagsFromTagLibrary.current}
              tabIndex={-1}
            />
          }
          label={i18n.t('useTagsFromTagLibraryOnly')}
        />
        {useTagsFromTagLibrary.current && (
          <TsSelect fullWidth={true} onChange={() => {}} value={''}>
            {tagGroups.map((tagGroup: TS.TagGroup) => (
              <MenuItem key={tagGroup.uuid} value={tagGroup.title}>
                <span style={{ width: '100%' }}>{tagGroup.title}</span>
              </MenuItem>
            ))}
          </TsSelect>
        )}

        <AiGenDescButton />
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
      <TsDialogActions>
        <TsButton
          data-tid="cancelTagsMultipleEntries"
          onClick={() => onCloseDialog()}
        >
          {t('core:cancel')}
        </TsButton>
      </TsDialogActions>
    </Dialog>
  );
}

export default AiGenerationDialog;
