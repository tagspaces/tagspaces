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

import React, {
  useState,
  useEffect,
  useMemo,
  ChangeEvent,
  useRef
} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import withStyles from '@mui/styles/withStyles';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Dialog from '@mui/material/Dialog';
import EditIcon from '@mui/icons-material/Edit';
import AppConfig from '-/AppConfig';
import i18n from '-/services/i18n';
import { isGeoTag } from '-/utils/geo';
import { Pro } from '-/pro';
import { getSelectedEntries, getSelectedTag } from '-/reducers/app';
import TaggingActions from '-/reducers/tagging-actions';
import { isDateTimeTag } from '-/utils/dates';
import { TS } from '-/tagspaces.namespace';
import useValidation from '-/utils/useValidation';
import { getMapTileServer } from '-/reducers/settings';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import useTheme from '@mui/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';

const styles = () => ({
  root: {
    minWidth: 400,
    height: '100%',
    marginBottom: 30
  }
});

interface Props {
  classes: any;
  open: boolean;
  onClose: () => void;
  editTagForEntry: (path: string, tag: TS.Tag, title: string) => void;
  selectedEntries: Array<TS.FileSystemEntry>;
  selectedTag: TS.Tag;
  tileServer: TS.MapTileServer;
  geoTaggingFormat: string;
}

const GeoTagEditor = Pro && Pro.UI ? Pro.UI.GeoTagEditor : React.Fragment;
const DateTagEditor = Pro && Pro.UI ? Pro.UI.DateTagEditor : React.Fragment;

function EditEntryTagDialog(props: Props) {
  const [showAdvancedMode, setShowAdvancedMode] = useState<boolean>(false);
  const [title, setTitle] = useState(
    props.selectedTag && props.selectedTag.title
  );
  const titleRef = useRef<HTMLInputElement>(null);
  const isShowDatePeriodEditor = useMemo(() => {
    let showDatePeriodEditor = false;
    if (title && title.indexOf('-') > -1) {
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
    return DateTagEditor && showDatePeriodEditor;
  }, []);
  const [editDisabled, setEditDisabled] = useState<boolean>(
    isShowDatePeriodEditor
  );
  const { setError, haveError } = useValidation();
  const { onClose, open } = props;

  useEffect(() => {
    if (titleRef && titleRef.current) {
      titleRef.current.value = title;
    }
    // handleValidation();
  }, [title]);

  function handleValidation() {
    // Tags should be at least 1 character long and should not contain: spaces, \, / #
    const tagCheck = RegExp(/^[^#/\\ [\]]{1,}$/);
    if (title && tagCheck.test(title)) {
      setError('tag', false);
      return true;
    }
    setError('tag');
    return false;
  }

  function onConfirm() {
    if (handleValidation() && !haveError()) {
      /* if (props.selectedEntries.length > 0) {
        props.selectedEntries.forEach(entry =>
          props.editTagForEntry(entry.path, props.selectedTag, title)
        );
      } else { */
      props.editTagForEntry(props.selectedTag.path, props.selectedTag, title);
      props.onClose();
    }
  }

  function renderTitle() {
    return (
      <DialogTitle>
        {i18n.t('core:tagProperties')}{' '}
        <DialogCloseButton testId="closeEditEntryTagTID" onClose={onClose} />
      </DialogTitle>
    );
  }

  function renderContent() {
    const showGeoEditor = GeoTagEditor && isGeoTag(title);

    return (
      <DialogContent
        data-tid="editEntryTagDialog"
        className={props.classes.root}
        style={{
          overflow: AppConfig.isFirefox ? 'auto' : 'overlay'
        }}
      >
        <FormControl fullWidth={true} error={haveError('tag')}>
          <TextField
            fullWidth={true}
            error={haveError('tag')}
            disabled={editDisabled}
            inputRef={titleRef}
            margin="dense"
            name="title"
            autoFocus
            label={i18n.t('core:editTag')}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const { target } = event;
              setTitle(target.value);
            }}
            defaultValue={title}
            data-tid="editTagEntryDialog_input"
            InputProps={{
              endAdornment: (
                <EditIcon onClick={() => setEditDisabled(!editDisabled)} />
              )
            }}
          />
          {haveError('tag') && (
            <FormHelperText>{i18n.t('core:tagTitleHelper')}</FormHelperText>
          )}
        </FormControl>
        {showGeoEditor && (
          <GeoTagEditor
            geoTag={title}
            onChange={setTitle}
            // zoom={title === defaultTagLocation ? 2 : undefined} TODO defaultTagLocation can be in MGRS format
            showAdvancedMode={showAdvancedMode}
            geoTaggingFormat={props.geoTaggingFormat}
            haveError={haveError}
            setError={setError}
            tileServer={props.tileServer}
          />
        )}
        {editDisabled && isShowDatePeriodEditor && (
          <DateTagEditor
            datePeriodTag={props.selectedTag && props.selectedTag.title}
            onChange={setTitle}
          />
        )}
      </DialogContent>
    );
  }

  function renderActions() {
    return (
      <DialogActions
        style={{
          justifyContent: 'space-between'
        }}
      >
        {GeoTagEditor && isGeoTag(title) ? (
          <Button
            data-tid="switchAdvancedModeTID"
            onClick={() => setShowAdvancedMode(!showAdvancedMode)}
          >
            {showAdvancedMode
              ? i18n.t('core:switchSimpleMode')
              : i18n.t('core:switchAdvancedMode')}
          </Button>
        ) : (
          <div />
        )}
        <div>
          <Button data-tid="closeEditTagEntryDialog" onClick={props.onClose}>
            {i18n.t('core:cancel')}
          </Button>
          <Button
            disabled={haveError()}
            onClick={onConfirm}
            data-tid="confirmEditTagEntryDialog"
            color="primary"
          >
            {i18n.t('core:ok')}
          </Button>
        </div>
      </DialogActions>
    );
  }

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog
      open={open}
      fullScreen={fullScreen}
      onClose={onClose}
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
      {renderTitle()}
      {renderContent()}
      {renderActions()}
    </Dialog>
  );
}

function mapStateToProps(state) {
  return {
    selectedTag: getSelectedTag(state),
    /* currentEntryPath: getSelectedTag(state)
      ? getSelectedTag(state).path
      : undefined, */
    selectedEntries: getSelectedEntries(state),
    tileServer: getMapTileServer(state),
    geoTaggingFormat: state.settings.geoTaggingFormat
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      editTagForEntry: TaggingActions.editTagForEntry
    },
    dispatch
  );
}

const areEqual = (prevProp, nextProp) =>
  JSON.stringify(nextProp.selectedTag) === JSON.stringify(prevProp.selectedTag);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(withStyles(styles)(EditEntryTagDialog), areEqual));
