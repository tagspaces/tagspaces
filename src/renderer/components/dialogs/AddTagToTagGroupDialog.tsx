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
import { useSelector, useDispatch } from 'react-redux';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Dialog from '@mui/material/Dialog';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Input from '@mui/material/Input';
import MenuItem from '@mui/material/MenuItem';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { getTagColor, getTagTextColor } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { getTagLibrary } from '-/services/taglibrary-utils';
import { useTranslation } from 'react-i18next';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';

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
  //const dispatch: AppDispatch = useDispatch();
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
    addTag(selectedTag, tagGroup);
    //dispatch(AppActions.addTag(selectedTag, tagGroup));
    props.onClose();
  };

  const { open, onClose } = props;

  // const theme = useTheme();
  // const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog
      open={open}
      onClose={onClose}
      // fullScreen={fullScreen}
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
      <DialogTitle>
        {t('core:addTagToTagGroup') + ': ' + props.selectedTag.title}
        <DialogCloseButton
          testId="closeAddTagToGroupDialogTID"
          onClose={onClose}
        />
      </DialogTitle>
      <DialogContent style={{ paddingTop: 10, minWidth: 350 }}>
        <FormControl fullWidth={true}>
          <InputLabel htmlFor="addTagToTagGroupInput">
            {t('core:chooseTagGroup')}
          </InputLabel>
          <Select
            value={tagGroup}
            onChange={handleTagGroupChange}
            input={<Input id="addTagToTagGroupInput" />}
          >
            {getTagLibrary().map((tg) => (
              <MenuItem value={tg.uuid}>{tg.title}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('core:cancel')}</Button>
        <Button
          disabled={tagGroup === undefined}
          onClick={onConfirm}
          data-tid="createTagsConfirmButton"
          color="primary"
          variant="contained"
        >
          {t('core:ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddTagToTagGroupDialog;
