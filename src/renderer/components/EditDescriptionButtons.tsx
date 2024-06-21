import React, { ForwardedRef, useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { ProTooltip } from '-/components/HelperComponents';
import { Pro } from '-/pro';
import { useTranslation } from 'react-i18next';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';

export interface DescriptionChangedRef {
  setDescriptionChanged: (changed: boolean) => void;
}

type Props = {
  buttonsRef: ForwardedRef<DescriptionChangedRef>;
};

const EditDescriptionButtons: React.FC<Props> = ({ buttonsRef }) => {
  const { t } = useTranslation();
  const {
    isSaveDescriptionConfirmOpened,
    setSaveDescriptionConfirmOpened,
    saveDescription,
    isEditMode,
    setEditMode,
  } = useFilePropertiesContext();
  const [isDescriptionChanged, descriptionChanged] = useState<boolean>(false);

  React.useImperativeHandle(buttonsRef, () => ({
    setDescriptionChanged: (changed) => {
      descriptionChanged(changed);
    },
  }));

  useEffect(() => {
    if (!isEditMode && isDescriptionChanged) {
      descriptionChanged(false);
    }
  }, [isEditMode]);

  // const printHTML = () => {
  //   const sanitizedDescription = description
  //     ? convertMarkDown(description, currentDirectoryPath)
  //     : t('core:addMarkdownDescription');

  //   const printWin = window.open('', 'PRINT', 'height=400,width=600');
  //   printWin.document.write(
  //     '<html><head><title>' + currentDirectoryPath + ' description</title>',
  //   );
  //   printWin.document.write('</head><body >');
  //   printWin.document.write(sanitizedDescription);
  //   printWin.document.write('</body></html>');
  //   printWin.document.close(); // necessary for IE >= 10
  //   printWin.focus(); // necessary for IE >= 10*/
  //   printWin.print();
  //   // printWin.close();
  //   return true;
  // };

  return (
    <span style={{ float: 'left' }}>
      {isEditMode && (
        <Button
          onClick={() => {
            setEditMode(false);
          }}
        >
          {t('core:cancel')}
          {/* {t(isDescriptionChanged ? 'core:cancel' : 'core:close')} */}
        </Button>
      )}
      {/* {!editMode && (
        <Button className={classes.button} onClick={printHTML}>
          {t('core:print')}
        </Button>
      )} */}
      <ProTooltip tooltip={t('editDescription')}>
        <Button
          data-tid="editDescriptionTID"
          color="primary"
          disabled={!Pro}
          onClick={() => {
            if (isEditMode) {
              saveDescription();
            }
            setEditMode(!isEditMode);
          }}
        >
          {isEditMode ? t('core:confirmSaveButton') : t('core:editDescription')}
        </Button>
      </ProTooltip>
      <ConfirmDialog
        open={isSaveDescriptionConfirmOpened}
        onClose={() => {
          setSaveDescriptionConfirmOpened(false);
        }}
        title={t('core:confirm')}
        content={t('core:saveFileBeforeClosingFile')}
        confirmCallback={(result) => {
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
};

export default EditDescriptionButtons;
