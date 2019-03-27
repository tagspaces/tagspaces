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
 * @flow
 */

import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import i18n from '../../services/i18n';
import { type Tag } from '../../reducers/taglibrary';

const styles = theme => ({
  root: {
    width: 550,
    height: '100%',
    marginBottom: 30,
    // background: theme.palette.background.paper
  },
});

type Props = {
  classes: Object,
  open: boolean,
  onClose: () => void,
  editTagForEntry: (path: string, tag: Tag, title: string) => void,
  currentEntryPath: string,
  selectedTag: Tag,
  open: boolean
};

const EditEntryTagDialog = (props: Props) => {
  const [disableConfirmButton, setDisableConfirmButton] = useState(true);
  const [errorTag, setErrorTag] = useState(false);
  const [title, setTitle] = useState('');

  function componentWillReceiveProps(nextProps: any) {
    if (nextProps.open === true) {
      setDisableConfirmButton(!nextProps.selectedTag.title);
      setTitle(nextProps.selectedTag.title);
      // this.setState({
      //   disableConfirmButton: !nextProps.selectedTag.title,
      //   title: nextProps.selectedTag.title
    }
  }

  function handleInputChange(event: Object) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setTitle(value);
    handleValidation();
  }

  function handleValidation() {
    const tagCheck = RegExp(/^[^\#\/\\ \[\]]{1,}$/);
    if (title && tagCheck.test(title)) {
      setErrorTag(false);
      setDisableConfirmButton(false); // { errorTag: false, disableConfirmButton: false });
    } else {
      setErrorTag(true);
      setDisableConfirmButton(true); // this.setState({ errorTag: true, disableConfirmButton: true });
    }
  }

  function onConfirm() {
    if (!disableConfirmButton) {
      props.editTagForEntry(props.currentEntryPath, props.selectedTag, state.title);
      setErrorTag(false); // this.setState({ errorTag: false, disableConfirmButton: true });
      setDisableConfirmButton(true);
      props.onClose();
    }
  }

  function renderTitle() {
    return (
      <DialogTitle>{i18n.t('core:tagProperties')}</DialogTitle>
    );
  }

  function renderContent() {
    return (
      <DialogContent data-tid="editEntryTagDialog" className={props.classes.root}>
        <FormControl
          fullWidth={true}
          error={errorTag}
        >
          <TextField
            fullWidth={true}
            error={errorTag}
            margin="dense"
            name="title"
            label={i18n.t('core:editTag')}
            onChange={handleInputChange}
            value={title}
            data-tid="editTagEntryDialog_input"
          />
          {errorTag && <FormHelperText>{i18n.t('core:tagTitleHelper')}</FormHelperText>}
        </FormControl>
      </DialogContent>
    );
  }

  function renderActions() {
    return (
      <DialogActions>
        <Button
          data-tid="closeEditTagEntryDialog"
          onClick={props.onClose}
          color="primary"
        >
          {i18n.t('core:cancel')}
        </Button>
        <Button
          disabled={disableConfirmButton}
          onClick={onConfirm}
          data-tid="confirmEditTagEntryDialog"
          color="primary"
        >
          {i18n.t('core:ok')}
        </Button>
      </DialogActions>
    );
  }

  return (
    <GenericDialog
      open={props.open}
      onClose={props.onClose}
      onEnterKey={(event) => onEnterKeyHandler(event, onConfirm)}
      renderTitle={renderTitle}
      renderContent={renderContent}
      renderActions={renderActions}
    />
  );
};

export default withStyles(styles)(EditEntryTagDialog);
