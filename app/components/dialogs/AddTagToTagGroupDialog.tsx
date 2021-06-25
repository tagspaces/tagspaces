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
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import Dialog from '@material-ui/core/Dialog';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { connect } from 'react-redux';
import { getTagGroups } from '-/reducers/taglibrary';
import i18n from '-/services/i18n';
import { getTagColor, getTagTextColor } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';

interface Props {
  open: boolean;
  onClose: () => void;
  addTag: (tag: TS.Tag, uuid: string) => void;
  fullScreen?: boolean;
  selectedTag: TS.Tag;
  defaultBackgroundColor?: string;
  defaultTextColor?: string;
  tagGroups: Array<TS.TagGroup>;
}

const AddTagToTagGroupDialog = (props: Props) => {
  const [tagGroup, setTagGroup] = useState<string>(undefined);

  const handleTagGroupChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTagGroup(event.target.value);
  };

  const onConfirm = () => {
    const { defaultBackgroundColor, defaultTextColor, selectedTag } = props;
    if (!selectedTag.textcolor) {
      selectedTag.textcolor = defaultTextColor;
    }
    if (!selectedTag.color) {
      selectedTag.color = defaultBackgroundColor;
    }
    props.addTag(selectedTag, tagGroup);
    props.onClose();
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
        {i18n.t('core:addTagToTagGroup') + ': ' + props.selectedTag.title}
        <IconButton
          aria-label="close"
          style={{
            position: 'absolute',
            right: 5,
            top: 5
          }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent style={{ minWidth: 400 }}>
        <FormControl fullWidth={true}>
          <InputLabel htmlFor="addTagToTagGroupInput">
            {i18n.t('core:chooseTagGroup')}
          </InputLabel>
          <Select
            value={tagGroup}
            onChange={handleTagGroupChange}
            input={<Input id="addTagToTagGroupInput" />}
          >
            {props.tagGroups.map(tg => (
              <MenuItem value={tg.uuid}>{tg.title}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{i18n.t('core:cancel')}</Button>
        <Button
          disabled={tagGroup === undefined}
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

const mapStateToProps = state => ({
  tagGroups: getTagGroups(state),
  defaultBackgroundColor: getTagColor(state),
  defaultTextColor: getTagTextColor(state)
});

export default connect(mapStateToProps)(AddTagToTagGroupDialog);
