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
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useEntryPropsTabsContext } from '-/hooks/useEntryPropsTabsContext';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { Pro } from '-/pro';
import { isDesktopMode, isRevisionsEnabled } from '-/reducers/settings';
import { Box, ButtonGroup, Switch, Tooltip } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { CancelIcon, CloseEditIcon, SaveIcon } from './CommonIcons';
import EditFileButton from './EditFileButton';
import TsButton from './TsButton';

interface EntryContainerButtonsProps {
  isSavingInProgress: boolean;
  savingFile: () => void;
}

function EntryContainerButtons(props: EntryContainerButtonsProps) {
  const { isSavingInProgress, savingFile } = props;
  const { t } = useTranslation();
  const { setAutoSave } = useIOActionsContext();
  const { isEditable } = useEntryPropsTabsContext();
  const { findLocation } = useCurrentLocationContext();
  const { saveDescription, isEditMode, setEditMode } =
    useFilePropertiesContext();
  const { openedEntry, fileChanged, setFileChanged } = useOpenedEntryContext();
  const { showNotification } = useNotificationContext();
  const revisionsEnabled = useSelector(isRevisionsEnabled);
  const desktopMode = useSelector(isDesktopMode);

  const cLocation = findLocation(openedEntry.locationID);

  const editingSupported: boolean =
    cLocation &&
    !cLocation.isReadOnly &&
    openedEntry &&
    openedEntry.editingExtensionId !== undefined &&
    openedEntry.editingExtensionId.length > 3;

  const toggleAutoSave = (event: React.ChangeEvent<HTMLInputElement>) => {
    const autoSave = event.target.checked;
    if (Pro) {
      setAutoSave(openedEntry, autoSave, openedEntry.locationID);
    } else {
      showNotification(t('core:thisFunctionalityIsAvailableInPro'));
    }
  };

  const autoSave = isEditable(openedEntry) && revisionsEnabled && (
    <Tooltip
      title={
        t('core:autosave') +
        (!Pro ? ' - ' + t('core:thisFunctionalityIsAvailableInPro') : '')
      }
    >
      <Switch
        data-tid="autoSaveTID"
        checked={openedEntry.meta && openedEntry.meta.autoSave}
        onChange={toggleAutoSave}
        size="small"
        name="autoSave"
      />
    </Tooltip>
  );

  const startSavingFile = () => {
    if (isEditMode) {
      savingFile();
    } else {
      saveDescription();
    }
  };

  let closeCancelIcon;
  if (desktopMode) {
    closeCancelIcon = fileChanged ? <CancelIcon /> : <CloseEditIcon />;
  }

  let editFile = null;
  if (editingSupported) {
    if (isEditMode) {
      editFile = (
        <ButtonGroup>
          <TsButton
            tooltip={t('core:cancelEditing')}
            data-tid="cancelEditingTID"
            onClick={() => {
              setEditMode(false);
              setFileChanged(false);
            }}
            sx={{
              borderRadius: 'unset',
              borderTopLeftRadius: AppConfig.defaultCSSRadius,
              borderBottomLeftRadius: AppConfig.defaultCSSRadius,
              borderTopRightRadius: fileChanged
                ? 0
                : AppConfig.defaultCSSRadius,
              borderBottomRightRadius: fileChanged
                ? 0
                : AppConfig.defaultCSSRadius,
            }}
            aria-label={t('core:cancelEditing')}
            startIcon={closeCancelIcon}
          >
            <Box
              sx={{
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                maxWidth: '100px',
              }}
            >
              {fileChanged ? t('core:cancel') : t('core:exitEditMode')}
            </Box>
          </TsButton>

          {fileChanged && (
            <Tooltip
              title={
                t('core:saveFile') +
                ' (' +
                (AppConfig.isMacLike ? '⌘' : 'CTRL') +
                ' + S)'
              }
            >
              <TsButton
                disabled={false}
                onClick={startSavingFile}
                aria-label={t('core:saveFile')}
                data-tid="fileContainerSaveFile"
                startIcon={desktopMode && <SaveIcon />}
                loading={isSavingInProgress}
                sx={{
                  borderRadius: 'unset',
                  borderTopRightRadius: AppConfig.defaultCSSRadius,
                  borderBottomRightRadius: AppConfig.defaultCSSRadius,
                }}
              >
                {t('core:save')}
              </TsButton>
            </Tooltip>
          )}
        </ButtonGroup>
      );
    } else {
      editFile = <EditFileButton />;
    }
  }

  return (
    <Box
      sx={{
        marginLeft: 'auto',
        display: 'flex',
        flexDirection: 'column',
        marginRight: '10px',
        alignItems: 'anchor-center',
      }}
    >
      {editFile}
      {autoSave}
    </Box>
  );
}

export default EntryContainerButtons;
