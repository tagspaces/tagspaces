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

import { ExpandIcon, ReloadIcon, RemoveIcon } from '-/components/CommonIcons';
import { default as Tooltip, default as TooltipTS } from '-/components/Tooltip';
import TsSelect from '-/components/TsSelect';
import TsTextField from '-/components/TsTextField';
import { AIProvider, AIProviders } from '-/components/chat/ChatTypes';
import SelectChatModel from '-/components/chat/SelectChatModel';
import { OllamaIcon } from '-/components/dialogs/components/Ollama';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { AppDispatch } from '-/reducers/app';
import {
  actions as SettingsActions,
  getAIProviders,
  getDefaultAIProvider,
} from '-/reducers/settings';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  FormControl,
  MenuItem,
  Switch,
} from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import React, { ChangeEvent, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useChatContext } from '-/hooks/useChatContext';

function SettingsAI() {
  const { i18n, t } = useTranslation();
  const { changeCurrentModel } = useChatContext();
  const aiDefailtProvider: AIProvider = useSelector(getDefaultAIProvider);
  const aiProviders: AIProvider[] = useSelector(getAIProviders);
  //const ollamaAlive = useRef<boolean | null>(null);
  const [ignored, forceUpdate] = React.useReducer((x) => x + 1, 0, undefined);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    checkOllamaAlive();
  }, []);

  function checkOllamaAlive() {
    aiProviders.map((provider) =>
      window.electronIO.ipcRenderer
        .invoke('getOllamaModels', provider.url)
        .then((m) => {
          handleChangeProvider(provider.id, 'alive', !!m);
        }),
    );
    forceUpdate();
  }

  function handleChangeProvider(id: string, props: keyof AIProvider, value) {
    const providers = aiProviders.map((provider) => {
      if (provider.id === id) {
        return {
          ...provider,
          [props]: value,
        };
      }
      return provider;
    });
    dispatch(SettingsActions.setAiProviders(providers));
  }

  const changeDefaultAiProvider = (event: ChangeEvent<HTMLInputElement>) => {
    const providerId = event.target.value as string;
    dispatch(SettingsActions.setAiProvider(providerId));
  };

  const addAiProvider = (event: ChangeEvent<HTMLInputElement>) => {
    const provider: AIProviders = event.target.value as AIProviders;

    const aiProvider: AIProvider = {
      id: getUuid(),
      engine: provider,
      name: provider,
      url: 'http://localhost:11434',
      enable: false,
    };
    dispatch(SettingsActions.addAiProvider(aiProvider));
  };

  return (
    <div
      style={{
        overflowX: 'hidden',
        overflowY: 'auto',
        height: '100%',
        padding: 10,
      }}
    >
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandIcon />}
          aria-controls="ai-general"
          id="ai-general-header"
          data-tid="aiGeneralTID"
        >
          <Typography>{t('core:aiSettings')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TsSelect
            value={-1}
            onChange={addAiProvider}
            label={t('core:addAIEngine')}
          >
            <MenuItem value="ollama">
              <OllamaIcon width={10} style={{ marginRight: 5 }} />
              Ollama
            </MenuItem>
          </TsSelect>
          {aiProviders && aiProviders.length > 1 && (
            <TsSelect
              value={aiDefailtProvider?.id}
              onChange={changeDefaultAiProvider}
              label={t('core:defaultAIEngine')}
            >
              {aiProviders.map((provider) => (
                <MenuItem value={provider.id}>
                  <OllamaIcon width={10} style={{ marginRight: 5 }} />
                  {provider.name}
                </MenuItem>
              ))}
            </TsSelect>
          )}
        </AccordionDetails>
      </Accordion>
      {aiProviders.map((provider) => (
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandIcon />}
            aria-controls={provider.id + 'content'}
            data-tid={provider.id + 'ollamaTID'}
          >
            <Typography>{provider.name}</Typography>
            <TooltipTS
              title={
                t('core:serviceStatus') +
                ': ' +
                (provider.alive ? t('core:available') : t('core:notAvailable'))
              }
            >
              {provider.alive === null ? (
                <CircularProgress size={12} />
              ) : (
                <FiberManualRecordIcon
                  sx={{
                    color: provider.alive ? 'green' : 'red',
                    fontSize: 19,
                    ml: 1,
                  }}
                />
              )}
            </TooltipTS>
            <IconButton
              aria-label={t('core:deleteModel')}
              onClick={() =>
                dispatch(SettingsActions.removeAiProvider(provider.id))
              }
              data-tid="deleteModelTID"
              size="small"
            >
              <RemoveIcon />
            </IconButton>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              <FormControl>
                <TsTextField
                  fullWidth
                  name="engineName"
                  label={t('core:engineName')}
                  data-tid="engineTID"
                  value={provider.name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    handleChangeProvider(
                      provider.id,
                      'name',
                      event.target.value,
                    );
                  }}
                />
              </FormControl>
              <FormControl>
                <TsTextField
                  fullWidth
                  name="ollamaSocket"
                  label={t('core:engineUrl')}
                  data-tid="ollamaEngineTID"
                  value={provider.url}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    handleChangeProvider(
                      provider.id,
                      'url',
                      event.target.value,
                    );
                  }}
                  placeholder="http://localhost:11434"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end" style={{ height: 32 }}>
                          <Tooltip title={t('core:refreshServiceStatus')}>
                            <IconButton
                              onClick={() => {
                                checkOllamaAlive();
                              }}
                              size="large"
                            >
                              <ReloadIcon />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </FormControl>
              <SelectChatModel
                label={t('core:defaultAImodelText')}
                handleChangeModel={(modelName: string) => {
                  handleChangeProvider(
                    provider.id,
                    'defaultTextModel',
                    modelName,
                  );
                  changeCurrentModel(modelName);
                }}
                chosenModel={provider.defaultTextModel}
              />
              <SelectChatModel
                label={t('core:defaultAImodelImages')}
                handleChangeModel={(modelName: string) => {
                  handleChangeProvider(
                    provider.id,
                    'defaultImageModel',
                    modelName,
                  );
                  changeCurrentModel(modelName);
                }}
                chosenModel={provider.defaultImageModel}
              />
              <FormControlLabel
                labelPlacement="start"
                style={{ justifyContent: 'space-between', marginLeft: 0 }}
                control={
                  <Switch
                    data-tid="locationIsDefault"
                    name="isDefault"
                    checked={provider.enable}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      handleChangeProvider(
                        provider.id,
                        'enable',
                        event.target.value,
                      );
                    }}
                  />
                }
                label={t('core:engineEnabled')}
              />
            </FormGroup>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}

export default SettingsAI;
