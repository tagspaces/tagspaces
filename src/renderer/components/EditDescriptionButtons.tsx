import React from 'react';
import Button from '@mui/material/Button';
import { ProTooltip } from '-/components/HelperComponents';
import { Pro } from '-/pro';
import { useTranslation } from 'react-i18next';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';

/*export interface DescriptionChangedRef {
  setDescriptionChanged: (changed: boolean) => void;
}

type Props = {
  buttonsRef: ForwardedRef<DescriptionChangedRef>;
};*/

const EditDescriptionButtons: React.FC = () => {
  const { t } = useTranslation();
  const {
    saveDescription,
    isEditMode,
    isEditDescriptionMode,
    setEditDescriptionMode,
  } = useFilePropertiesContext();
  //const [isDescriptionChanged, descriptionChanged] = useState<boolean>(false);

  /*React.useImperativeHandle(buttonsRef, () => ({
    setDescriptionChanged: (changed) => {
      descriptionChanged(changed);
    },
  }));

  useEffect(() => {
    if (!isEditDescriptionMode && isDescriptionChanged) {
      descriptionChanged(false);
    }
  }, [isEditDescriptionMode]);*/

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
      {isEditDescriptionMode && (
        <Button
          onClick={() => {
            setEditDescriptionMode(false);
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
          disabled={!Pro || isEditMode}
          onClick={() => {
            if (isEditDescriptionMode) {
              saveDescription();
            }
            setEditDescriptionMode(!isEditDescriptionMode);
          }}
        >
          {isEditDescriptionMode
            ? t('core:confirmSaveButton')
            : t('core:editDescription')}
        </Button>
      </ProTooltip>
    </span>
  );
};

export default EditDescriptionButtons;
