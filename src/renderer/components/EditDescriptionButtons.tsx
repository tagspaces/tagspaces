import AppConfig from '-/AppConfig';
import { ProTooltip } from '-/components/HelperComponents';
import TsButton from '-/components/TsButton';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { Pro } from '-/pro';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AiGenDescButton from '-/components/chat/AiGenDescButton';
import AiGenTagsButton from '-/components/chat/AiGenTagsButton';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';

const EditDescriptionButtons: React.FC = () => {
  const { t } = useTranslation();
  const {
    saveDescription,
    isEditMode,
    isEditDescriptionMode,
    setEditDescriptionMode,
  } = useFilePropertiesContext();
  const { openedEntry } = useOpenedEntryContext();
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
    <div
      style={{
        float: 'left',
        marginBottom: AppConfig.defaultSpaceBetweenButtons,
      }}
    >
      {isEditDescriptionMode && (
        <TsButton
          style={{ marginRight: AppConfig.defaultSpaceBetweenButtons }}
          onClick={() => {
            setEditDescriptionMode(false);
          }}
        >
          {t('core:cancel')}
          {/* {t(isDescriptionChanged ? 'core:cancel' : 'core:close')} */}
        </TsButton>
      )}
      {/* {!editMode && (
        <TsButton className={classes.button} onClick={printHTML}>
          {t('core:print')}
        </TsButton>
      )} */}
      <ProTooltip tooltip={t('editDescription')}>
        <TsButton
          data-tid="editDescriptionTID"
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
        </TsButton>
      </ProTooltip>
      <span style={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}>
        <AiGenDescButton />
      </span>
      {openedEntry.meta.description && (
        <span style={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}>
          <AiGenTagsButton fromDescription={true} variant="outlined" />
        </span>
      )}
    </div>
  );
};

export default EditDescriptionButtons;
