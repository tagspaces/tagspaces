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

import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Dialog from '@mui/material/Dialog';
import useFirstRender from '-/utils/useFirstRender';
import { TS } from '-/tagspaces.namespace';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { useTranslation } from 'react-i18next';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';

interface Props {
  open: boolean;
  onClose: () => void;
  selectedTagGroupEntry: TS.TagGroup;
}

function CreateTagsDialog(props: Props) {
  const { open, onClose, selectedTagGroupEntry } = props;
  const { t } = useTranslation();
  const { addTag } = useTaggingActionsContext();
  const [inputError, setInputError] = useState<boolean>(false);
  const [tagTitle, setTagTitle] = useState<string>('');

  const firstRender = useFirstRender();

  useEffect(() => {
    if (!firstRender) {
      handleValidation();
    }
  }, [tagTitle]);

  const handleTagTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    // const { value, name } = target;

    setTagTitle(target.value);
    /* if (name === 'tagTitle') {
      this.setState({ tagTitle: value }, this.handleValidation);
    } */
  };

  const handleValidation = () => {
    const tagCheck = RegExp(/^[^#/\\[\]]{1,}$/);
    if (tagTitle && tagCheck.test(tagTitle)) {
      if (inputError) {
        setInputError(false);
      }
    } else if (!inputError) {
      setInputError(true);
    }
  };

  const onConfirm = () => {
    if (!inputError) {
      addTag(tagTitle, selectedTagGroupEntry.uuid);
      onClose();
    }
  };

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
        {t('core:addTagsToGroupTitle')}
        <DialogCloseButton testId="closeCreateTagTID" onClose={onClose} />
      </DialogTitle>
      <DialogContent style={{ minWidth: 350, paddingTop: 10 }}>
        <FormControl fullWidth={true} error={inputError}>
          <TextField
            error={inputError}
            name="tagTitle"
            autoFocus
            label={t('core:addTagsToGroupTagsPlaceholder')}
            onChange={handleTagTitleChange}
            value={tagTitle}
            data-tid="addTagsInput"
            fullWidth={true}
          />
          {inputError && (
            <FormHelperText>{t('core:tagTitleHelper')}</FormHelperText>
          )}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('core:cancel')}</Button>
        <Button
          disabled={inputError}
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

export default CreateTagsDialog;
