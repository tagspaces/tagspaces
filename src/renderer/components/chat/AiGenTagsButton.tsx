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
import TsButton from '-/components/TsButton';
import { useChatContext } from '-/hooks/useChatContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { AppDispatch } from '-/reducers/app';
import { actions as SettingsActions } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { ButtonPropsVariantOverrides } from '@mui/material/Button';
import { OverridableStringUnion } from '@mui/types';
import { extractFileExtension } from '@tagspaces/tagspaces-common/paths';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { AIIcon } from '../CommonIcons';

interface Props {
  variant?: OverridableStringUnion<
    'text' | 'outlined' | 'contained',
    ButtonPropsVariantOverrides
  >;
}

function AiGenTagsButton(props: Props) {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { openedEntry } = useOpenedEntryContext();
  const { generate, openedEntryModel } = useChatContext();
  const { addTagsToFsEntry } = useTaggingActionsContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (
    !openedEntry ||
    !openedEntryModel ||
    ![
      ...AppConfig.aiSupportedFiletypes.text,
      ...AppConfig.aiSupportedFiletypes.image,
    ].includes(openedEntry.extension)
  ) {
    return null;
  }

  const ext = extractFileExtension(openedEntry.name).toLowerCase();

  function handleGenerationResults(response) {
    //console.log('newOllamaMessage response:' + response);
    setIsLoading(false);
    if (response) {
      try {
        const regex = /\{([^}]+)\}/g;
        const tags: TS.Tag[] = [...response.matchAll(regex)].map((match) => ({
          title: match[1].trim().replace(/^,|,$/g, '').toLowerCase(),
          type: 'sidecar',
        }));
        addTagsToFsEntry(openedEntry, tags).then(() => {
          dispatch(SettingsActions.setEntryContainerTab(0));
        });
      } catch (e) {
        console.error('parse response ' + response, e);
      }
    }
  }

  return (
    <TsButton
      loading={isLoading}
      disabled={isLoading}
      tooltip="Uses currently configured AI model to generate tags for this file"
      startIcon={<AIIcon />}
      data-tid="generateTagsAITID"
      onClick={() => {
        setIsLoading(true);
        if (AppConfig.aiSupportedFiletypes.image.includes(ext)) {
          generate('image', 'tags').then((results) =>
            handleGenerationResults(results),
          );
        } else if (AppConfig.aiSupportedFiletypes.text.includes(ext)) {
          generate(ext === 'pdf' ? 'image' : 'text', 'tags').then((results) =>
            handleGenerationResults(results),
          );
        }
      }}
      {...props}
    >
      {t('core:generateTags')}
    </TsButton>
  );
}

export default AiGenTagsButton;
