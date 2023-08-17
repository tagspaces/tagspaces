import React, { useRef, useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { MilkdownEditor, MilkdownRef } from '@tagspaces/tagspaces-md';
import i18n from '-/services/i18n';
import { ProTooltip } from '-/components/HelperComponents';
import { Pro } from '-/pro';

interface Props {
  primaryColor: string;
  classes: any;
  toggleEditDescriptionField: () => void;
  printHTML: () => void;
  // fileDescriptionRef: MutableRefObject<MilkdownRef>;
  description: string;
  setEditDescription: (md: string) => void;
  currentFolder: string;
}
function EditDescription(props: Props) {
  const theme = useTheme();
  const fileDescriptionRef = useRef<MilkdownRef>(null);
  const {
    currentFolder,
    description,
    setEditDescription,
    classes,
    printHTML,
    toggleEditDescriptionField,
    primaryColor
  } = props;
  const [editMode, setEditMode] = useState<boolean>(false);
  const descriptionFocus = useRef<boolean>(false);

  useEffect(() => {
    fileDescriptionRef.current?.setDarkMode(theme.palette.mode === 'dark');
  }, [theme]); // , settings]);

  const milkdownOnFocus = React.useCallback(
    () => (descriptionFocus.current = true),
    []
  );
  const milkdownListener = React.useCallback((markdown: string) => {
    if (descriptionFocus.current && markdown !== description) {
      setEditDescription(markdown);
    }
    // update codeMirror
    /*const { current } = codeMirrorRef;
      if (!current) return;
      current.update(markdown);*/
  }, []);

  const editSaveActions = (
    <span style={{ float: 'right' }}>
      {editMode && (
        <Button
          className={classes.button}
          onClick={() => {
            setEditMode(false);
          }}
        >
          {i18n.t('core:cancel')}
        </Button>
      )}
      {!editMode && (
        <Button className={classes.button} onClick={printHTML}>
          {i18n.t('core:print')}
        </Button>
      )}
      <ProTooltip tooltip={i18n.t('editDescription')}>
        <Button
          data-tid="editDescriptionTID"
          color="primary"
          className={classes.button}
          disabled={!Pro}
          onClick={() => {
            setEditMode(!editMode);
            toggleEditDescriptionField();
          }}
        >
          {editMode ? i18n.t('core:confirmSaveButton') : i18n.t('core:edit')}
        </Button>
      </ProTooltip>
    </span>
  );

  const noDescription = !description || description.length < 1;
  return (
    <>
      <span style={{ verticalAlign: 'sub', paddingLeft: 5 }}>
        <Typography style={{ color: primaryColor }} variant="caption">
          {i18n.t('core:filePropertiesDescription')}
        </Typography>
      </span>
      {toggleEditDescriptionField && editSaveActions}
      <div
        data-tid="descriptionTID"
        onDoubleClick={() => {
          if (!editMode && toggleEditDescriptionField) {
            setEditMode(true);
            toggleEditDescriptionField();
          }
        }}
        style={{
          border: '1px solid lightgray',
          borderRadius: 5,
          minHeight: 50,
          maxHeight: noDescription && !editMode ? 100 : 250,
          width: 'calc(100% - 8px)',
          overflowY: 'auto'
        }}
      >
        {noDescription && !editMode ? (
          <Typography
            variant="caption"
            style={{
              color: primaryColor,
              padding: 10,
              lineHeight: 4
            }}
          >
            {i18n.t('core:addMarkdownDescription')}
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
      <Typography
        variant="caption"
        style={{
          color: primaryColor
        }}
      >
        Markdown help: <i className={classes.mdHelpers}>_italic_</i>{' '}
        <b className={classes.mdHelpers}>**bold**</b>{' '}
        <span className={classes.mdHelpers}>* list item</span>{' '}
        <span className={classes.mdHelpers}>[Link text](http://...)</span>
      </Typography>
    </>
  );
}

export default EditDescription;
