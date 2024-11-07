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

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { extractFileExtension } from '@tagspaces/tagspaces-common/paths';
import { supportedImgs, supportedText } from '-/services/thumbsgenerator';
import Button from '@mui/material/Button';
import { useChatContext } from '-/perspectives/chat/hooks/useChatContext';
import { Pro } from '-/pro';
import { IMAGE_DESCRIPTION } from '../../../tagspacespro/modules/components';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { toBase64Image } from '-/services/utils-io';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useSelector } from 'react-redux';
import { getOllamaSettings } from '-/reducers/settings';
import { useNotificationContext } from '-/hooks/useNotificationContext';

interface Props {}

function AiPropertiesTab(props: Props) {
  const { t } = useTranslation();
  const { currentLocation } = useCurrentLocationContext();
  const { openedEntry } = useOpenedEntryContext();
  const { newChatMessage, getModel } = useChatContext();
  const { setDescription } = useFilePropertiesContext();
  const { showNotification } = useNotificationContext();

  const ollamaSettings = useSelector(getOllamaSettings);
  const [confirmDescriptionOpened, setConfirmDescriptionOpened] =
    useState<string>(undefined);

  const ext = extractFileExtension(openedEntry.name).toLowerCase();
  if (IMAGE_DESCRIPTION && supportedImgs.includes(ext)) {
    return (
      <>
        <Button
          data-tid="generateDescriptionTID"
          onClick={() => {
            getModel(ollamaSettings.imageModel).then((modelExist) => {
              if (modelExist) {
                toBase64Image(currentLocation, openedEntry.path).then(
                  (base64Img) => {
                    //setImage(base64Img);
                    newChatMessage(
                      undefined,
                      false,
                      'user',
                      'description',
                      modelExist.name,
                      false,
                      [base64Img],
                    )
                      .then((response) => {
                        console.log('newOllamaMessage response:' + response);
                        if (response) {
                          if (openedEntry.meta.description) {
                            setConfirmDescriptionOpened(response);
                          } else {
                            setDescription(response);
                            showNotification(
                              'Description for ' +
                                openedEntry.path +
                                ' generated',
                            );
                          }
                        }
                        //setImage(undefined);
                        //forceUpdate();
                      })
                      .catch((e) => console.log('newOllamaMessage error:', e));
                  },
                );
              } else {
                showNotification(
                  'Model ' +
                    ollamaSettings.imageModel +
                    ' not found, try pulling it first',
                );
              }
            });
          }}
          color="secondary"
        >
          {t('core:generateDescription')}
        </Button>
        <ConfirmDialog
          open={confirmDescriptionOpened !== undefined}
          onClose={() => setConfirmDescriptionOpened(undefined)}
          title={t('core:confirmDescriptionReplaceTitle')}
          content={t('core:confirmDescriptionReplace', {
            description: confirmDescriptionOpened,
          })}
          confirmCallback={(result) => {
            if (result) {
              setDescription(confirmDescriptionOpened);
            }
          }}
          cancelDialogTID="cancelDescriptionReplaceTID"
          confirmDialogTID="confirmDescriptionTID"
        />
      </>
    );
  } else if (supportedText.includes(ext)) {
  }
  return <div>No AI actions</div>;
}

export default AiPropertiesTab;
