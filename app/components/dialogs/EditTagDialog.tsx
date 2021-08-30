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
import format from 'date-fns/format';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Dialog from '@material-ui/core/Dialog';
import ColorPickerDialog from './ColorPickerDialog';
import TransparentBackground from '../TransparentBackground';
import i18n from '-/services/i18n';
import { TS } from '-/tagspaces.namespace';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';

interface Props {
  open: boolean;
  fullScreen?: boolean;
  onClose: () => void;
  editTag: (tag: TS.Tag, tagGroupId: string, origTitle: string) => void;
  selectedTag: TS.Tag;
  selectedTagGroupEntry: TS.TagGroup;
}

const EditTagDialog = (props: Props) => {
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);
  const [displayTextColorPicker, setDisplayTextColorPicker] = useState<boolean>(
    false
  );
  const [inputError, setInputError] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(props.selectedTag.title);
  const [color, setColor] = useState<string>(props.selectedTag.color);
  const [textcolor, setTextcolor] = useState<string>(
    props.selectedTag.textcolor
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
    if (
      !inputError &&
      props.editTag &&
      props.selectedTagGroupEntry &&
      props.selectedTag
    ) {
      props.editTag(
        {
          ...props.selectedTag,
          title,
          color,
          textcolor
        },
        props.selectedTagGroupEntry.uuid,
        props.selectedTag.title
      );
      props.onClose();
    }
  };

  const { fullScreen, open, onClose } = props;
  const styles = {
    color: {
      width: '100%',
      height: 30,
      borderRadius: 2,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'gray',
      padding: '5px',
      background: color
    },
    textcolor: {
      width: '100%',
      height: 30,
      borderRadius: 2,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'gray',
      padding: '5px',
      background: textcolor
    },
    helpText: {
      marginBottom: '5px',
      fontSize: '1rem'
    }
  };

  return (
    <Dialog
      open={open}
      fullScreen={fullScreen}
      onClose={onClose}
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
      <DialogTitle style={{ overflow: 'visible' }}>
        {i18n.t('core:editTagTitle')}
        {` '${title}'`}
        <DialogCloseButton onClose={onClose} />
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
                color: '#808080'
              }}
            >
              <span className="text" style={{ fontWeight: 600 }}>
                {`${i18n.t('core:modifiedDate')}: `}
              </span>
              <time>
                {format(
                  new Date(props.selectedTag.modified_date),
                  'yyyy-mm-dd'
                )}
              </time>
            </div>
          )}
          <TextField
            error={inputError}
            margin="dense"
            name="title"
            autoFocus
            label={i18n.t('core:editTag')}
            onChange={handleTagTitleChange}
            value={title}
            data-tid="editTagInput"
            fullWidth={true}
          />
          {inputError && (
            <FormHelperText style={styles.helpText}>
              {i18n.t('core:tagTitleHelper')}
            </FormHelperText>
          )}
        </FormControl>
        <FormControl fullWidth={true}>
          <FormHelperText style={styles.helpText}>
            {i18n.t('core:tagBackgroundColor')}
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
              setColor={value => setColor(value)}
              onClose={() => setDisplayColorPicker(!displayColorPicker)}
              color={color}
            />
          )}
        </FormControl>
        <FormControl fullWidth={true}>
          <FormHelperText style={styles.helpText}>
            {i18n.t('core:tagForegroundColor')}
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
              setColor={txtcolor => setTextcolor(txtcolor)}
              onClose={() => setDisplayTextColorPicker(!displayTextColorPicker)}
              color={textcolor}
            />
          )}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} data-tid="closeEditTagDialog">
          {i18n.t('core:cancel')}
        </Button>
        <Button
          disabled={inputError}
          onClick={onConfirm}
          data-tid="editTagConfirm"
          color="primary"
        >
          {i18n.t('core:ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTagDialog;
