/*
Copyright (c) 2023-present The TagSpaces GmbH. All rights reserved.
*/

import React, { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem } from '@mui/material';
import { TS } from '-/tagspaces.namespace';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { RemoveIcon } from '-/components/CommonIcons';
import { useChatContext } from '-/perspectives/chat/hooks/useChatContext';
import TsSelect from '-/components/TsSelect';

interface Props {
  label?: string;
  chosenModel: TS.Model;
  handleChangeModel: (newModelName: string) => void;
}

function SelectChatModel(props: Props) {
  const { t } = useTranslation();
  const { label, chosenModel, handleChangeModel } = props;
  const { models, removeModel } = useChatContext();

  const ollamaAvailableModels: TS.Model[] = [
    {
      name: 'llama3.1',
      details: {
        format:
          '4,6 GB. The largest language model from Meta, featuring 405 billion parameters. It is one of the leading open-source AI models, capable of understanding and processing information deeply and diversely',
      },
    },
    {
      name: 'llama3.2',
      details: {
        format:
          'new 1B and 3B lightweight models are designed for seamless integration on mobile and edge devices. With these models, you can build private, personalized AI experiences with minimal latency and resource overhead.',
      },
    },
    {
      name: 'gemma2',
      details: {
        format:
          "5,4 GB. One of GEMMA2's standout features is its ability to handle and integrate multiple data modalities. Traditional AI models often specialise in a single type of data — text, images, or audio. GEMMA2, however, can process and synthesise information from all these sources simultaneously.",
      },
    },
    {
      name: 'codegemma',
      details: {
        format:
          'CodeGemma models are text-to-text and text-to-code decoder-only models and are available as a 7 billion pretrained variant that specializes in code completion and code generation tasks, a 7 billion parameter instruction-tuned variant for code chat and instruction following and a 2 billion parameter pretrained variant.',
      },
    },
    {
      name: 'llava',
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
      value={chosenModel ? chosenModel.name : 'init'}
      onChange={changeModel}
      label={label ? label : 'Select a Model'}
      InputProps={{
        endAdornment: chosenModel && (
          <InputAdornment position="start">
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
      {models.length > 0 ? (
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
