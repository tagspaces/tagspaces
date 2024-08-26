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
  useRef,
} from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Dialog from '@mui/material/Dialog';
import EditIcon from '@mui/icons-material/Edit';
import { isGeoTag } from '-/utils/geo';
import { Pro } from '-/pro';
import { isDateTimeTag } from '-/utils/dates';
import { TS } from '-/tagspaces.namespace';
import useValidation from '-/utils/useValidation';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';

interface Props {
  open: boolean;
  tag: TS.Tag;
  onClose: () => void;
}

const GeoTagEditor = Pro && Pro.UI ? Pro.UI.GeoTagEditor : React.Fragment;
const DateTagEditor = Pro && Pro.UI ? Pro.UI.DateTagEditor : React.Fragment;

function EditEntryTagDialog(props: Props) {
  const { t } = useTranslation();

  const { onClose, open, tag } = props;

  const { addTagsToEntry, editTagForEntry } = useTaggingActionsContext();
  // const selectedTag: TS.Tag = useSelector(getSelectedTag);
  const [showAdvancedMode, setShowAdvancedMode] = useState<boolean>(false);
  const [title, setTitle] = useState(tag && tag.title);

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
    isShowDatePeriodEditor,
  );
  const { setError, haveError } = useValidation();

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
      const isNew =
        tag.functionality === 'geoTagging' ||
        tag.functionality === 'dateTagging'; //path.includes(props.selectedTag.title);
      if (isNew) {
        addTagsToEntry(tag.path, [{ ...tag, title }]);
      } else {
        editTagForEntry(tag.path, tag, title);
      }
      props.onClose();
    }
  }

  function renderTitle() {
    return (
      <DialogTitle>
        {t('core:tagProperties')}{' '}
        <DialogCloseButton testId="closeEditEntryTagTID" onClose={onClose} />
      </DialogTitle>
    );
  }

  function renderContent() {
    const showGeoEditor = GeoTagEditor && isGeoTag(title);

    return (
      <DialogContent
        data-tid="editEntryTagDialog"
        style={{
          overflow: 'auto',
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
            label={t('core:editTag')}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const { target } = event;
              setTitle(target.value);
            }}
            defaultValue={title}
            data-tid="editTagEntryDialog_input"
            InputProps={{
              endAdornment: (
                <EditIcon onClick={() => setEditDisabled(!editDisabled)} />
              ),
            }}
          />
          {haveError('tag') && (
            <FormHelperText>{t('core:tagTitleHelper')}</FormHelperText>
          )}
        </FormControl>
        {showGeoEditor && (
          <GeoTagEditor
            geoTag={title}
            onChange={setTitle}
            // zoom={title === defaultTagLocation ? 2 : undefined} TODO defaultTagLocation can be in MGRS format
            showAdvancedMode={showAdvancedMode}
            haveError={haveError}
            setError={setError}
          />
        )}
        {editDisabled && isShowDatePeriodEditor && (
          <DateTagEditor datePeriodTag={tag && tag.title} onChange={setTitle} />
        )}
      </DialogContent>
    );
  }

  function renderActions() {
    return (
      <DialogActions
        style={{
          justifyContent: 'space-between',
        }}
      >
        {GeoTagEditor && isGeoTag(title) ? (
          <Button
            data-tid="switchAdvancedModeTID"
            onClick={() => setShowAdvancedMode(!showAdvancedMode)}
          >
            {showAdvancedMode
              ? t('core:switchSimpleMode')
              : t('core:switchAdvancedMode')}
          </Button>
        ) : (
          <div />
        )}
        <div>
          <Button data-tid="closeEditTagEntryDialog" onClick={props.onClose}>
            {t('core:cancel')}
          </Button>
          <Button
            disabled={haveError()}
            onClick={onConfirm}
            data-tid="confirmEditTagEntryDialog"
            color="primary"
            variant="contained"
          >
            {t('core:ok')}
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
      style={{
        minWidth: 400,
        height: '100%',
        marginBottom: 30,
      }}
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
      {renderTitle()}
      {renderContent()}
      {renderActions()}
    </Dialog>
  );
}

export default EditEntryTagDialog;
