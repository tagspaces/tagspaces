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

import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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
import { isPlusCode } from '../../utils/misc';
import { type Tag } from '../../reducers/taglibrary';
import { Pro } from '../../pro';
import { getSelectedTag } from '../../reducers/app';
import TaggingActions, { defaultTagLocation } from '../../reducers/tagging-actions';
import { isDateTimeTag } from '../../utils/dates';

const styles = () => ({
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

const GeoTagEditor = Pro && Pro.UI ? Pro.UI.GeoTagEditor : React.Fragment;
const DateTagEditor = Pro && Pro.UI ? Pro.UI.DateTagEditor : React.Fragment;

const EditEntryTagDialog = (props: Props) => {
  const [disableConfirmButton, setDisableConfirmButton] = useState(true);
  const [errorTag, setErrorTag] = useState(false);
  const [title, setTitle] = useState(props.selectedTag && props.selectedTag.title);

  useEffect(() => {
    handleValidation();
  });

  function handleValidation() {
    const tagCheck = RegExp(/^[^\#\/\\ \[\]]{1,}$/);
    if (title && tagCheck.test(title)) {
      setErrorTag(false);
      setDisableConfirmButton(false);
    } else {
      setErrorTag(true);
      setDisableConfirmButton(true);
    }
  }

  function onConfirm() {
    if (!disableConfirmButton) {
      props.editTagForEntry(props.currentEntryPath, props.selectedTag, title);
      setErrorTag(false);
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
    const showGeoEditor = GeoTagEditor && isPlusCode(title);
    let showDatePeriodEditor = false;
    if (title.indexOf('-') > -1) {
      const a = title.split('-');
      if (a.length === 2) {
        for (let i = 0; i < a.length; i += 1) {
          if (isDateTimeTag(a[i])) {
            showDatePeriodEditor = true;
          } else {
            showDatePeriodEditor = false;
            break;
          }
        }
      }
    } else showDatePeriodEditor = isDateTimeTag(title);
    showDatePeriodEditor = DateTagEditor && showDatePeriodEditor;

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
            autoFocus
            label={i18n.t('core:editTag')}
            onChange={event => {
              const target = event.target;
              setTitle(target.value);
            }}
            value={title}
            data-tid="editTagEntryDialog_input"
          />
          {errorTag && <FormHelperText>{i18n.t('core:tagTitleHelper')}</FormHelperText>}
        </FormControl>
        { showGeoEditor && <GeoTagEditor key={title} geoTag={title} onChange={setTitle} zoom={title === defaultTagLocation ? 2 : undefined} /> }
        { showDatePeriodEditor && <DateTagEditor key={title} datePeriodTag={title} onChange={setTitle} /> }
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

function mapStateToProps(state) {
  return {
    selectedTag: getSelectedTag(state),
    currentEntryPath: getSelectedTag(state) ? getSelectedTag(state).path : undefined
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    editTagForEntry: TaggingActions.editTagForEntry
  }, dispatch);
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(EditEntryTagDialog)
);
