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

import React, { useEffect, useState } from 'react';
import TsButton from '-/components/TsButton';
import format from 'date-fns/format';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText/ListItemText';
import Dialog from '@mui/material/Dialog';
import ColorPickerDialog from './ColorPickerDialog';
import Tag from '-/components/Tag';
import TransparentBackground from '../TransparentBackground';
import TsTextField from '-/components/TsTextField';
import { TS } from '-/tagspaces.namespace';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { useTranslation } from 'react-i18next';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';

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

  // const theme = useTheme();
  // const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog
      open={open}
      // fullScreen={fullScreen}
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
      <DialogTitle style={{ overflow: 'visible' }}>
        {t('core:editTagTitle')}
        {`  `}
        <Tag
          backgroundColor={color}
          textColor={textcolor}
          isDragging={false}
          tagTitle={description}
        >
          {title}
          <span style={{ margin: 3 }} />
        </Tag>
        <DialogCloseButton testId="closeEditTagTID" onClose={onClose} />
      </DialogTitle>
      <DialogContent style={{ overflow: 'visible' }}>
        <FormControl
          fullWidth={true}
          error={inputError}
          style={{ overflow: 'visible' }}
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
        <ListItem style={{ paddingLeft: 0, paddingRight: 0 }}>
          <ListItemText primary={t('core:tagBackgroundColor')} />
          <TransparentBackground>
            <TsButton
              onClick={() => setDisplayColorPicker(!displayColorPicker)}
              data-tid="tagBackgroundColorEditTagDialog"
              style={{
                height: 30,
                borderRadius: 2,
                borderWidth: 1,
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
        <ListItem style={{ paddingLeft: 0, paddingRight: 0 }}>
          <ListItemText primary={t('core:tagForegroundColor')} />
          <TransparentBackground>
            <TsButton
              onClick={() => setDisplayTextColorPicker(!displayTextColorPicker)}
              data-tid="tagForegroundColorEditTagDialog"
              style={{
                height: 30,
                borderRadius: 2,
                borderWidth: 1,
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
      </DialogContent>
      <DialogActions>
        <TsButton onClick={props.onClose} data-tid="closeEditTagDialog">
          {t('core:cancel')}
        </TsButton>
        <TsButton
          disabled={inputError}
          onClick={onConfirm}
          data-tid="editTagConfirm"
          variant="contained"
        >
          {t('core:ok')}
        </TsButton>
      </DialogActions>
    </Dialog>
  );
}

export default EditTagDialog;
