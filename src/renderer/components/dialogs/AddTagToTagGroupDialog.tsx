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
import TsSelect from '-/components/TsSelect';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import { useEditedTagLibraryContext } from '-/hooks/useEditedTagLibraryContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { getTagColor, getTagTextColor } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { Paper, useTheme } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import TsDialogTitle from './components/TsDialogTitle';

interface Props {
  open: boolean;
  onClose: () => void;
  selectedTag: TS.Tag;
  defaultBackgroundColor?: string;
  defaultTextColor?: string;
}

function AddTagToTagGroupDialog(props: Props) {
  const { t } = useTranslation();
  const { addTag } = useTaggingActionsContext();
  const { tagGroups } = useEditedTagLibraryContext();
  const [tagGroup, setTagGroup] = useState<string>(undefined);
  const defaultBackgroundColor = useSelector(getTagColor);
  const defaultTextColor = useSelector(getTagTextColor);

  const handleTagGroupChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTagGroup(event.target.value);
  };

  const onConfirm = () => {
    const { selectedTag } = props;
    if (!selectedTag.textcolor) {
      selectedTag.textcolor = defaultTextColor;
    }
    if (!selectedTag.color) {
      selectedTag.color = defaultBackgroundColor;
    }
    addTag([selectedTag], tagGroup);
    props.onClose();
  };

  const { open, onClose } = props;

  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const okButton = (
    <TsButton
      disabled={tagGroup === undefined}
      onClick={onConfirm}
      data-tid="createTagsConfirmButton"
      variant="contained"
      sx={
        {
          WebkitAppRegion: 'no-drag',
        } as React.CSSProperties & { WebkitAppRegion?: string }
      }
    >
      {t('core:ok')}
    </TsButton>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={smallScreen}
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      keepMounted
      scroll="paper"
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
          event.preventDefault();
          event.stopPropagation();
          onConfirm();
        }
      }}
    >
      <TsDialogTitle
        dialogTitle={
          t('core:addTagToTagGroup') + ': ' + props.selectedTag.title
        }
        closeButtonTestId="closeAddTagToGroupDialogTID"
        onClose={onClose}
        actionSlot={okButton}
      />
      <DialogContent style={{ paddingTop: 10, minWidth: 350 }}>
        <FormControl fullWidth={true}>
          <TsSelect
            label={t('core:chooseTagGroup')}
            value={tagGroup}
            onChange={handleTagGroupChange}
          >
            {tagGroups.map((tg) => (
              <MenuItem value={tg.uuid}>{tg.title}</MenuItem>
            ))}
          </TsSelect>
        </FormControl>
      </DialogContent>
      <TsDialogActions>
        <TsButton onClick={onClose}>{t('core:cancel')}</TsButton>
        {okButton}
      </TsDialogActions>
    </Dialog>
  );
}

export default AddTagToTagGroupDialog;
