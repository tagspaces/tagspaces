import React, { MutableRefObject, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import i18n from '-/services/i18n';
import { ProTooltip } from '-/components/HelperComponents';
import { Pro } from '-/pro';
import AppConfig from '@tagspaces/tagspaces-platforms/AppConfig';
import Typography from '@mui/material/Typography';
import { MilkdownEditor, MilkdownRef } from '@tagspaces/tagspaces-md';

interface Props {
  primaryColor: string;
  classes: any;
  toggleEditDescriptionField: () => void;
  printHTML: () => void;
  fileDescriptionRef: MutableRefObject<MilkdownRef>;
  isDarkTheme: boolean;
  description: string;
  setEditDescription: (md: string) => void;
}
function EditDescription(props: Props) {
  const [editMode, setEditMode] = useState<boolean>(false);
  const descriptionFocus = useRef<boolean>(false);

  const milkdownOnFocus = React.useCallback(
    () => (descriptionFocus.current = true),
    []
  );
  const milkdownListener = React.useCallback((markdown: string) => {
    if (descriptionFocus.current && markdown !== props.description) {
      props.setEditDescription(markdown);
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
          className={props.classes.button}
          onClick={() => {
            setEditMode(false);
          }}
        >
          {i18n.t('core:cancel')}
        </Button>
      )}
      {!editMode && (
        <Button className={props.classes.button} onClick={props.printHTML}>
          {i18n.t('core:print')}
        </Button>
      )}
      <ProTooltip tooltip={i18n.t('editDescription')}>
        <Button
          color="primary"
          className={props.classes.button}
          disabled={!Pro}
          onClick={() => {
            setEditMode(!editMode);
            props.toggleEditDescriptionField();
          }}
        >
          {editMode ? i18n.t('core:confirmSaveButton') : i18n.t('core:edit')}
        </Button>
      </ProTooltip>
    </span>
  );

  return (
    <>
      <span style={{ verticalAlign: 'sub', paddingLeft: 5 }}>
        <Typography style={{ color: props.primaryColor }} variant="caption">
          {i18n.t('core:filePropertiesDescription')}
        </Typography>
      </span>
      {props.toggleEditDescriptionField && editSaveActions}
      <div
        onDoubleClick={() => {
          if (props.toggleEditDescriptionField) {
            setEditMode(!editMode);
            props.toggleEditDescriptionField();
          }
        }}
        style={{
          border: '1px solid lightgray',
          borderRadius: 5,
          padding: 2,
          minHeight: 50,
          maxHeight: 250,
          width: 'calc(100% - 8px)',
          // @ts-ignore
          overflowY: AppConfig.isFirefox ? 'auto' : 'overlay'
        }}
      >
        <MilkdownEditor
          ref={props.fileDescriptionRef}
          content={props.description || ''}
          onChange={milkdownListener}
          onFocus={milkdownOnFocus}
          readOnly={!editMode}
          dark={props.isDarkTheme}
        />
      </div>
      <Typography
        variant="caption"
        style={{
          color: props.primaryColor
        }}
      >
        Markdown help: <i className={props.classes.mdHelpers}>_italic_</i>{' '}
        <b className={props.classes.mdHelpers}>**bold**</b>{' '}
        <span className={props.classes.mdHelpers}>* list item</span>{' '}
        <span className={props.classes.mdHelpers}>[Link text](http://...)</span>
      </Typography>
    </>
  );
}

export default EditDescription;
