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
import format from 'date-fns/format';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Dialog from '@mui/material/Dialog';
import ColorPickerDialog from './ColorPickerDialog';
import TransparentBackground from '../TransparentBackground';
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
        },
        props.selectedTagGroupEntry.uuid,
        props.selectedTag.title,
      );
      props.onClose();
    }
  };

  const { open, onClose } = props;
  const styles = {
    color: {
      width: '100%',
      height: 30,
      borderRadius: 2,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'gray',
      padding: '5px',
      background: color,
    },
    textcolor: {
      width: '100%',
      height: 30,
      borderRadius: 2,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'gray',
      padding: '5px',
      background: textcolor,
    },
    helpText: {
      marginBottom: '5px',
      fontSize: '1rem',
    },
  };

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
        {` '${title}'`}
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
          <TextField
            error={inputError}
            margin="dense"
            name="title"
            autoFocus
            label={t('core:editTag')}
            onChange={handleTagTitleChange}
            value={title}
            data-tid="editTagInput"
            fullWidth={true}
          />
          {inputError && (
            <FormHelperText style={styles.helpText}>
              {t('core:tagTitleHelper')}
            </FormHelperText>
          )}
        </FormControl>
        <FormControl fullWidth={true}>
          <FormHelperText style={styles.helpText}>
            {t('core:tagBackgroundColor')}
          </FormHelperText>
          <TransparentBackground>
            <Button
              onClick={() => setDisplayColorPicker(!displayColorPicker)}
              data-tid="tagBackgroundColorEditTagDialog"
              style={styles.color}
              role="presentation"
            >
              &nbsp;
            </Button>
          </TransparentBackground>
          {displayColorPicker && (
            <ColorPickerDialog
              open={displayColorPicker}
              setColor={(value) => setColor(value)}
              onClose={() => setDisplayColorPicker(!displayColorPicker)}
              color={color}
            />
          )}
        </FormControl>
        <FormControl fullWidth={true}>
          <FormHelperText style={styles.helpText}>
            {t('core:tagForegroundColor')}
          </FormHelperText>
          <TransparentBackground>
            <Button
              onClick={() => setDisplayTextColorPicker(!displayTextColorPicker)}
              data-tid="tagForegroundColorEditTagDialog"
              style={styles.textcolor}
              role="presentation"
            >
              &nbsp;
            </Button>
          </TransparentBackground>
          {displayTextColorPicker && (
            <ColorPickerDialog
              open={displayTextColorPicker}
              setColor={(txtcolor) => setTextcolor(txtcolor)}
              onClose={() => setDisplayTextColorPicker(!displayTextColorPicker)}
              color={textcolor}
            />
          )}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} data-tid="closeEditTagDialog">
          {t('core:cancel')}
        </Button>
        <Button
          disabled={inputError}
          onClick={onConfirm}
          data-tid="editTagConfirm"
          color="primary"
          variant="contained"
        >
          {t('core:ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditTagDialog;
