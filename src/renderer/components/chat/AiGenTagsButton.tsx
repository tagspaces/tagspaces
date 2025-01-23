/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2024-present TagSpaces GmbH
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
import TsButton, { TSButtonProps } from '-/components/TsButton';
import { AIProvider } from '-/components/chat/ChatTypes';
import { TabNames } from '-/hooks/EntryPropsTabsContextProvider';
import { useChatContext } from '-/hooks/useChatContext';
import {
  actions as SettingsActions,
  getTagColor,
  getTagTextColor,
} from '-/reducers/settings';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { getDefaultAIProvider } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { ButtonPropsVariantOverrides } from '@mui/material/Button';
import { OverridableStringUnion } from '@mui/types';
import { extractFileExtension } from '@tagspaces/tagspaces-common/paths';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AIIcon } from '../CommonIcons';
import { AppDispatch } from '-/reducers/app';
import { getTagColors } from '-/services/taglibrary-utils';

type Props = TSButtonProps & {
  variant?: OverridableStringUnion<
    'text' | 'outlined' | 'contained',
    ButtonPropsVariantOverrides
  >;
  entries?: TS.FileSystemEntry[];
  fromDescription?: boolean;
};

function AiGenTagsButton(props: Props) {
  const { fromDescription, variant, style, disabled, entries } = props;
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { openedEntry } = useOpenedEntryContext();
  const defaultAiProvider: AIProvider = useSelector(getDefaultAIProvider);
  const defaultBackgroundColor = useSelector(getTagColor);
  const defaultTextColor = useSelector(getTagTextColor);
  const { generate, getEntryModel, newChatMessage } = useChatContext();
  const { addTagsToFsEntry } = useTaggingActionsContext();
  const { showNotification } = useNotificationContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  let generateEntries: TS.FileSystemEntry[] = entries;
  if (!generateEntries && openedEntry) {
    generateEntries = [openedEntry];
  }
  const openedEntryModel = getEntryModel(openedEntry?.name, defaultAiProvider);
  const extensionSupported = generateEntries.every((entry) =>
    [
      ...AppConfig.aiSupportedFiletypes.text,
      ...AppConfig.aiSupportedFiletypes.image,
    ].includes(entry.extension),
  );

  if (!generateEntries || !openedEntryModel || !extensionSupported) {
    return null;
  }

  const handleGeneration = () => {
    for (let entry of generateEntries) {
      const ext = extractFileExtension(entry.name).toLowerCase();
      setIsLoading(true);
      if (fromDescription && entry.meta.description) {
        newChatMessage(
          entry.meta.description,
          false,
          'user',
          'tags',
          defaultAiProvider.defaultTextModel,
          false,
          [],
          false,
        ).then((results) => handleGenerationResults(entry, results));
      } else if (AppConfig.aiSupportedFiletypes.image.includes(ext)) {
        generate('image', 'tags').then((results) =>
          handleGenerationResults(entry, results),
        );
      } else if (AppConfig.aiSupportedFiletypes.text.includes(ext)) {
        generate('text', 'tags').then((results) =>
          handleGenerationResults(entry, results),
        );
      }
    }
  };

  function handleGenerationResults(entry, response) {
    console.log('newOllamaMessage response:' + response);
    setIsLoading(false);
    if (response) {
      try {
        const tags: TS.Tag[] = response.map((tag) => {
          const tagTitle = tag.toLowerCase().split(' ')[0];
          return {
            title: tagTitle,
            ...getTagColors(tagTitle, defaultTextColor, defaultBackgroundColor),
          };
        });
        const uniqueTags = tags.filter(
          (tag, index, self) =>
            index === self.findIndex((o) => o.title === tag.title),
        );
        /* const regex = /\{([^}]+)\}/g;
        const tags: TS.Tag[] = [...response.matchAll(regex)].map((match) => {
          const tagTitle = match[1].trim().replace(/^,|,$/g, '').toLowerCase();
          return {
            title: tagTitle,
            ...getTagColors(tagTitle, defaultTextColor, defaultBackgroundColor),
          };
        });*/
        addTagsToFsEntry(entry, uniqueTags).then(() =>
          dispatch(
            SettingsActions.setEntryContainerTab(TabNames.propertiesTab),
          ),
        );
        showNotification('Tags for ' + entry.name + ' generated by an AI.');
      } catch (e) {
        console.error('parse response ' + response, e);
      }
    }
  }

  return (
    <TsButton
      loading={isLoading}
      disabled={isLoading || disabled}
      tooltip="Uses currently configured AI model to generate tags for this file"
      startIcon={<AIIcon />}
      style={style}
      data-tid="generateTagsAITID"
      onClick={handleGeneration}
      variant={variant}
    >
      {t(
        'core:' +
          (fromDescription ? 'generateTagsFromDescription' : 'generateTags'),
      )}
    </TsButton>
  );
}

export default AiGenTagsButton;
