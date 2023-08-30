import React, { useRef, useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { MilkdownEditor, MilkdownRef } from '@tagspaces/tagspaces-md';
import i18n from '-/services/i18n';
import { ProTooltip } from '-/components/HelperComponents';
import { Pro } from '-/pro';
import { convertMarkDown } from '-/services/utils-io';

interface Props {
  toggleEditDescriptionField: () => void;
  // fileDescriptionRef: MutableRefObject<MilkdownRef>;
  description: string;
  setEditDescription: (md: string) => void;
  currentFolder: string;
}
const PREFIX = 'EditDescription';

const classes = {
  button: `${PREFIX}-button`,
  mdHelpers: `${PREFIX}-mdHelpers`,
  formControl: `${PREFIX}-formControl`
};

const Root = styled('div')(({ theme }) => ({
  height: 250,
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

function EditDescription(props: Props) {
  const theme = useTheme();
  const fileDescriptionRef = useRef<MilkdownRef>(null);
  const {
    currentFolder,
    description,
    setEditDescription,
    toggleEditDescriptionField
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

  const printHTML = () => {
    const sanitizedDescription = description
      ? convertMarkDown(description, currentFolder)
      : i18n.t('core:addMarkdownDescription');

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
          {i18n.t('core:filePropertiesDescription')}
        </Typography>*/}
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
            {i18n.t('core:addMarkdownDescription')}
          </Typography>
        ) : (
          <div style={{ padding: editMode ? 0 : 5 }}>
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
          </div>
        )}
      </div>
    </Root>
  );
}

export default EditDescription;
