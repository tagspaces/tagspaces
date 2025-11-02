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
import EditSearchQuery from '-/components/EditSearchQuery';
import TsButton from '-/components/TsButton';
import TsTextField from '-/components/TsTextField';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { usePanelsContext } from '-/hooks/usePanelsContext';
import { useSavedSearchesContext } from '-/hooks/useSavedSearchesContext';
import { useSearchQueryContext } from '-/hooks/useSearchQueryContext';
import { AppDispatch } from '-/reducers/app';
import { actions as SettingsActions } from '-/reducers/settings';
import { defaultTitle } from '-/services/search';
import { TS } from '-/tagspaces.namespace';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { useEffect, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

interface Props {
  open: boolean;
  onClose: (searchQuery?: TS.SearchQuery) => void;
}

function SaveSearchDialog(props: Props) {
  const { open, onClose } = props;
  const { searches, addSearch, editSearch, removeSearch } =
    useSavedSearchesContext();
  const { showPanel } = usePanelsContext();
  const { tempSearchQuery, setTempSearchQuery } = useSearchQueryContext();
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation();
  const inputError = useRef<string>(undefined);
  const title = useRef<string>(getTitle());
  const titleChanged = useRef<boolean>(false);
  const dispatch: AppDispatch = useDispatch();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    titleChanged.current = false;
  }, [open]);

  useEffect(() => {
    if (tempSearchQuery) {
      if (!titleChanged.current || !title.current) {
        title.current = getTitle();
      }
      if (tempSearchQuery.uuid === undefined) {
        handleValidation();
      } else if (inputError.current) {
        inputError.current = undefined;
      }
      forceUpdate();
    }
  }, [tempSearchQuery]);

  function getTitle() {
    return tempSearchQuery && tempSearchQuery.uuid !== undefined
      ? tempSearchQuery.title
      : defaultTitle(tempSearchQuery);
  }

  function onDelete() {
    removeSearch(tempSearchQuery?.uuid);
    onClose();
  }

  function onConfirm() {
    if (title.current) {
      const searchQuery = setTempSearchQuery({ title: title.current });

      if (searchQuery.uuid !== undefined) {
        editSearch(searchQuery);
        onClose();
      } else {
        searchQuery.uuid = getUuid();
        addSearch(searchQuery);
        onClose();
      }

      showPanel('searchPanel');
      dispatch(SettingsActions.setStoredSearchesVisible(true));
    }
  }

  function handleValidation() {
    if (!title.current) {
      inputError.current = t('core:emptyTitle');
      forceUpdate();
    } else if (
      searches.findIndex((search) => search.title === title.current) > -1
    ) {
      inputError.current = t('core:duplicateTitle');
      forceUpdate();
    } else if (inputError.current) {
      inputError.current = undefined;
      forceUpdate();
    }
  }

  const okButton = (
    <TsButton
      disabled={!!inputError.current}
      onClick={onConfirm}
      data-tid="confirmSavedSearchTID"
      variant="contained"
      sx={
        {
          WebkitAppRegion: 'no-drag',
        } as React.CSSProperties & { WebkitAppRegion?: string }
      }
    >
      {t('core:ok')}
    </TsButton>
  );

  return (
    <Dialog
      open={open}
      onClose={() => onClose()}
      fullScreen={smallScreen}
      PaperComponent={smallScreen ? Paper : DraggablePaper}
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
      <TsDialogTitle
        dialogTitle={t(
          tempSearchQuery?.uuid !== undefined
            ? 'core:editSavedSearchTitle'
            : 'core:createNewSavedSearchTitle',
        )}
        closeButtonTestId="closeSaveSearchTID"
        onClose={onClose}
        actionSlot={okButton}
      />
      <DialogContent style={{ minWidth: smallScreen ? 'unset' : 300 }}>
        <FormControl fullWidth={true}>
          <TsTextField
            error={!!inputError.current}
            autoFocus
            name="name"
            value={title.current}
            label={t('core:searchQueryName')}
            onChange={(event) => {
              const { target } = event;
              title.current = target.value;
              titleChanged.current = true;
              handleValidation();
              forceUpdate();
            }}
            retrieveValue={() => title.current}
            data-tid="savedSearchTID"
          />
          <FormHelperText sx={{ marginLeft: 0 }} error={!!inputError.current}>
            {!!inputError.current
              ? inputError.current
              : t('core:savedSearchHelp')}
          </FormHelperText>
        </FormControl>
        <EditSearchQuery />
      </DialogContent>
      {!smallScreen && (
        <TsDialogActions style={{ justifyContent: 'space-between' }}>
          <div>
            {tempSearchQuery?.uuid !== undefined && (
              <TsButton onClick={onDelete} data-tid="deleteSavedSearchTID">
                {t('core:delete')}
              </TsButton>
            )}
          </div>
          <div>
            <TsButton
              data-tid="closeSavedSearchTID"
              onClick={() => onClose()}
              sx={{
                marginRight: AppConfig.defaultSpaceBetweenButtons,
              }}
            >
              {t('core:cancel')}
            </TsButton>
            {okButton}
          </div>
        </TsDialogActions>
      )}
    </Dialog>
  );
}

export default SaveSearchDialog;
