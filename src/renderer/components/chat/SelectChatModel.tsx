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

import { RemoveIcon } from '-/components/CommonIcons';
import TsSelect from '-/components/TsSelect';
import { Model } from '-/components/chat/ChatTypes';
import { useChatContext } from '-/hooks/useChatContext';
import { MenuItem } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  id?: string;
  label?: string;
  disabled?: boolean;
  chosenModel: string;
  handleChangeModel: (newModelName: string) => void;
}

function SelectChatModel(props: Props) {
  const { t } = useTranslation();
  const { id, label, chosenModel, handleChangeModel, disabled } = props;
  const { models, removeModel } = useChatContext();

  const ollamaAvailableModels: Model[] = [
    {
      name: 'llama3.1',
      engine: 'ollama',
      details: {
        format:
          '4,6 GB. The largest language model from Meta, featuring 405 billion parameters. It is one of the leading open-source AI models, capable of understanding and processing information deeply and diversely',
      },
    },
    {
      name: 'llama3.2',
      engine: 'ollama',
      details: {
        format:
          'new 1B and 3B lightweight models are designed for seamless integration on mobile and edge devices. With these models, you can build private, personalized AI experiences with minimal latency and resource overhead.',
      },
    },
    {
      name: 'llama3.2-vision:11b',
      engine: 'ollama',
      details: {
        format: 'requires least 8GB of VRAM.',
      },
    },
    {
      name: 'gemma2',
      engine: 'ollama',
      details: {
        format:
          "5,4 GB. One of GEMMA2's standout features is its ability to handle and integrate multiple data modalities. Traditional AI models often specialise in a single type of data — text, images, or audio. GEMMA2, however, can process and synthesise information from all these sources simultaneously.",
      },
    },
    {
      name: 'codegemma',
      engine: 'ollama',
      details: {
        format:
          'CodeGemma models are text-to-text and text-to-code decoder-only models and are available as a 7 billion pretrained variant that specializes in code completion and code generation tasks, a 7 billion parameter instruction-tuned variant for code chat and instruction following and a 2 billion parameter pretrained variant.',
      },
    },
    {
      name: 'llava',
      engine: 'ollama',
      details: {
        format:
          'large multimodal model that is designed to understand and generate content based on both visual inputs (images) and textual instructions.',
      },
    },
  ];

  const changeModel = (event: ChangeEvent<HTMLInputElement>) => {
    handleChangeModel(event.target.value);
  };

  const handleRemoveModel = () => {
    removeModel(chosenModel);
  };

  return (
    <TsSelect
      disabled={disabled}
      value={chosenModel ? chosenModel : 'init'}
      onChange={changeModel}
      label={label ? label : t('selectModel')}
      id={id ? id : 'selectChatModelId'}
      InputProps={{
        endAdornment: chosenModel && (
          <InputAdornment position="end" sx={{ ml: -12 }}>
            <IconButton
              aria-label={t('core:deleteModel')}
              onClick={handleRemoveModel}
              data-tid="deleteModelTID"
              size="small"
            >
              <RemoveIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
    >
      <MenuItem value="init" disabled>
        Choose an model
      </MenuItem>
      {models && models.length > 0 ? (
        models.map((model) => (
          <MenuItem
            key={model.name}
            value={model.name}
            title={model.modified_at}
          >
            {model.name} {(model.size / (1024 * 1024 * 1024)).toFixed(2)} GB
          </MenuItem>
        ))
      ) : (
        <MenuItem value="" disabled>
          No models installed
        </MenuItem>
      )}
      <MenuItem value="" disabled>
        Available models
      </MenuItem>
      {ollamaAvailableModels.map((model) => (
        <MenuItem
          key={model.name}
          value={model.name}
          title={model.details.format}
        >
          {model.name}
        </MenuItem>
      ))}
    </TsSelect>
  );
}

export default SelectChatModel;
