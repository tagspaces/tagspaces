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
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  Chip,
  ClickAwayListener,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grow,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Select,
  SelectChangeEvent,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { ChangeEvent, useEffect, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  AIProvider,
  AIProviders,
  ModelResponse,
} from '-/components/chat/ChatTypes';
import { OllamaIcon } from '-/components/images/OllamaIcon';
// import { OpenRouterIcon } from '-/components/images/OpenRouterIcon'; // Placeholder
import { TsTextField } from '-/components/misc/TsTextField';
import { useChatContext } from '-/hooks/ChatProvider';
import { useCommonSettings } from '-/hooks/useCommonSettings';
import {
  actions as SettingsActions,
  getAIProviders,
  getDefaultAIProviderId,
  isExternalConfig,
} from '-/reducers/settings';
import { getUniqueName } from '-/utils/fileNameUtils';
import { DeleteOutline } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';

export const SettingsAI = () => {
  const { t } = useTranslation();
  const { models, checkAIProviderAlive, refreshAIModels } = useChatContext();
  const dispatch = useDispatch();
  const defaultAiProviderId = useSelector(getDefaultAIProviderId);
  const aiProviders = useSelector(getAIProviders);
  const externalConfig = useSelector(
    isExternalConfig(TS.AppConfigurationType.AI_CONFIG_TYPE),
  );
  const providersAlive = useRef<{ [key: string]: boolean }>({});
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);
  const { inputMinHeight } = useCommonSettings();
  const newAIMenuAnchorRef = useRef(null);
  const [openedNewAIMenu, setOpenedNewAIMenu] = React.useState(false);

  useEffect(() => {
    checkAllProvidersAlive();
  }, [aiProviders]);

  function checkAllProvidersAlive() {
    aiProviders.forEach((provider) =>
      checkAIProviderAlive(provider).then((alive) => {
        providersAlive.current = {
          ...providersAlive.current,
          [provider.id]: alive,
        };
        forceUpdate();
      }),
    );
  }

  function handleChangeProvider(providerId: string, param: string, value: any) {
    const newProviders = aiProviders.map((provider) => {
      if (provider.id === providerId) {
        return { ...provider, [param]: value };
      }
      return provider;
    });
    dispatch(SettingsActions.setAIProviders(newProviders));
  }

  function addAiProvider(providerType: AIProviders) {
    let providerName: string;
    let providerUrl: string;
    let engine: AIProviders = providerType;
    let defaultTextModel: string | undefined;
    let defaultImageModel: string | undefined;
    let apiKey: string | undefined = undefined;

    if (providerType === 'ollama') {
      providerName = 'Ollama Local';
      providerUrl = 'http://localhost:11434';
      defaultTextModel = 'llama3.2';
      defaultImageModel = 'llava';
    } else if (providerType === 'openrouter') {
      providerName = 'OpenRouter';
      providerUrl = 'https://openrouter.ai/api/v1';
      engine = 'openrouter';
      defaultTextModel = 'gryphe/mythomax-l2-13b';
      defaultImageModel = undefined;
      apiKey = '';
    } else {
      console.error('Unsupported provider type:', providerType);
      return;
    }

    const newProvider: AIProvider = {
      id: getUniqueName(
        aiProviders.map((p) => p.id),
        engine + 'NewId',
      ),
      engine: engine,
      name: getUniqueName(
        aiProviders.map((p) => p.name),
        providerName,
      ),
      url: providerUrl,
      enable: true,
      apiKey: apiKey,
      defaultTextModel: defaultTextModel,
      defaultImageModel: defaultImageModel,
    };

    checkAIProviderAlive(newProvider).then((alive) => {
      providersAlive.current = {
        ...providersAlive.current,
        [newProvider.id]: alive,
      };
      forceUpdate();
    });
    dispatch(SettingsActions.addAIProvider(newProvider));
    refreshAIModels(newProvider);
  }

  function removeAiProvider(providerId: string) {
    dispatch(SettingsActions.removeAIProvider(providerId));
    const { [providerId]: _, ...remainingProvidersAlive } =
      providersAlive.current;
    providersAlive.current = remainingProvidersAlive;
    // If the removed provider was the default, clear the default ID
    if (defaultAiProviderId === providerId) {
      dispatch(SettingsActions.setDefaultAIProviderId(''));
    }
    forceUpdate();
  }

  function handleDefaultProviderChange(event: SelectChangeEvent) {
    dispatch(SettingsActions.setDefaultAIProviderId(event.target.value));
  }

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
        {t('core:artificialIntelligence')}
      </Typography>
      <FormControl sx={{ m: 1, minWidth: 320 }} size="small">
        <InputLabel id="defaultAiProviderID">
          {t('core:defaultAiProvider')}
        </InputLabel>
        <Select
          labelId="defaultAiProviderID"
          id="defaultAiProviderIDSelect"
          value={defaultAiProviderId || ''}
          label={t('core:defaultAiProvider')}
          onChange={handleDefaultProviderChange}
          disabled={externalConfig}
        >
          {aiProviders
            .filter((provider) => provider.enable === true)
            .map((provider) => (
              <MenuItem key={provider.id} value={provider.id}>
                <Stack direction="row" alignItems="center">
                  {provider.engine === 'ollama' && (
                    <OllamaIcon width={15} style={{ marginRight: 5 }} />
                  )}
                  {provider.engine === 'openrouter' && (
                    <Typography variant="caption" sx={{ mr: 0.5 }}>
                      [OR]
                    </Typography>
                  )}
                  {provider.name}
                </Stack>
              </MenuItem>
            ))}
        </Select>
        <FormHelperText>
          {t('core:defaultAiProviderDescription')}
        </FormHelperText>
      </FormControl>
      <Button
        variant="outlined"
        color="primary"
        data-tid="addNewAIEngine"
        sx={{ display: 'flex', m: 1, textTransform: 'none' }}
        ref={newAIMenuAnchorRef}
        onClick={() => setOpenedNewAIMenu(true)}
        startIcon={<AddIcon />}
        disabled={externalConfig}
      >
        {t('core:addAiEngine')}
      </Button>
      <Popper
        open={openedNewAIMenu}
        anchorEl={newAIMenuAnchorRef.current}
        role={undefined}
        placement="bottom-start"
        transition
        disablePortal
        sx={{ zIndex: 1500 }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={() => setOpenedNewAIMenu(false)}>
                <MenuList autoFocusItem={openedNewAIMenu} dense>
                  <MenuItem
                    key="createNewOllama"
                    data-tid="aiCreateNewOllamaTID"
                    onClick={() => {
                      addAiProvider('ollama');
                      setOpenedNewAIMenu(false);
                    }}
                  >
                    <ListItemIcon>
                      <OllamaIcon height={30} />
                    </ListItemIcon>
                    <ListItemText primary="Ollama" />
                  </MenuItem>
                  <MenuItem
                    key="createNewOpenRouter"
                    data-tid="aiCreateNewOpenRouterTID"
                    onClick={() => {
                      addAiProvider('openrouter');
                      setOpenedNewAIMenu(false);
                    }}
                  >
                    <ListItemIcon>
                      <Typography sx={{ ml: 0.5, mr: 0.5 }}>[OR]</Typography>
                    </ListItemIcon>
                    <ListItemText primary="OpenRouter" />
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
      {aiProviders.map((provider) => (
        <Accordion key={provider.id} sx={{ m: '5px !important' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={provider.id + '-content'}
            id={provider.id + '-header'}
          >
            <Stack direction="row" alignItems="center">
              {provider.engine === 'ollama' && (
                <OllamaIcon width={15} style={{ marginRight: 5 }} />
              )}
              {provider.engine === 'openrouter' && (
                <Typography variant="caption" sx={{ mr: 0.5 }}>
                  [OR]
                </Typography>
              )}
              {provider.name}
              {providersAlive.current[provider.id] === true && (
                <Chip
                  label={t('core:online')}
                  color="success"
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
              {providersAlive.current[provider.id] === false && (
                <Chip
                  label={t('core:offline')}
                  color="error"
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={provider.enable}
                    disabled={externalConfig}
                    onChange={(event) =>
                      handleChangeProvider(
                        provider.id,
                        'enable',
                        event.target.checked,
                      )
                    }
                  />
                }
                label={t('core:enableAIProvider')}
              />
              <FormControl>
                <TsTextField
                  disabled={externalConfig}
                  fullWidth
                  name="name"
                  label={t('core:name') + ' *'}
                  data-tid="aiProviderNameTID"
                  value={provider.name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    handleChangeProvider(
                      provider.id,
                      'name',
                      event.target.value,
                    );
                  }}
                  placeholder={t('core:name')}
                />
              </FormControl>
              <FormControl>
                <TsTextField
                  disabled={externalConfig}
                  fullWidth
                  name="providerUrl"
                  label={t('core:providerURL') + ' *'}
                  data-tid="aiProviderUrlTID"
                  value={provider.url}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    handleChangeProvider(
                      provider.id,
                      'url',
                      event.target.value,
                    );
                  }}
                  placeholder={
                    provider.engine === 'ollama'
                      ? 'http://localhost:11434'
                      : 'https://openrouter.ai/api/v1'
                  }
                  InputProps={{
                    style: { minHeight: inputMinHeight },
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={t('core:refreshModels')}>
                          <IconButton
                            aria-label="refresh models"
                            onClick={() => {
                              checkAIProviderAlive(provider).then((alive) => {
                                providersAlive.current = {
                                  ...providersAlive.current,
                                  [provider.id]: alive,
                                };
                                if (alive) refreshAIModels(provider);
                                forceUpdate();
                              });
                            }}
                            edge="end"
                          >
                            <RefreshIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
              {provider.engine === 'openrouter' && (
                <FormControl>
                  <TsTextField
                    disabled={externalConfig}
                    fullWidth
                    name="apiKey"
                    label={t('core:apiKey', 'API Key') + ' *'}
                    data-tid="openRouterApiKeyTID"
                    value={provider.apiKey || ''}
                    type="password"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      handleChangeProvider(
                        provider.id,
                        'apiKey',
                        event.target.value,
                      );
                    }}
                    placeholder="sk-or-..."
                  />
                </FormControl>
              )}
              <FormControl sx={{ minWidth: 320 }} size="small">
                <InputLabel id={provider.id + '-defaultTextModelID'}>
                  {t('core:defaultTextModel')}
                </InputLabel>
                <Select
                  labelId={provider.id + '-defaultTextModelID'}
                  id={provider.id + '-defaultTextModelIDSelect'}
                  value={provider.defaultTextModel || ''}
                  label={t('core:defaultTextModel')}
                  disabled={externalConfig}
                  onChange={(event: SelectChangeEvent) => {
                    handleChangeProvider(
                      provider.id,
                      'defaultTextModel',
                      event.target.value,
                    );
                  }}
                >
                  {models.current
                    .filter(
                      (m) =>
                        provider.engine === 'openrouter' ||
                        (!m.name.includes('llava') &&
                          !m.name.includes('bakllava')),
                    )
                    .map((m: ModelResponse) => (
                      <MenuItem key={m.name} value={m.name}>
                        {m.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              {provider.engine === 'ollama' && (
                <FormControl sx={{ minWidth: 320 }} size="small">
                  <InputLabel id={provider.id + '-defaultImageModelID'}>
                    {t('core:defaultImageModel')}
                  </InputLabel>
                  <Select
                    labelId={provider.id + '-defaultImageModelID'}
                    id={provider.id + '-defaultImageModelIDSelect'}
                    value={provider.defaultImageModel || ''}
                    label={t('core:defaultImageModel')}
                    disabled={externalConfig}
                    onChange={(event: SelectChangeEvent) => {
                      handleChangeProvider(
                        provider.id,
                        'defaultImageModel',
                        event.target.value,
                      );
                    }}
                  >
                    {models.current
                      .filter(
                        (m) =>
                          m.name.includes('llava') ||
                          m.name.includes('bakllava'),
                      )
                      .map((m: ModelResponse) => (
                        <MenuItem key={m.name} value={m.name}>
                          {m.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )}
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => removeAiProvider(provider.id)}
                startIcon={<DeleteOutline />}
                disabled={externalConfig || aiProviders.length < 2}
                sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
              >
                {t('core:removeProvider')}
              </Button>
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};
