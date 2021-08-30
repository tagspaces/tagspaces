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
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Dialog from '@material-ui/core/Dialog';
import i18n from '-/services/i18n';
import useFirstRender from '-/utils/useFirstRender';
import { TS } from '-/tagspaces.namespace';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';

interface Props {
  open: boolean;
  onClose: () => void;
  addTag: (tags: string, uuid: string) => void;
  fullScreen?: boolean;
  selectedTagGroupEntry: TS.TagGroup;
}

const CreateTagsDialog = (props: Props) => {
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
      props.addTag(tagTitle, props.selectedTagGroupEntry.uuid);
      props.onClose();
    }
  };

  const { fullScreen, open, onClose } = props;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      keepMounted
      scroll="paper"
      onKeyDown={event => {
        if (event.key === 'Enter' || event.keyCode === 13) {
          event.preventDefault();
          event.stopPropagation();
          onConfirm();
        } else if (event.key === 'Escape') {
          onClose();
        }
      }}
    >
      <DialogTitle>
        {i18n.t('core:addTagsToGroupTitle')}
        <DialogCloseButton onClose={onClose} />
      </DialogTitle>
      <DialogContent style={{ minWidth: 400 }}>
        <FormControl fullWidth={true} error={inputError}>
          <TextField
            error={inputError}
            name="tagTitle"
            autoFocus
            label={i18n.t('core:addTagsToGroupTagsPlaceholder')}
            onChange={handleTagTitleChange}
            value={tagTitle}
            data-tid="addTagsInput"
            fullWidth={true}
          />
          {inputError && (
            <FormHelperText>{i18n.t('core:tagTitleHelper')}</FormHelperText>
          )}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{i18n.t('core:cancel')}</Button>
        <Button
          disabled={inputError}
          onClick={onConfirm}
          data-tid="createTagsConfirmButton"
          color="primary"
        >
          {i18n.t('core:ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTagsDialog;
