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
import { useChatContext } from '-/hooks/useChatContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { getDefaultAIProvider } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { ButtonPropsVariantOverrides } from '@mui/material/Button';
import { OverridableStringUnion } from '@mui/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { AIIcon } from '../CommonIcons';
import { ButtonGroup } from '@mui/material';
import { useAiGenerationDialogContext } from '-/components/dialogs/hooks/useAiGenerationDialogContext';
import TsIconButton from '-/components/TsIconButton';

type Props = TSButtonProps & {
  variant?: OverridableStringUnion<
    'text' | 'outlined' | 'contained',
    ButtonPropsVariantOverrides
  >;
  entries?: TS.FileSystemEntry[];
  fromDescription?: boolean;
  generationCompleted?: () => void;
  disabled?: boolean;
};

function AiGenTagsButton(props: Props) {
  const {
    fromDescription,
    variant,
    style,
    disabled,
    entries,
    generationCompleted,
  } = props;
  const { t } = useTranslation();
  const { openedEntry } = useOpenedEntryContext();
  const { tagsGenerate } = useChatContext();
  const { openAiGenerationDialog } = useAiGenerationDialogContext();
  const defaultAiProvider: AIProvider = useSelector(getDefaultAIProvider);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  let generateEntries: TS.FileSystemEntry[] = entries;
  if (!generateEntries && openedEntry) {
    generateEntries = [openedEntry];
  }

  const extensionSupported = generateEntries.every((entry) =>
    [
      ...AppConfig.aiSupportedFiletypes.text,
      ...AppConfig.aiSupportedFiletypes.image,
    ].includes(entry.extension),
  );

  if (!generateEntries || !defaultAiProvider || !extensionSupported) {
    return null;
  }

  const handleGeneration = () => {
    setIsLoading(true);
    tagsGenerate(generateEntries, fromDescription).then(() => {
      setIsLoading(false);
      if (generationCompleted) {
        generationCompleted();
      }
    });
  };

  return (
    <ButtonGroup>
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
      <TsIconButton
        tooltip={t('core:openGenSettings')}
        aria-label={t('core:openGenSettings')}
        data-tid="fileContainerPrevFile"
        onClick={() => {
          openAiGenerationDialog('tags');
        }}
      >
        <AIIcon />
      </TsIconButton>
    </ButtonGroup>
  );
}

export default AiGenTagsButton;
