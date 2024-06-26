import React, { useRef, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { MilkdownEditor, MilkdownRef } from '@tagspaces/tagspaces-md';
import { useTranslation } from 'react-i18next';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import EditDescriptionButtons from '-/components/EditDescriptionButtons';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { Pro } from '-/pro';

const PREFIX = 'EditDescription';

const classes = {
  mdHelpers: `${PREFIX}-mdHelpers`,
};

const EditDescriptionRoot = styled('div')(({ theme }) => ({
  height: '90%',
  [`& .${classes.mdHelpers}`]: {
    borderRadius: '0.25rem',
    paddingLeft: '0.25rem',
    paddingRight: '0.25rem',
    backgroundColor: '#bcc0c561',
  },
}));

function EditDescription() {
  const { t } = useTranslation();
  const theme = useTheme();
  // const { openedEntry } = useOpenedEntryContext();
  const { currentDirectoryPath } = useDirectoryContentContext();
  const {
    description,
    setDescription,
    isEditDescriptionMode,
    setEditDescriptionMode,
    isEditMode,
  } = useFilePropertiesContext();

  const fileDescriptionRef = useRef<MilkdownRef>(null);
  const descriptionFocus = useRef<boolean>(false);
  // const descriptionButtonsRef = useRef(null);

  useEffect(() => {
    fileDescriptionRef.current?.setDarkMode(theme.palette.mode === 'dark');
  }, [theme]);

  /*const keyBindingHandlers = {
    saveDocument: () => {
      //setEditDescriptionMode(!editMode);
      toggleEditDescriptionField();
    } /!*dispatch(AppActions.openNextFile())*!/
  };*/

  const milkdownOnFocus = React.useCallback(
    () => (descriptionFocus.current = true),
    [],
  );
  const milkdownListener = React.useCallback((markdown: string) => {
    if (descriptionFocus.current && markdown !== description) {
      setDescription(markdown);
      /*if (descriptionButtonsRef.current) {
        descriptionButtonsRef.current.setDescriptionChanged(true);
      }*/
    }
  }, []);

  const noDescription = !description || description.length < 1;
  return (
    <EditDescriptionRoot>
      <EditDescriptionButtons />
      <div
        data-tid="descriptionTID"
        onDoubleClick={() => {
          if (Pro && !isEditDescriptionMode && !isEditMode) {
            setEditDescriptionMode(true);
          }
        }}
        style={{
          border: '1px solid lightgray',
          borderRadius: 5,
          height: 'calc(100% - 40px)',
          width: 'calc(100% - 8px)',
          overflowY: 'auto',
        }}
      >
        {noDescription && !isEditDescriptionMode ? (
          <Typography
            variant="caption"
            style={{
              color: theme.palette.text.primary,
              padding: 10,
              lineHeight: 4,
            }}
          >
            {t(
              Pro
                ? 'core:addMarkdownDescription'
                : 'core:thisFunctionalityIsAvailableInPro',
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
              readOnly={!isEditDescriptionMode}
              lightMode={false}
              excludePlugins={
                !isEditDescriptionMode
                  ? ['menu', 'upload', 'slash']
                  : ['slash', 'block']
              }
              currentFolder={currentDirectoryPath}
            />
          </>
        )}
      </div>
      <span style={{ verticalAlign: 'sub', paddingLeft: 5 }}>
        {/* <Typography
          variant="caption"
          style={{
            color: theme.palette.text.primary,
          }}
        >
          Markdown help: <i className={classes.mdHelpers}>_italic_</i>{' '}
          <b className={classes.mdHelpers}>**bold**</b>{' '}
          <span className={classes.mdHelpers}>* list item</span>{' '}
          <span className={classes.mdHelpers}>[Link text](http://...)</span>
        </Typography> */}
      </span>
    </EditDescriptionRoot>
  );
}

export default EditDescription;
