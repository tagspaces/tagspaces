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

import { ExpandIcon, ReloadIcon } from '-/components/CommonIcons';
import { default as Tooltip, default as TooltipTS } from '-/components/Tooltip';
import TsSelect from '-/components/TsSelect';
import TsTextField from '-/components/TsTextField';
import { AIProviders } from '-/components/chat/ChatTypes';
import SelectChatModel from '-/components/chat/SelectChatModel';
import { OllamaIcon } from '-/components/dialogs/components/Ollama';
import { useChatContext } from '-/hooks/useChatContext';
import { AppDispatch } from '-/reducers/app';
import {
  actions as SettingsActions,
  getDefaultAIProvider,
  getOllamaSettings,
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

function SettingsAI() {
  const { i18n, t } = useTranslation();
  const { findModel } = useChatContext();
  const ollamaSettings = useSelector(getOllamaSettings);
  const aiProvider: AIProviders = useSelector(getDefaultAIProvider);
  const ollamaAlive = useRef<boolean | null>(null);
  const [ignored, forceUpdate] = React.useReducer((x) => x + 1, 0, undefined);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    checkOllamaAlive();
  }, []);

  const handleSwitchChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(
      SettingsActions.setOllamaSettings({
        ...ollamaSettings,
        enabled: event.target.checked,
      }),
    );
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(
      SettingsActions.setOllamaSettings({
        ...ollamaSettings,
        url: event.target.value,
      }),
    );
  };

  function checkOllamaAlive() {
    window.electronIO.ipcRenderer
      .invoke('getOllamaModels', ollamaSettings.url)
      .then((m) => {
        ollamaAlive.current = !!m;
        forceUpdate();
      });
  }

  const handleChangeTextModel = (modelName: string) => {
    dispatch(
      SettingsActions.setOllamaSettings({
        ...ollamaSettings,
        textModel: modelName,
      }),
    );
  };

  const handleChangeImageModel = (modelName: string) => {
    dispatch(
      SettingsActions.setOllamaSettings({
        ...ollamaSettings,
        imageModel: modelName,
      }),
    );
  };

  const changeAiProvider = (event: ChangeEvent<HTMLInputElement>) => {
    const provider: AIProviders = event.target.value as AIProviders;
    dispatch(SettingsActions.setAiProvider(provider));
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
            value={aiProvider}
            onChange={changeAiProvider}
            label={t('core:defaultAIEngine')}
          >
            <MenuItem value="ollama">
              <OllamaIcon width={10} style={{ marginRight: 5 }} />
              Ollama
            </MenuItem>
          </TsSelect>
          {aiProvider && aiProvider === 'ollama' && (
            <>
              <SelectChatModel
                label={t('core:defaultAImodelText')}
                handleChangeModel={handleChangeTextModel}
                chosenModel={findModel(ollamaSettings.textModel)}
              />
              <SelectChatModel
                label={t('core:defaultAImodelImages')}
                handleChangeModel={handleChangeImageModel}
                chosenModel={findModel(ollamaSettings.imageModel)}
              />
            </>
          )}
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandIcon />}
          aria-controls="ollama-content"
          id="ollama-header"
          data-tid="ollamaTID"
        >
          <Typography>
            <OllamaIcon width={20} /> Ollama
          </Typography>
          <TooltipTS
            title={
              t('core:serviceStatus') +
              ': ' +
              (ollamaAlive.current
                ? t('core:available')
                : t('core:notAvailable'))
            }
          >
            {ollamaAlive.current === null ? (
              <CircularProgress size={12} />
            ) : (
              <FiberManualRecordIcon
                sx={{
                  color: ollamaAlive.current ? 'green' : 'red',
                  fontSize: 19,
                  ml: 1,
                }}
              />
            )}
          </TooltipTS>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            <FormControl>
              {/* <Typography>
                {t('core:engineUrl')}
                <InfoIcon tooltip={t('core:engineUrl')} />
              </Typography> */}
              <TsTextField
                fullWidth
                name="ollamaSocket"
                label={t('core:engineUrl')}
                data-tid="ollamaEngineTID"
                value={ollamaSettings.url}
                onChange={handleInputChange}
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
            <FormControlLabel
              labelPlacement="start"
              style={{ justifyContent: 'space-between', marginLeft: 0 }}
              control={
                <Switch
                  data-tid="locationIsDefault"
                  name="isDefault"
                  checked={ollamaSettings.enabled}
                  onChange={handleSwitchChange}
                />
              }
              label={t('core:engineEnabled')}
            />
          </FormGroup>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export default SettingsAI;
