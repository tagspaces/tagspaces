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
import TsButton from '-/components/TsButton';
import { useChatContext } from '-/hooks/useChatContext';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { AppDispatch } from '-/reducers/app';
import { actions as SettingsActions } from '-/reducers/settings';
import { extractFileExtension } from '@tagspaces/tagspaces-common/paths';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { AIIcon } from './CommonIcons';

interface Props {}

function AiGenDescButton(props: Props) {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { openedEntry } = useOpenedEntryContext();
  const { generate } = useChatContext();
  const { setDescription, saveDescription } = useFilePropertiesContext();
  const { showNotification } = useNotificationContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!openedEntry) {
    return null;
  }

  const ext = extractFileExtension(openedEntry.name).toLowerCase();

  function handleGenerationResults(response) {
    //console.log('newOllamaMessage response:' + response);
    setIsLoading(false);
    if (response) {
      dispatch(SettingsActions.setEntryContainerTab(1));

      if (openedEntry.meta.description) {
        setDescription(openedEntry.meta.description + '\n---\n' + response);
      } else {
        setDescription(response);
      }
      saveDescription();
      //openEntry(openedEntry.path).then(() => {
      showNotification('Description for ' + openedEntry.path + ' generated');
    }
  }

  return (
    <TsButton
      loading={isLoading}
      disabled={isLoading}
      tooltip="Uses currently configured AI model to generate description for this file"
      startIcon={<AIIcon />}
      data-tid="generateDescriptionAITID"
      onClick={() => {
        setIsLoading(true);
        if (AppConfig.aiSupportedFiletypes.image.includes(ext)) {
          generate('image', 'description').then((results) =>
            handleGenerationResults(results),
          );
        } else if (AppConfig.aiSupportedFiletypes.text.includes(ext)) {
          generate(ext === 'pdf' ? 'image' : 'text', 'summary').then(
            (results) => handleGenerationResults(results),
          );
        }
      }}
    >
      {t('core:generateDescription')}
    </TsButton>
  );
}

export default AiGenDescButton;
