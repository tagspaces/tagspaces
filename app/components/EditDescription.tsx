import React, { useRef, useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { MilkdownEditor, MilkdownRef } from '@tagspaces/tagspaces-md';
import { ProTooltip } from '-/components/HelperComponents';
import { Pro } from '-/pro';
import { convertMarkDown } from '-/services/utils-io';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getDirectoryPath, OpenedEntry } from '-/reducers/app';
import { useDescriptionContext } from '-/hooks/useDescriptionContext';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';

const PREFIX = 'EditDescription';

const classes = {
  button: `${PREFIX}-button`,
  mdHelpers: `${PREFIX}-mdHelpers`,
  formControl: `${PREFIX}-formControl`
};

const Root = styled('div')(({ theme }) => ({
  height: '90%',
  [`& .${classes.button}`]: {
    position: 'relative',
    padding: '8px 12px 6px 8px',
    margin: '0'
  },

  [`& .${classes.mdHelpers}`]: {
    borderRadius: '0.25rem',
    paddingLeft: '0.25rem',
    paddingRight: '0.25rem',
    backgroundColor: '#bcc0c561'
  },
  [`& .${classes.formControl}`]: {
    marginLeft: theme.spacing(0),
    width: '100%'
  }
}));

function EditDescription() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { openedEntries } = useOpenedEntryContext();
  const openedFile: OpenedEntry = openedEntries[0];
  const currentFolder = useSelector(getDirectoryPath);
  const fileDescriptionRef = useRef<MilkdownRef>(null);
  const {
    description,
    setDescription,
    isSaveDescriptionConfirmOpened,
    setSaveDescriptionConfirmOpened,
    saveDescription,
    isChanged
  } = useDescriptionContext();
  const [editMode, setEditMode] = useState<boolean>(false);
  const descriptionFocus = useRef<boolean>(false);

  useEffect(() => {
    fileDescriptionRef.current?.setDarkMode(theme.palette.mode === 'dark');
  }, [theme]);

  /*  useEffect(() => {
    if (isChanged) {
      setSaveDescriptionConfirmOpened(true);
    }
  }, [openedFile]);*/

  /*const keyBindingHandlers = {
    saveDocument: () => {
      //setEditMode(!editMode);
      toggleEditDescriptionField();
    } /!*dispatch(AppActions.openNextFile())*!/
  };*/

  const milkdownOnFocus = React.useCallback(
    () => (descriptionFocus.current = true),
    []
  );
  const milkdownListener = React.useCallback((markdown: string) => {
    if (descriptionFocus.current && markdown !== description) {
      setDescription(markdown);
    }
    // update codeMirror
    /*const { current } = codeMirrorRef;
      if (!current) return;
      current.update(markdown);*/
  }, []);

  const printHTML = () => {
    const sanitizedDescription = description
      ? convertMarkDown(description, currentFolder)
      : t('core:addMarkdownDescription');

    const printWin = window.open('', 'PRINT', 'height=400,width=600');
    printWin.document.write(
      '<html><head><title>' + currentFolder + ' description</title>'
    );
    printWin.document.write('</head><body >');
    printWin.document.write(sanitizedDescription);
    printWin.document.write('</body></html>');
    printWin.document.close(); // necessary for IE >= 10
    printWin.focus(); // necessary for IE >= 10*/
    printWin.print();
    // printWin.close();
    return true;
  };

  const editSaveActions = (
    <span style={{ float: 'right' }}>
      {editMode && (
        <Button
          className={classes.button}
          onClick={() => {
            setEditMode(false);
          }}
        >
          {t('core:cancel')}
        </Button>
      )}
      {!editMode && (
        <Button className={classes.button} onClick={printHTML}>
          {t('core:print')}
        </Button>
      )}
      <ProTooltip tooltip={t('editDescription')}>
        <Button
          data-tid="editDescriptionTID"
          color="primary"
          className={classes.button}
          disabled={!Pro}
          onClick={() => {
            if (editMode) {
              saveDescription();
            }
            setEditMode(!editMode);
          }}
        >
          {editMode ? t('core:confirmSaveButton') : t('core:edit')}
        </Button>
      </ProTooltip>
      <ConfirmDialog
        open={isSaveDescriptionConfirmOpened}
        onClose={() => {
          setSaveDescriptionConfirmOpened(false);
        }}
        title={t('core:confirm')}
        content={t('core:saveFileBeforeClosingFile')}
        confirmCallback={result => {
          if (result) {
            saveDescription();
          } else {
            setSaveDescriptionConfirmOpened(false);
          }
        }}
        cancelDialogTID="cancelSaveDescCloseDialog"
        confirmDialogTID="confirmSaveDescCloseDialog"
        confirmDialogContentTID="confirmDescDialogContent"
      />
    </span>
  );

  const noDescription = !description || description.length < 1;
  return (
    <Root>
      <span style={{ verticalAlign: 'sub', paddingLeft: 5 }}>
        <Typography
          variant="caption"
          style={{
            color: theme.palette.text.primary
          }}
        >
          Markdown help: <i className={classes.mdHelpers}>_italic_</i>{' '}
          <b className={classes.mdHelpers}>**bold**</b>{' '}
          <span className={classes.mdHelpers}>* list item</span>{' '}
          <span className={classes.mdHelpers}>[Link text](http://...)</span>
        </Typography>
        {/*<Typography
          style={{ color: theme.palette.text.primary }}
          variant="caption"
        >
          {t('core:filePropertiesDescription')}
        </Typography>*/}
      </span>
      {!openedFile.editMode && editSaveActions}
      <div
        data-tid="descriptionTID"
        onDoubleClick={() => {
          if (!editMode && !openedFile.editMode) {
            setEditMode(true);
          }
        }}
        style={{
          border: '1px solid lightgray',
          borderRadius: 5,
          //minHeight: 150,
          //maxHeight: 200,
          // maxHeight: noDescription && !editMode ? 100 : 250,
          height: '100%',
          width: 'calc(100% - 8px)',
          overflowY: 'auto'
        }}
      >
        {noDescription && !editMode ? (
          <Typography
            variant="caption"
            style={{
              color: theme.palette.text.primary,
              padding: 10,
              lineHeight: 4
            }}
          >
            {t(
              openedFile.editMode
                ? 'core:editDisabled'
                : 'core:addMarkdownDescription'
            )}
          </Typography>
        ) : (
          <>
            <style>
              {`
        .prose a {
             color: ${theme.palette.primary.main};
        }
        .prose img {
             max-width: 99%;
        }
        `}
            </style>
            <MilkdownEditor
              ref={fileDescriptionRef}
              content={description || ''}
              onChange={milkdownListener}
              onFocus={milkdownOnFocus}
              readOnly={!editMode}
              lightMode={false}
              excludePlugins={!editMode ? ['menu', 'upload'] : []}
              currentFolder={currentFolder}
            />
          </>
        )}
      </div>
    </Root>
  );
}

export default EditDescription;
