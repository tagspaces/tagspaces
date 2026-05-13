/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import AppConfig from '-/AppConfig';
import { LinkIcon, MoreMenuIcon } from '-/components/CommonIcons';
import { ProTooltip } from '-/components/HelperComponents';
import TsTooltip from '-/components/TsTooltip';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import AiGenDescButton from '-/components/chat/AiGenDescButton';
import AiGenTagsButton from '-/components/chat/AiGenTagsButton';
import { useFilePickerDialogContext } from '-/components/dialogs/hooks/useFilePickerDialogContext';
import DescriptionMenu from '-/components/md/DescriptionMenu';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import {
  convertMarkDownToHtml,
  getMimeType,
  saveAsTextFile,
} from '-/services/utils-io';
import { ButtonGroup, useTheme } from '@mui/material';
import { formatDateTime4Tag } from '@tagspaces/tagspaces-common/misc';
import {
  extractContainingDirectoryPath,
  extractTitle,
} from '@tagspaces/tagspaces-common/paths';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ButtonsProps {
  resetMdContent: (md: string) => void;
  setEditMode: (editMode: boolean) => void;
  insertMarkdown?: (markdown: string) => void;
  getSelectedText?: () => string;
}

const EditDescriptionButtons: React.FC<ButtonsProps> = ({
  resetMdContent,
  setEditMode,
  insertMarkdown,
  getSelectedText,
}) => {
  const { t } = useTranslation();
  const {
    saveDescription,
    isEditMode,
    isDescriptionChanged,
    isEditDescriptionMode,
    setEditDescriptionMode,
  } = useFilePropertiesContext();
  const { findLocation } = useCurrentLocationContext();
  const { openedEntry, reloadOpenedFile } = useOpenedEntryContext();
  const { openFilePickerDialog } = useFilePickerDialogContext();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const theme = useTheme();

  function buildSafeMarkdownLink(label: string, url: string): string {
    // CommonMark link labels can't contain unescaped `[` or `]` (and `\`
    // must be escaped). TagSpaces filenames frequently embed `[tags]`, which
    // would break naive `[${name}](...)` interpolation.
    const escapedLabel = label
      .replace(/\\/g, '\\\\')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]');
    // For the URL, URL-encode special chars so the markdown stays pure-ASCII
    // through every save/reparse cycle (angle-bracket form `<url>` is lost
    // by some markdown serializers). encodeURI preserves path separators,
    // but does NOT encode `[ ] ( )` — encode those manually.
    // Skip encoding for ts:// links: they already contain encoded params.
    const isTsLink = /^ts:\/\//.test(url);
    const safeUrl = isTsLink
      ? url
      : encodeURI(url)
          .replace(/\[/g, '%5B')
          .replace(/\]/g, '%5D')
          .replace(/\(/g, '%28')
          .replace(/\)/g, '%29');
    return `[${escapedLabel}](${safeUrl})`;
  }

  function handleInsertFileLink() {
    if (!insertMarkdown) return;
    // Capture the editor's current selection text BEFORE the dialog opens.
    // Once MUI's focus-trap moves focus into the dialog, reading the selection
    // is still safe (ProseMirror state survives focus loss), but we read it
    // here for clarity. Empty string = no selection.
    const initialLabel = getSelectedText ? getSelectedText() : '';
    // For a file's description the relative-link base is the file's
    // containing folder; for a folder's description it's the folder itself
    // (the description "lives in" the folder).
    const sourceDir = openedEntry?.path
      ? openedEntry.isFile
        ? extractContainingDirectoryPath(
            openedEntry.path,
            findLocation(openedEntry.locationID)?.getDirSeparator?.() || '/',
          )
        : openedEntry.path
      : undefined;
    openFilePickerDialog({
      mode: 'any',
      sourceLocationId: openedEntry?.locationID,
      sourceDir,
      initialLocationId: openedEntry?.locationID,
      showLabelField: true,
      initialLabel,
      onSelect: (entry, link, _linkType, label) => {
        const finalLabel = (label && label.trim()) || entry.name || link;
        insertMarkdown(buildSafeMarkdownLink(finalLabel, link));
      },
    });
  }
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
    if (openedEntry.meta?.description) {
      const html = convertMarkDownToHtml(openedEntry.meta?.description);
      const blob = new Blob([html], {
        type: getMimeType('html'),
      });
      const dateTimeTag = formatDateTime4Tag(new Date(), true);
      const filename = `${extractTitle(openedEntry.name)} [description ${dateTimeTag}].html`;
      saveAsTextFile(blob, filename);
    }
  };

  const saveAsMarkdown = () => {
    setAnchorEl(null);
    if (openedEntry.meta?.description) {
      const blob = new Blob([openedEntry.meta.description], {
        type: getMimeType('md'),
      });
      const dateTimeTag = formatDateTime4Tag(new Date(), true);
      const filename = `${extractTitle(openedEntry.name)} [description ${dateTimeTag}].md`;

      saveAsTextFile(blob, filename);
    }
  };

  const descrChangedMarker = isDescriptionChanged ? (
    <TsTooltip title={t('core:fileChanged')}>
      <span
        data-tid="descriptionChangedTID"
        style={{
          color: theme.palette.text.primary,
          marginLeft: 3,
          marginTop: -2,
        }}
      >
        {String.fromCharCode(0x25cf)}
      </span>
    </TsTooltip>
  ) : null;

  return (
    <div
      style={{
        marginBottom: AppConfig.defaultSpaceBetweenButtons,
        whiteSpace: 'nowrap',
        overflowX: 'auto',
        overflowY: 'hidden',
        alignItems: 'center',
        display: 'flex',
      }}
    >
      <ButtonGroup>
        {isEditDescriptionMode && (
          <TsButton
            sx={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            onClick={() => {
              resetMdContent(openedEntry.meta?.description);
              setEditMode(false);
              setEditDescriptionMode(false);
              //return reloadOpenedFile();
            }}
          >
            {t('core:cancel')}
          </TsButton>
        )}
        <TsTooltip
          arrow
          placement="top"
          title={!isEditDescriptionMode ? t('core:editDescription') : ''}
        >
          <TsButton
            data-tid={
              isEditDescriptionMode
                ? 'saveDescriptionTID'
                : 'editDescriptionTID'
            }
            disabled={findLocation(openedEntry.locationID)?.isReadOnly}
            sx={{
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
                  if (!isDescriptionChanged) {
                    setEditMode(false);
                  }
                  setEditDescriptionMode(false);
                });
              } else {
                setEditMode(true);
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
        </TsTooltip>
      </ButtonGroup>
      <ProTooltip
        tooltip={'Add AI generated description based on the file content'}
      >
        <AiGenDescButton
          sx={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}
          variant="outlined"
        />
      </ProTooltip>
      {openedEntry.meta?.description && (
        <>
          <ProTooltip
            tooltip={'Add AI generated tags based on the description'}
          >
            <AiGenTagsButton
              sx={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}
              fromDescription={true}
              variant="outlined"
            />
          </ProTooltip>
        </>
      )}
      {isEditDescriptionMode && insertMarkdown && (
        <TsIconButton
          tooltip={t('core:insertFileOrFolderLink')}
          onClick={handleInsertFileLink}
          sx={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}
          data-tid="insertFileOrFolderLinkTID"
          aria-label={t('core:insertFileOrFolderLink')}
        >
          <LinkIcon />
        </TsIconButton>
      )}
      <TsIconButton
        tooltip={t('core:moreActions')}
        onClick={handleMoreClick}
        sx={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}
        data-tid="moreActionsTID"
        aria-label={t('core:moreActions')}
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
