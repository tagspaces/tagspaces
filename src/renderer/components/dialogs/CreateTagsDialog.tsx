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
import TsTextField from '-/components/TsTextField';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { parseNewTags } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import useFirstRender from '-/utils/useFirstRender';
import { Paper, useTheme } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
      const newTags = parseNewTags(tagTitle, selectedTagGroupEntry);
      addTag(newTags, selectedTagGroupEntry.uuid);
      onClose();
    }
  };

  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const okButton = (
    <TsButton
      disabled={inputError}
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
        dialogTitle={t('core:addTagsToGroupTitle')}
        closeButtonTestId="closeCreateTagTID"
        onClose={onClose}
        actionSlot={okButton}
      />
      <DialogContent style={{ minWidth: 300, paddingTop: 10 }}>
        <FormControl fullWidth={true} error={inputError}>
          <TsTextField
            error={inputError}
            name="tagTitle"
            autoFocus
            label={t('core:addTagsToGroupTagsPlaceholder')}
            onChange={handleTagTitleChange}
            value={tagTitle}
            data-tid="addTagsInput"
          />
          {inputError && (
            <FormHelperText>{t('core:tagTitleHelper')}</FormHelperText>
          )}
        </FormControl>
      </DialogContent>
      {!smallScreen && (
        <TsDialogActions>
          <TsButton onClick={onClose}>{t('core:cancel')}</TsButton>
          {okButton}
        </TsDialogActions>
      )}
    </Dialog>
  );
}

export default CreateTagsDialog;
