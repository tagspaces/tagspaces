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

import { AIIcon, RemoveIcon } from '-/components/CommonIcons';
import TsIconButton from '-/components/TsIconButton';
import TsSelect from '-/components/TsSelect';
import { AIProvider } from '-/components/chat/ChatTypes';
import { getOllamaModels } from '-/components/chat/OllamaClient';
import { useChatContext } from '-/hooks/useChatContext';
import { getDefaultAIProvider } from '-/reducers/settings';
import DownloadIcon from '@mui/icons-material/Download';
import { ListItemIcon, MenuItem } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { format, parseISO } from 'date-fns';
import { ModelResponse } from 'ollama';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNotificationContext } from '-/hooks/useNotificationContext';

interface Props {
  id?: string;
  label?: string;
  disabled?: boolean;
  aiProvider: AIProvider;
  chosenModel: string;
  handleChangeModel: (newModelName: string) => void;
}

function SelectChatModel(props: Props) {
  const { t } = useTranslation();
  const { id, label, aiProvider, chosenModel, handleChangeModel, disabled } =
    props;
  const { removeModel, getOllamaClient, models } = useChatContext();
  const { openConfirmDialog } = useNotificationContext();

  const defaultAiProvider: AIProvider = useSelector(getDefaultAIProvider);
  const [installedModels, setModels] = useState(
    aiProvider?.id === defaultAiProvider?.id ? models : [],
  );

  useEffect(() => {
    if (aiProvider && aiProvider.engine === 'ollama') {
      getOllamaClient(aiProvider.url).then((client) => {
        getOllamaModels(client).then((m) => {
          if (!m || JSON.stringify(m) !== JSON.stringify(installedModels)) {
            setModels(m ? m : []);
          }
        });
      });
    }
  }, [aiProvider, models]);

  const ollamaAvailableModels: ModelResponse[] = [
    {
      name: 'llama3.1',
      model: 'llama3.1',
      modified_at: new Date(),
      size: 1,
      digest: '',
      expires_at: new Date(),
      size_vram: 0,
      details: {
        family: 'ollama',
        format:
          '4,6 GB. The largest language model from Meta, featuring 405 billion parameters. It is one of the leading open-source AI models, capable of understanding and processing information deeply and diversely',
        parent_model: 'ollama',
        families: ['ollama'],
        parameter_size: '',
        quantization_level: '',
      },
    },
    {
      name: 'llama3.2',
      model: 'llama3.2',
      modified_at: new Date(),
      size: 1,
      digest: '',
      expires_at: new Date(),
      size_vram: 0,
      details: {
        family: 'ollama',
        format:
          'new 1B and 3B lightweight models are designed for seamless integration on mobile and edge devices. With these models, you can build private, personalized AI experiences with minimal latency and resource overhead.',
        parent_model: 'ollama',
        families: ['ollama'],
        parameter_size: '',
        quantization_level: '',
      },
    },
    {
      name: 'llama3.2-vision:11b',
      model: 'llama3.2-vision:11b',
      modified_at: new Date(),
      size: 1,
      digest: '',
      expires_at: new Date(),
      size_vram: 0,
      details: {
        family: 'ollama',
        format: 'requires least 8GB of VRAM.',
        parent_model: 'ollama',
        families: ['ollama'],
        parameter_size: '',
        quantization_level: '',
      },
    },
    {
      name: 'gemma2',
      model: 'gemma2',
      modified_at: new Date(),
      size: 1,
      digest: '',
      expires_at: new Date(),
      size_vram: 0,
      details: {
        family: 'ollama',
        format:
          "5,4 GB. One of GEMMA2's standout features is its ability to handle and integrate multiple data modalities. Traditional AI models often specialise in a single type of data — text, images, or audio. GEMMA2, however, can process and synthesise information from all these sources simultaneously.",
        parent_model: 'ollama',
        families: ['ollama'],
        parameter_size: '',
        quantization_level: '',
      },
    },
    {
      name: 'codegemma',
      model: 'codegemma',
      modified_at: new Date(),
      size: 1,
      digest: '',
      expires_at: new Date(),
      size_vram: 0,
      details: {
        family: 'ollama',
        format:
          'CodeGemma models are text-to-text and text-to-code decoder-only models and are available as a 7 billion pretrained variant that specializes in code completion and code generation tasks, a 7 billion parameter instruction-tuned variant for code chat and instruction following and a 2 billion parameter pretrained variant.',
        parent_model: 'ollama',
        families: ['ollama'],
        parameter_size: '',
        quantization_level: '',
      },
    },
    {
      name: 'llava',
      model: 'llava',
      modified_at: new Date(),
      size: 1,
      digest: '',
      expires_at: new Date(),
      size_vram: 0,
      details: {
        family: 'ollama',
        format:
          'large multimodal model that is designed to understand and generate content based on both visual inputs (images) and textual instructions.',
        parent_model: 'ollama',
        families: ['ollama'],
        parameter_size: '',
        quantization_level: '',
      },
    },
    {
      name: 'tinyllama',
      model: 'tinyllama',
      modified_at: new Date(),
      size: 1,
      digest: '',
      expires_at: new Date(),
      size_vram: 0,
      details: {
        family: 'ollama',
        format: 'TinyLlama is a compact model with only 1.1B parameters.',
        parent_model: 'ollama',
        families: ['ollama'],
        parameter_size: '',
        quantization_level: '',
      },
    },
  ];

  const changeModel = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === 'customModel') {
      openConfirmDialog(
        t('core:downloadChatModel'),
        undefined,
        (result) => {
          if (result && typeof result === 'string') {
            handleChangeModel(result);
          }
        },
        'cancelInstallCustomModel',
        'confirmInstallCustomModel',
        'confirmCustomModelContent',
        undefined,
        t('core:model'),
        'E.g.: llama3.2:1b, further models available on ollama.com/search',
        t('core:startDownload'),
        t('core:cancel'),
      );
    } else {
      handleChangeModel(event.target.value);
    }
  };

  const handleRemoveModel = () => {
    removeModel(chosenModel);
  };
  function getTitle(model) {
    return model ? format(parseISO(model.modified_at), 'yyyy-MM-dd') : '';
  }

  return (
    <>
      <TsSelect
        disabled={disabled}
        value={chosenModel ? chosenModel : 'init'}
        onChange={changeModel}
        label={label ? label : ''}
        id={id ? id : 'selectChatModelId'}
        slotProps={{
          input: {
            endAdornment: chosenModel && (
              <InputAdornment position="end" sx={{ ml: -12 }}>
                <TsIconButton
                  aria-label={t('core:deleteModel')}
                  onClick={handleRemoveModel}
                  data-tid="deleteModelTID"
                >
                  <RemoveIcon />
                </TsIconButton>
              </InputAdornment>
            ),
          },
        }}
      >
        <MenuItem value="init" disabled>
          {t('core:chooseModel')}
        </MenuItem>
        <MenuItem value="" disabled>
          {t('core:installedAIModel')}
        </MenuItem>
        {installedModels && installedModels.length > 0 ? (
          installedModels.map((model) => (
            <MenuItem
              key={model.name}
              value={model.name}
              title={getTitle(model)}
            >
              {' '}
              <ListItemIcon>
                <AIIcon fontSize="small" />
              </ListItemIcon>
              {model.name} {(model.size / (1024 * 1024 * 1024)).toFixed(2)} GB
            </MenuItem>
          ))
        ) : (
          <MenuItem value="" disabled>
            {t('core:noAIModelsInstaller')}
          </MenuItem>
        )}
        <MenuItem value="" disabled>
          {t('core:exampleInstallableModels')}
        </MenuItem>
        {ollamaAvailableModels.map((model) => (
          <MenuItem
            key={model.name}
            value={model.name}
            title={model.details.format}
          >
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            {model.name}
          </MenuItem>
        ))}
        <MenuItem value="" disabled>
          {t('core:moreActions')}
        </MenuItem>
        <MenuItem value="customModel">
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          {t('core:installCustomModel')}
        </MenuItem>
      </TsSelect>
    </>
  );
}

export default SelectChatModel;
