/*
Copyright (c) 2021-present The TagSpaces GmbH. All rights reserved.
*/

import AppConfig from '-/AppConfig';
import DraggablePaper from '-/components/DraggablePaper';
import TsButton from '-/components/TsButton';
import TsTextField from '-/components/TsTextField';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { useSavedSearchesContext } from '-/hooks/useSavedSearchesContext';
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
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onClose: (searchQuery?: TS.SearchQuery) => void;
  onClearSearch: () => void;
  searchQuery: TS.SearchQuery;
}

function SaveSearchDialog(props: Props) {
  const { open, onClose, searchQuery, onClearSearch } = props;
  const { searches, addSearch, editSearch, removeSearch } =
    useSavedSearchesContext();
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation();
  const [inputError, setInputError] = useState<string>('');
  const title = useRef<string>(
    searchQuery && searchQuery.uuid !== undefined
      ? searchQuery.title
      : defaultTitle(searchQuery),
  );

  useEffect(() => {
    if (searchQuery && searchQuery.uuid === undefined) {
      handleValidation();
    }
  }, []);

  function onDelete() {
    removeSearch(searchQuery?.uuid);
    onClearSearch();
    onClose();
  }

  function onConfirm() {
    if (title.current) {
      const searchQuery = {
        ...props.searchQuery,
        title: title.current,
      };

      if (props.searchQuery.uuid !== undefined) {
        editSearch(searchQuery);
        onClose();
      } else {
        searchQuery.uuid = getUuid();
        addSearch(searchQuery);
        onClose(searchQuery);
      }
    }
  }

  function handleValidation() {
    if (!title.current) {
      setInputError(t('core:emptyTitle'));
    } else if (
      searches.findIndex((search) => search.title === title.current) > -1
    ) {
      setInputError(t('core:duplicateTitle'));
    } else if (inputError) {
      setInputError('');
    }
  }

  const okButton = (
    <TsButton
      disabled={inputError !== ''}
      onClick={onConfirm}
      data-tid="confirmSavedSearchTID"
      variant="contained"
      style={{
        // @ts-ignore
        WebkitAppRegion: 'no-drag',
      }}
    >
      {t('core:ok')}
    </TsButton>
  );

  return (
    <Dialog
      open={open}
      onClose={() => onClose()}
      fullScreen={smallScreen}
      keepMounted
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
          searchQuery?.uuid !== undefined
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
            error={inputError !== ''}
            autoFocus
            name="name"
            defaultValue={title.current}
            label={t('core:searchQueryName')}
            onChange={(event) => {
              const { target } = event;
              title.current = target.value;
              handleValidation();
            }}
            // updateValue={(value) => {
            //   title.current = value;
            // }}
            retrieveValue={() => title.current}
            data-tid="savedSearchTID"
          />
          <FormHelperText style={{ marginLeft: 0 }} error={inputError !== ''}>
            {inputError !== '' ? inputError : t('core:savedSearchHelp')}
          </FormHelperText>
        </FormControl>
        {searchQuery?.uuid !== undefined && (
          <TsButton
            onClick={onDelete}
            data-tid="deleteSavedSearchTID"
            style={{ marginTop: AppConfig.defaultSpaceBetweenButtons }}
          >
            {t('core:delete')}
          </TsButton>
        )}
      </DialogContent>
      {!smallScreen && (
        <TsDialogActions>
          <TsButton data-tid="closeSavedSearchTID" onClick={() => onClose()}>
            {t('core:cancel')}
          </TsButton>
          {okButton}
        </TsDialogActions>
      )}
    </Dialog>
  );
}

export default SaveSearchDialog;
