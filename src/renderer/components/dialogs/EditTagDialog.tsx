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

import Tag from '-/components/Tag';
import TsButton from '-/components/TsButton';
import TsTextField from '-/components/TsTextField';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { TS } from '-/tagspaces.namespace';
import { useTheme } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import useMediaQuery from '@mui/material/useMediaQuery';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TransparentBackground from '../TransparentBackground';
import ColorPickerDialog from './ColorPickerDialog';

interface Props {
  open: boolean;
  onClose: () => void;
  selectedTag: TS.Tag;
  selectedTagGroupEntry: TS.TagGroup;
}

function EditTagDialog(props: Props) {
  const { t } = useTranslation();
  const { editTag } = useTaggingActionsContext();
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);
  const [displayTextColorPicker, setDisplayTextColorPicker] =
    useState<boolean>(false);
  const [inputError, setInputError] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(props.selectedTag.title);
  const [description, setDescription] = useState<string>(
    props.selectedTag.description,
  );
  const [color, setColor] = useState<string>(props.selectedTag.color);
  const [textcolor, setTextcolor] = useState<string>(
    props.selectedTag.textcolor,
  );

  useEffect(() => {
    handleValidation();
  }, [title]);

  const handleTagTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'title') {
      setTitle(value);
    }
  };

  const handleTagDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'description') {
      setDescription(value);
    }
  };

  const handleValidation = () => {
    const tagCheck = RegExp(/^[^#/\\ [\]]{1,}$/);
    if (title && tagCheck.test(title)) {
      setInputError(false);
    } else {
      setInputError(true);
    }
  };

  const onConfirm = () => {
    if (!inputError && props.selectedTagGroupEntry && props.selectedTag) {
      editTag(
        {
          ...props.selectedTag,
          title,
          color,
          textcolor,
          description,
        },
        props.selectedTagGroupEntry.uuid,
        props.selectedTag.title,
      );
      props.onClose();
    }
  };

  const { open, onClose } = props;
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const okButton = (
    <TsButton
      disabled={inputError}
      onClick={onConfirm}
      data-tid="editTagConfirm"
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
      fullScreen={smallScreen}
      onClose={onClose}
      keepMounted
      scroll="paper"
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
          event.preventDefault();
          event.stopPropagation();
          onConfirm();
        } /*else if (event.key === 'Escape') {
          onClose();
        }*/
      }}
    >
      <TsDialogTitle
        dialogTitle={t('core:editTagTitle')}
        closeButtonTestId="closeEditTagTID"
        onClose={onClose}
        actionSlot={okButton}
      />
      <DialogContent>
        <FormControl
          fullWidth={true}
          error={inputError}
          sx={{ overflow: 'visible' }}
        >
          {props.selectedTag.modified_date && (
            <div
              className="tag-date"
              style={{
                fontSize: 12,
                position: 'relative',
                bottom: 20,
                color: '#808080',
              }}
            >
              <span className="text" style={{ fontWeight: 600 }}>
                {`${t('core:modifiedDate')}: `}
              </span>
              <time>
                {format(
                  new Date(props.selectedTag.modified_date),
                  'yyyy-MM-dd',
                )}
              </time>
            </div>
          )}
          <TsTextField
            error={inputError}
            name="title"
            autoFocus
            label={t('core:editTag')}
            onChange={handleTagTitleChange}
            value={title}
            data-tid="editTagInput"
          />
          {inputError && (
            <FormHelperText>{t('core:tagTitleHelper')}</FormHelperText>
          )}
        </FormControl>
        <FormControl fullWidth={true}>
          <TsTextField
            name="description"
            label={t('core:editDescription')}
            onChange={handleTagDescriptionChange}
            value={description}
            data-tid="editTagDescription"
          />
        </FormControl>
        <ListItem sx={{ paddingLeft: 0, paddingRight: 0 }}>
          <ListItemText primary={t('core:tagBackgroundColor')} />
          <TransparentBackground>
            <TsButton
              onClick={() => setDisplayColorPicker(!displayColorPicker)}
              data-tid="tagBackgroundColorEditTagDialog"
              sx={{
                height: '30px',
                borderRadius: '2px',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'gray',
                padding: '5px',
                background: color,
              }}
              role="presentation"
            >
              &nbsp;
            </TsButton>
          </TransparentBackground>
          {displayColorPicker && (
            <ColorPickerDialog
              open={displayColorPicker}
              setColor={(value) => setColor(value)}
              onClose={() => setDisplayColorPicker(!displayColorPicker)}
              color={color}
            />
          )}
        </ListItem>
        <ListItem sx={{ paddingLeft: 0, paddingRight: 0 }}>
          <ListItemText primary={t('core:tagForegroundColor')} />
          <TransparentBackground>
            <TsButton
              onClick={() => setDisplayTextColorPicker(!displayTextColorPicker)}
              data-tid="tagForegroundColorEditTagDialog"
              sx={{
                height: '30px',
                borderRadius: '2px',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'gray',
                padding: '5px',
                background: textcolor,
              }}
              role="presentation"
            >
              &nbsp;
            </TsButton>
          </TransparentBackground>
          {displayTextColorPicker && (
            <ColorPickerDialog
              open={displayTextColorPicker}
              setColor={(txtcolor) => setTextcolor(txtcolor)}
              onClose={() => setDisplayTextColorPicker(!displayTextColorPicker)}
              color={textcolor}
            />
          )}
        </ListItem>
        <ListItem sx={{ paddingLeft: 0, paddingRight: 0 }}>
          <ListItemText primary={t('core:tagPreview')} />
          <Tag backgroundColor={color} textColor={textcolor} isDragging={false}>
            <span style={{ textTransform: 'lowercase' }}>
              {t('core:tagPreview')}
            </span>
            <span style={{ margin: 3 }} />
          </Tag>
        </ListItem>
      </DialogContent>
      {!smallScreen && (
        <TsDialogActions>
          <TsButton onClick={props.onClose} data-tid="closeEditTagDialog">
            {t('core:cancel')}
          </TsButton>
          {okButton}
        </TsDialogActions>
      )}
    </Dialog>
  );
}

export default EditTagDialog;
