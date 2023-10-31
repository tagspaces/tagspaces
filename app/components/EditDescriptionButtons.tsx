import React, { ForwardedRef, useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { ProTooltip } from '-/components/HelperComponents';
import { Pro } from '-/pro';
import { convertMarkDown } from '-/services/utils-io';
import { useTranslation } from 'react-i18next';
import { useDescriptionContext } from '-/hooks/useDescriptionContext';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';

const PREFIX = 'EditDescriptionButtons';

const classes = {
  button: `${PREFIX}-button`,
};

const Root = styled('span')(({ theme }) => ({
  float: 'right',
  [`& .${classes.button}`]: {
    position: 'relative',
    padding: '4px 10px 4px 10px',
    margin: '0',
  },
}));

export interface DescriptionChangedRef {
  setDescriptionChanged: (changed: boolean) => void;
}

type Props = {
  buttonsRef: ForwardedRef<DescriptionChangedRef>;
  editMode: boolean;
  setEditMode: (edit: boolean) => void;
};

const EditDescriptionButtons: React.FC<Props> = ({
  buttonsRef,
  editMode,
  setEditMode,
}) => {
  const { t } = useTranslation();
  const {
    description,
    isSaveDescriptionConfirmOpened,
    setSaveDescriptionConfirmOpened,
    saveDescription,
  } = useDescriptionContext();
  const { currentDirectoryPath } = useDirectoryContentContext();
  const [isDescriptionChanged, descriptionChanged] = useState<boolean>(false);

  React.useImperativeHandle(buttonsRef, () => ({
    setDescriptionChanged: (changed) => {
      descriptionChanged(changed);
    },
  }));

  useEffect(() => {
    if (!editMode && isDescriptionChanged) {
      descriptionChanged(false);
    }
  }, [editMode]);

  const printHTML = () => {
    const sanitizedDescription = description
      ? convertMarkDown(description, currentDirectoryPath)
      : t('core:addMarkdownDescription');

    const printWin = window.open('', 'PRINT', 'height=400,width=600');
    printWin.document.write(
      '<html><head><title>' + currentDirectoryPath + ' description</title>',
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

  return (
    <Root>
      {editMode && (
        <Button
          className={classes.button}
          onClick={() => {
            setEditMode(false);
          }}
        >
          {t(isDescriptionChanged ? 'core:cancel' : 'core:close')}
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
    </Root>
  );
};

export default EditDescriptionButtons;
