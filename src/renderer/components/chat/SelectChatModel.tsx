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
import {
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  ListItemIcon,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
  Typography,
  ListItemText, 
} from '@mui/material';
import React, { useEffect, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Ollama } from 'ollama';
import {
  AIProvider,
  ModelDetails,
  ModelResponse,
} from '-/components/chat/ChatTypes';
import { OllamaIcon } from '-/components/images/OllamaIcon';
// import { OpenRouterIcon } from '-/components/images/OpenRouterIcon'; // Placeholder
import { ConfirmDialog } from '-/components/misc/ConfirmDialog';
import { TsIconButton } from '-/components/misc/TsIconButton';
import { useChatContext } from '-/hooks/ChatProvider';
import { getDefaultAIProvider } from '-/reducers/settings';
import DownloadIcon from '@mui/icons-material/Download';
import RemoveIcon from '@mui/icons-material/RemoveCircleOutline';
import { getOllamaModels } from '-/components/chat/OllamaClient';
import { OpenRouterClient } from '-/components/chat/OpenRouterClient';

const ollamaAvailableModels = [
  'codellama',
  'llama2',
  'mistral',
  'mixtral',
  'llava',
  'neural-chat',
  'starling-lm',
  'phi',
];

export const SelectChatModel = ({
  chosenModel,
  setChosenModel,
  aiProvider, 
  disabled,
}: {
  chosenModel: string;
  setChosenModel: (model: string) => void;
  aiProvider: AIProvider; 
  disabled?: boolean;
}) => {
  const { t } = useTranslation();
  const {
    removeModel,
    models: contextModels, 
    refreshAIModels,
    changeCurrentModel,
    getAIClient,
  } = useChatContext();
  const defaultAiProviderFromContext: AIProvider = useSelector(getDefaultAIProvider);
  const [installedModels, setModels] = useState<ModelResponse[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [
    customModelPromptDialogOpened,
    setCustomModelPromptDialogOpened,
  ] = useState(false);
  const customModelName = useRef('');

  useEffect(() => {
    if (aiProvider) {
      setIsLoadingModels(true);
      if (aiProvider.id === defaultAiProviderFromContext?.id) {
        // If the provider for this dropdown is the default system provider,
        // its models are managed by the ChatProvider's main `models` ref (contextModels).
        // `refreshAIModels` will update that ref. We then set local state from it.
        refreshAIModels(aiProvider, chosenModel || aiProvider.defaultTextModel).then(() => {
           setModels([...contextModels.current]); // Use a copy of the context's models
           setIsLoadingModels(false);
        });
      } else {
        // This is for a provider NOT currently the default (e.g., in settings UI).
        // Fetch models specifically for this provider.
        let specificProviderModelsPromise: Promise<ModelResponse[] | undefined>;
        if (aiProvider.engine === 'ollama') {
            specificProviderModelsPromise = getAIClient(aiProvider).then(client => getOllamaModels(client as Ollama));
        } else if (aiProvider.engine === 'openrouter') {
            specificProviderModelsPromise = getAIClient(aiProvider).then(client => (client as OpenRouterClient).getOpenRouterModels());
        } else {
            specificProviderModelsPromise = Promise.resolve([]);
        }
        specificProviderModelsPromise.then(fetchedModelsArray => {
            setModels(fetchedModelsArray || []);
            setIsLoadingModels(false);
        }).catch(err => {
            console.error(`Error fetching models for ${aiProvider.name}:`, err);
            setModels([]);
            setIsLoadingModels(false);
        });
      }
    } else {
      setModels([]); 
    }
  }, [aiProvider, chosenModel, defaultAiProviderFromContext, contextModels, refreshAIModels, getAIClient]);


  function getTitle(model: ModelResponse) {
    let title = '';
    if (model.details) {
      const details = model.details as ModelDetails; 
      if(details.format) title += `Format: ${details.format}\n`;
      if(details.family) title += `Family: ${details.family}\n`;
      if(details.parameter_size) title += `Parameter Size: ${details.parameter_size}\n`;
      if(details.quantization_level) title += `Quantization Level: ${details.quantization_level}\n`;
    }
    // For Ollama, modified_at is relevant. For OpenRouter, it's usually not provided or relevant.
    if (model.modified_at && aiProvider?.engine === 'ollama') { 
      const date = new Date(model.modified_at);
      title += `Modified At: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }
    // For OpenRouter, display context length if available from details
    if (aiProvider?.engine === 'openrouter' && model.details?.context_length) {
        title += `Context Length: ${model.details.context_length}\n`;
    }
    return title.trim() || model.name; 
  }

  function handleRemoveModel(e) {
    e.stopPropagation();
    if (chosenModel && aiProvider?.engine === 'ollama') { // Only for Ollama
      removeModel(chosenModel);
      setChosenModel(''); 
    }
  }

  function handleChangeModel(modelName: string) {
    if (modelName === 'customModel' && aiProvider?.engine === 'ollama') { // Only for Ollama
      setCustomModelPromptDialogOpened(true);
    } else {
      setChosenModel(modelName);
      // Call changeCurrentModel only if this select is for the default provider
      if (aiProvider && defaultAiProviderFromContext && aiProvider.id === defaultAiProviderFromContext.id) {
        changeCurrentModel(modelName);
      }
    }
  }

  return (
    <>
      <FormControl sx={{ m: 1, minWidth: 220 }} size="small" disabled={disabled}>
        <InputLabel id="model-select-label">
          {aiProvider?.engine === 'ollama' && <OllamaIcon width={15} style={{ verticalAlign: 'middle', marginRight: '5px' }} />}
          {aiProvider?.engine === 'openrouter' && <Typography variant="caption" sx={{ verticalAlign: 'middle', marginRight: '5px' }}>[OR]</Typography>}
          {t('core:model')}
        </InputLabel>
        <Select
          labelId="model-select-label"
          id="model-select"
          value={chosenModel || ''}
          disabled={disabled || isLoadingModels}
          label={
            <>
              {aiProvider?.engine === 'ollama' && <OllamaIcon width={15} style={{ verticalAlign: 'middle', marginRight: '5px' }} />}
              {aiProvider?.engine === 'openrouter' && <Typography variant="caption" sx={{ verticalAlign: 'middle', marginRight: '5px' }}>[OR]</Typography>}
              {t('core:model')}
            </>
          }
          onChange={(event: SelectChangeEvent) =>
            handleChangeModel(event.target.value)
          }
          renderValue={(selected) => {
            if (isLoadingModels) return <CircularProgress size={20} sx={{ml:1}}/>;
            if (!selected) {
              return <em>{t('core:selectModel')}</em>;
            }
            // Display the name of the model. If it's not in installedModels (e.g. OpenRouter custom), just show the ID.
            const model = installedModels.find((m) => m.name === selected);
            return model ? model.name : selected;
          }}
          endAdornment={ 
            chosenModel && aiProvider?.engine === 'ollama' && !disabled ? (
              <InputAdornment position="end" sx={{ mr: 2.5 }}>
                <TsIconButton
                  aria-label={t('core:deleteModel')}
                  onClick={handleRemoveModel}
                  data-tid="deleteModelTID"
                  size="small"
                >
                  <RemoveIcon fontSize="small" />
                </TsIconButton>
              </InputAdornment>
            ) : null
          }
        >
          <MenuItem value="" disabled>
            {isLoadingModels ? <CircularProgress size={20}/> : t('core:installedModels')}
          </MenuItem>
          {installedModels.map((model) => (
            <MenuItem key={model.name} value={model.name}>
              <Tooltip title={getTitle(model)}>
                <ListItemText
                  primary={`${model.name} ${aiProvider?.engine === 'ollama' && model.size ? `${(model.size / (1024 * 1024 * 1024)).toFixed(2)} GB` : ''}`}
                />
              </Tooltip>
            </MenuItem>
          ))}
          {aiProvider && aiProvider.engine === 'ollama' && (
            <>
              <MenuItem value="" disabled sx={{ mt:1 }}>
                {t('core:exampleInstallableModels')}
              </MenuItem>
              {ollamaAvailableModels.map((modelName) => (
                <MenuItem key={modelName} value={modelName}>
                  <ListItemIcon>
                    <DownloadIcon fontSize="small" />
                  </ListItemIcon>
                  {modelName}
                </MenuItem>
              ))}
              <MenuItem value="" disabled sx={{ mt:1 }}>
                {t('core:moreActions')}
              </MenuItem>
              <MenuItem value="customModel">
                <ListItemIcon>
                  <DownloadIcon fontSize="small" />
                </ListItemIcon>
                {t('core:installCustomModel')}
              </MenuItem>
            </>
          )}
        </Select>
      </FormControl>
      {customModelPromptDialogOpened && (
        <ConfirmDialog
          title={t('core:installCustomModelTitle')}
          open={customModelPromptDialogOpened}
          text={t('core:installCustomModelText')}
          showTextField={true}
          textFieldValue={customModelName.current}
          onClose={(confirm: boolean, textValue: string) => {
            setCustomModelPromptDialogOpened(false);
            if (confirm && textValue) {
              customModelName.current = textValue;
              setChosenModel(customModelName.current);
              if (aiProvider && defaultAiProviderFromContext && aiProvider.id === defaultAiProviderFromContext.id) {
                changeCurrentModel(customModelName.current);
              }
            }
          }}
        />
      )}
    </>
  );
};
