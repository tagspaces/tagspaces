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
import DraggablePaper from '-/components/DraggablePaper';
import TsButton from '-/components/TsButton';
import TsTextField from '-/components/TsTextField';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { Pro } from '-/pro';
import { tagsValidation } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { isDateTimeTag, isYear, isYearMonth } from '-/utils/dates';
import { isGeoTag } from '-/utils/geo';
import useValidation from '-/utils/useValidation';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, {
  ChangeEvent,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  entries: TS.FileSystemEntry[];
  tag: TS.Tag;
  onClose: () => void;
}

const GeoTagEditor = Pro?.UI?.GeoTagEditor ?? React.Fragment;
const DateTagEditor = Pro?.UI?.DateTagEditor ?? React.Fragment;

function EditEntryTagDialog({ open, entries, tag, onClose }: Props) {
  const { t } = useTranslation();
  const { addTagsToFsEntries, editTagForEntry } = useTaggingActionsContext();
  const [showAdvancedMode, setShowAdvancedMode] = useState(false);
  const [editDisabled, setEditDisabled] = useState(false);
  const { setError, haveError } = useValidation();
  const titleRef = useRef<string>(tag?.title || '');
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const closeDialog = () => {
    titleRef.current = '';
    onClose();
  };

  const isTagChanged = useMemo(
    () => titleRef.current !== tag?.title,
    [titleRef.current, tag?.title],
  );

  const isShowDatePeriodEditor = useMemo(() => {
    const currentTitle = titleRef.current || tag?.title;
    if (!DateTagEditor || !currentTitle) return false;

    if (currentTitle.includes('-')) {
      const parts = currentTitle.split('-');
      return parts.length === 2 && parts.every(isDateTimeTag);
    }

    return (
      isDateTimeTag(currentTitle) &&
      !isYear(currentTitle) &&
      !isYearMonth(currentTitle)
    );
  }, [titleRef.current, tag?.title]);

  const handleValidation = (tagTitle: string): boolean => {
    const isValid = tagsValidation(tagTitle);
    setError('tag', !isValid);
    return isValid;
  };

  const onConfirm = () => {
    if (!haveError()) {
      const isNew =
        tag.functionality === 'geoTagging' ||
        tag.functionality === 'dateTagging';
      if (isNew) {
        addTagsToFsEntries(entries, [{ ...tag, title: titleRef.current }]);
      } else if (entries.length === 1) {
        editTagForEntry(entries[0].path, tag, titleRef.current);
      }
      closeDialog();
    }
  };

  const setTitle = (newTitle: string) => {
    titleRef.current = newTitle;
    forceUpdate();
  };

  const renderContent = () => {
    const showGeoEditor = GeoTagEditor && isGeoTag(tag?.title);

    return (
      <DialogContent
        data-tid="editEntryTagDialog"
        sx={{ overflow: 'auto', minWidth: '545px', minHeight: '190px' }}
      >
        <FormControl fullWidth error={haveError('tag')}>
          <TsTextField
            error={haveError('tag')}
            disabled={editDisabled}
            name="title"
            autoFocus
            updateValue={setTitle}
            retrieveValue={() => titleRef.current || tag?.title}
            label={t('core:editTag')}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const { value } = event.target;
              handleValidation(value);
              setTitle(value);
            }}
            value={titleRef.current || tag?.title}
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
            geoTag={tag?.title}
            onChange={setTitle}
            // zoom={title === defaultTagLocation ? 2 : undefined} TODO defaultTagLocation can be in MGRS format
            showAdvancedMode={showAdvancedMode}
            haveError={haveError}
            setError={setError}
          />
        )}
        {isShowDatePeriodEditor && tag && (
          <DateTagEditor
            datePeriodTag={titleRef.current || tag?.title}
            onChange={setTitle}
          />
        )}
      </DialogContent>
    );
  };

  return (
    <Dialog
      open={open}
      fullScreen={smallScreen}
      onClose={closeDialog}
      sx={{ minWidth: 400, height: '100%', marginBottom: 30 }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          event.stopPropagation();
          onConfirm();
        }
      }}
      scroll="paper"
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      aria-labelledby="draggable-dialog-title"
    >
      <TsDialogTitle
        dialogTitle={t('core:tagProperties')}
        closeButtonTestId="closeEditEntryTagTID"
        onClose={closeDialog}
      />
      {renderContent()}
      <TsDialogActions style={{ justifyContent: 'space-between' }}>
        {GeoTagEditor && isGeoTag(tag?.title) ? (
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
          <TsButton data-tid="closeEditTagEntryDialog" onClick={closeDialog}>
            {t('core:cancel')}
          </TsButton>
          <TsButton
            disabled={haveError() && !isTagChanged}
            sx={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}
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
