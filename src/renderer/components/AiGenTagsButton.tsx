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
import TsButton from '-/components/TsButton';
import { useChatContext } from '-/hooks/useChatContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { AppDispatch } from '-/reducers/app';
import { actions as SettingsActions } from '-/reducers/settings';
import { extractFileExtension } from '@tagspaces/tagspaces-common/paths';
import AppConfig from '-/AppConfig';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { TS } from '-/tagspaces.namespace';
import { ButtonPropsVariantOverrides } from '@mui/material/Button';
import { OverridableStringUnion } from '@mui/types';

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
  const { generate } = useChatContext();
  const { addTagsToFsEntry } = useTaggingActionsContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!openedEntry) {
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
          title: match[1] + '',
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

  if (AppConfig.aiSupportedFiletypes.image.includes(ext)) {
    return (
      <TsButton
        loading={isLoading}
        disabled={isLoading}
        data-tid="generateTagsTID"
        onClick={() => {
          setIsLoading(true);
          generate('image', 'tags').then((results) =>
            handleGenerationResults(results),
          );
        }}
        {...props}
      >
        {t('core:generateTags')}
      </TsButton>
    );
  } else if (AppConfig.aiSupportedFiletypes.text.includes(ext)) {
    return (
      <TsButton
        loading={isLoading}
        disabled={isLoading}
        data-tid="generateTagsTID"
        onClick={() => {
          setIsLoading(true);
          generate(ext === 'pdf' ? 'image' : 'text', 'tags').then((results) =>
            handleGenerationResults(results),
          );
        }}
        {...props}
      >
        {t('core:generateTags')}
      </TsButton>
    );
  }
  return null;
}

export default AiGenTagsButton;
