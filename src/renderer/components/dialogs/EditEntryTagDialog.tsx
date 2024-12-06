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

import AppConfig from '-/AppConfig';
import TsButton from '-/components/TsButton';
import TsTextField from '-/components/TsTextField';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { Pro } from '-/pro';
import { tagsValidation } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { isDateTimeTag } from '-/utils/dates';
import { isGeoTag } from '-/utils/geo';
import useValidation from '-/utils/useValidation';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

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
  }, [title]);

  function handleValidation(tagTitle: string) {
    // Tags should be at least 1 character long and should not contain: spaces, \, / #
    //const tagCheck = RegExp(/^[^#/\\ [\]]{1,}$/);
    if (tagsValidation(tagTitle)) {
      setError('tag', false);
      return true;
    }
    setError('tag');
    return false;
  }

  function onConfirm() {
    if (!haveError()) {
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
          <TsTextField
            error={haveError('tag')}
            disabled={editDisabled}
            inputRef={titleRef}
            name="title"
            autoFocus
            updateValue={(value) => {
              setTitle(value);
            }}
            retrieveValue={() => title}
            label={t('core:editTag')}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const { target } = event;
              handleValidation(target.value);
              setTitle(target.value);
            }}
            defaultValue={title}
            data-tid="editTagEntryDialog_input"
            slotProps={{
              input: {
                endAdornment: (
                  <EditIcon onClick={() => setEditDisabled(!editDisabled)} />
                ),
              },
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

  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog
      open={open}
      fullScreen={smallScreen}
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
      <TsDialogTitle
        dialogTitle={t('core:tagProperties')}
        closeButtonTestId="closeEditEntryTagTID"
        onClose={onClose}
      />
      {renderContent()}
      <TsDialogActions
        style={{
          justifyContent: 'space-between',
        }}
      >
        {GeoTagEditor && isGeoTag(title) ? (
          <TsButton
            data-tid="switchAdvancedModeTID"
            onClick={() => setShowAdvancedMode(!showAdvancedMode)}
          >
            {showAdvancedMode
              ? t('core:switchSimpleMode')
              : t('core:switchAdvancedMode')}
          </TsButton>
        ) : (
          <div />
        )}
        <div>
          <TsButton data-tid="closeEditTagEntryDialog" onClick={props.onClose}>
            {t('core:cancel')}
          </TsButton>
          <TsButton
            disabled={haveError()}
            style={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}
            onClick={onConfirm}
            data-tid="confirmEditTagEntryDialog"
            variant="contained"
          >
            {t('core:ok')}
          </TsButton>
        </div>
      </TsDialogActions>
    </Dialog>
  );
}

export default EditEntryTagDialog;
