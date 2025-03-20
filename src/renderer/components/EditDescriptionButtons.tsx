import AppConfig from '-/AppConfig';
import { MoreMenuIcon } from '-/components/CommonIcons';
import { ProTooltip } from '-/components/HelperComponents';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import AiGenDescButton from '-/components/chat/AiGenDescButton';
import AiGenTagsButton from '-/components/chat/AiGenTagsButton';
import DescriptionMenu from '-/components/md/DescriptionMenu';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { Pro } from '-/pro';
import { saveAsTextFile } from '-/services/utils-io';
import { Box, ButtonGroup, Tooltip, useTheme } from '@mui/material';
import { formatDateTime4Tag } from '@tagspaces/tagspaces-common/misc';
import { extractTitle } from '@tagspaces/tagspaces-common/paths';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ButtonsProps {
  getHtml: () => string;
}

const EditDescriptionButtons: React.FC<ButtonsProps> = ({ getHtml }) => {
  const { t } = useTranslation();
  const {
    saveDescription,
    isEditMode,
    isDescriptionChanged,
    isEditDescriptionMode,
    setEditDescriptionMode,
  } = useFilePropertiesContext();
  const { openedEntry, reloadOpenedFile } = useOpenedEntryContext();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const theme = useTheme();
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

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const saveAsHtml = () => {
    setAnchorEl(null);
    const html = getHtml();
    if (html) {
      const blob = new Blob([html], {
        type: 'text/html',
      });
      const dateTimeTag = formatDateTime4Tag(new Date(), true);
      const filename =
        extractTitle(openedEntry.name) +
        ' [description ' +
        dateTimeTag +
        '].html';

      saveAsTextFile(blob, filename);
    }
  };

  const saveAsMarkdown = () => {
    setAnchorEl(null);
    if (openedEntry.meta.description) {
      const blob = new Blob([openedEntry.meta.description], {
        type: 'text/markdown',
      });
      const dateTimeTag = formatDateTime4Tag(new Date(), true);
      const filename =
        extractTitle(openedEntry.name) +
        ' [description ' +
        dateTimeTag +
        '].md';

      saveAsTextFile(blob, filename);
    }
  };

  const descrChangedMarker = isDescriptionChanged ? (
    <Tooltip title={t('core:fileChanged')}>
      <span
        style={{
          color: theme.palette.text.primary,
          marginLeft: 3,
          marginTop: -2,
        }}
      >
        {String.fromCharCode(0x25cf)}
      </span>
    </Tooltip>
  ) : null;

  return (
    <div
      style={{
        marginBottom: AppConfig.defaultSpaceBetweenButtons,
        whiteSpace: 'nowrap',
        overflowX: 'auto',
        overflowY: 'hidden',
        maxHeight: 46,
      }}
    >
      <ButtonGroup>
        {isEditDescriptionMode && (
          <TsButton
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            onClick={() => {
              setEditDescriptionMode(false);
              return reloadOpenedFile();
            }}
          >
            {t('core:cancel')}
          </TsButton>
        )}
        <ProTooltip tooltip={!isEditDescriptionMode && t('editDescription')}>
          <TsButton
            data-tid="editDescriptionTID"
            disabled={!Pro || isEditMode}
            style={{
              borderTopLeftRadius: isEditDescriptionMode
                ? 0
                : AppConfig.defaultCSSRadius,
              borderBottomLeftRadius: isEditDescriptionMode
                ? 0
                : AppConfig.defaultCSSRadius,
              whiteSpace: 'nowrap',
            }}
            onClick={() => {
              if (isEditDescriptionMode) {
                saveDescription().then(() => {
                  setEditDescriptionMode(false);
                });
              } else {
                setEditDescriptionMode(true);
              }
            }}
          >
            {isEditDescriptionMode ? (
              <>
                {t('core:confirmSaveButton')} {descrChangedMarker}
              </>
            ) : (
              t('core:editDescription')
            )}
          </TsButton>
        </ProTooltip>
      </ButtonGroup>
      <ButtonGroup style={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}>
        <ProTooltip
          tooltip={'Add AI generated description based on the file content'}
        >
          <AiGenDescButton disabled={!Pro} variant="outlined" />
        </ProTooltip>
        {openedEntry.meta.description && (
          <>
            <Box
              style={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}
            ></Box>
            <ProTooltip
              tooltip={'Add AI generated tags based on the description'}
            >
              <AiGenTagsButton
                disabled={!Pro}
                fromDescription={true}
                variant="outlined"
              />
            </ProTooltip>
          </>
        )}
      </ButtonGroup>
      <TsIconButton
        tooltip={t('core:chatMore')}
        onClick={handleMoreClick}
        //style={{ float: 'right', marginTop: -5 }}
        data-tid="chatMoreTID"
        aria-label={t('core:chatMore')}
        aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
      >
        <MoreMenuIcon />
      </TsIconButton>
      <DescriptionMenu
        anchorEl={anchorEl}
        handleClose={handleClose}
        saveAsHtml={saveAsHtml}
        saveAsMarkdown={saveAsMarkdown}
      />
    </div>
  );
};

export default EditDescriptionButtons;
