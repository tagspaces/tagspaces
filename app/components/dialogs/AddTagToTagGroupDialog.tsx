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
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { connect } from 'react-redux';
// import { getTagGroups } from '-/reducers/taglibrary';
import i18n from '-/services/i18n';
import { getTagColor, getTagTextColor } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import useTheme from '@mui/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getTagLibrary } from '-/services/taglibrary-utils';

interface Props {
  open: boolean;
  onClose: () => void;
  addTag: (tag: TS.Tag, uuid: string) => void;
  selectedTag: TS.Tag;
  defaultBackgroundColor?: string;
  defaultTextColor?: string;
  // tagGroups: Array<TS.TagGroup>;
}

function AddTagToTagGroupDialog(props: Props) {
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

  const { open, onClose } = props;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
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
        } /*else if (event.key === 'Escape') {
          onClose();
        }*/
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
          size="large"
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
            {getTagLibrary().map(tg => (
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
}

const mapStateToProps = state => ({
  // tagGroups: getTagGroups(state),
  defaultBackgroundColor: getTagColor(state),
  defaultTextColor: getTagTextColor(state)
});

export default connect(mapStateToProps)(AddTagToTagGroupDialog);
