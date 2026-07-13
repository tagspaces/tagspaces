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
import {
  AIIcon,
  CreateFileIcon,
  ExpandIcon,
  OllamaIcon,
  ReloadIcon,
  RemoveIcon,
} from '-/components/CommonIcons';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import TsMenuList from '-/components/TsMenuList';
import TsSelect from '-/components/TsSelect';
import TsSwitch from '-/components/TsSwitch';
import TsTextField from '-/components/TsTextField';
import TsTooltip from '-/components/TsTooltip';
import { AIProvider } from '-/components/chat/ChatTypes';
import SelectChatModel from '-/components/chat/SelectChatModel';
import {
  AiPreset,
  aiPresets,
  presetIconForEngine,
} from '-/components/chat/aiPresets';
import { useChatContext } from '-/hooks/useChatContext';
import { Pro } from '-/pro';
import { AppDispatch } from '-/reducers/app';
import {
  actions as SettingsActions,
  getAIProviders,
  getDefaultAIProvider,
} from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  ClickAwayListener,
  FormControl,
  Grow,
  MenuItem,
  Paper,
  Popper,
} from '@mui/material';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import React, { ChangeEvent, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

interface Props {
  closeSettings: () => void;
}

function SettingsAI(props: Props) {
  const { t } = useTranslation();
  const { closeSettings } = props;
  const { changeCurrentModel, checkProviderAlive } = useChatContext();
  const aiDefaultProvider: AIProvider = useSelector(getDefaultAIProvider);
  const aiProviders: AIProvider[] = useSelector(getAIProviders);
  //const ollamaAlive = useRef<boolean | null>(null);
  const [ignored, forceUpdate] = React.useReducer((x) => x + 1, 0, undefined);
  const dispatch: AppDispatch = useDispatch();
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const providersAlive = React.useRef({});
  const aiTemplates = React.useRef({});
  const [focusedTemplate, setFocusedTemplate] =
    React.useState<string>(undefined);
  const [openedNewAIMenu, setOpenedNewAIMenu] = React.useState(false);

  const aiTemplatesContext = Pro?.contextProviders?.AiTemplatesContext
    ? useContext<TS.AiTemplatesContextData>(
        Pro.contextProviders.AiTemplatesContext,
      )
    : undefined;

  useEffect(() => {
    checkOllamaAlive();
  }, []);

  const handleToggle = () => {
    setOpenedNewAIMenu((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpenedNewAIMenu(false);
  };

  function engineIcon(engine: AIProvider['engine'], sx?: any) {
    return presetIconForEngine(engine) === 'ollama' ? (
      <OllamaIcon sx={sx} />
    ) : (
      <AIIcon sx={sx} />
    );
  }

  function checkOllamaAlive() {
    aiProviders.map((provider) =>
      checkProviderAlive(provider).then((alive) => {
        providersAlive.current = {
          ...providersAlive.current,
          [provider.id]: alive,
        };
        forceUpdate();
        return alive;
      }),
    );
    //Promise.all(promises).then(() => forceUpdate());
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

  const addAiProvider = (preset: AiPreset) => {
    const providerId = getUuid();
    const aiProvider: AIProvider = {
      id: providerId,
      engine: preset.engine,
      name: preset.label,
      url: preset.defaultUrl,
      enable: true,
    };
    checkProviderAlive(aiProvider).then((isAlive) => {
      providersAlive.current = {
        ...providersAlive.current,
        [providerId]: isAlive,
      };
      dispatch(SettingsActions.addAiProvider(aiProvider));
    });
  };

  function saveTemplate(key: string) {
    const template = aiTemplates.current[key];
    if (template) {
      aiTemplatesContext.setTemplate(key, template);
      aiTemplates.current[key] = undefined;
    }
  }

  function resetTemplate(key: string) {
    const template = aiTemplatesContext.getDefaultTemplate(key);
    if (template) {
      aiTemplatesContext.setTemplate(key, template);
      aiTemplates.current[key] = undefined;
    }
  }

  function cancelSavingTemplate(key: string) {
    aiTemplates.current[key] = undefined;
    forceUpdate();
  }

  // Keep Save/Reset/Cancel visible whenever the field is focused, there is a
  // pending edit (even one that cleared the field to empty), OR the effective
  // prompt is empty/missing — so the buttons show as soon as the user starts
  // interacting and an accidentally-cleared or lost prompt can always be reset
  // to default. The previous truthiness guard hid the buttons the moment a
  // prompt became empty, stranding the user with a blank prompt and no recovery.
  function showTemplateActions(key: string): boolean {
    if (focusedTemplate === key) {
      return true;
    }
    const pendingEdit = aiTemplates.current[key];
    if (pendingEdit !== undefined) {
      return true;
    }
    return !aiTemplatesContext?.getTemplate(key);
  }

  const handleTemplateFocus = (key: string) => () => setFocusedTemplate(key);

  const handleTemplateBlur = (key: string) => () =>
    setFocusedTemplate((prev) => (prev === key ? undefined : prev));

  const externalConfig = typeof AppConfig.ExtAI !== 'undefined';

  const actionButtons = (key) => {
    const pendingEdit = aiTemplates.current[key];
    // Only a non-empty pending edit is worth saving; an empty field or no edit
    // leaves Save disabled while Reset/Cancel stay available for recovery.
    const canSave = typeof pendingEdit === 'string' && pendingEdit.length > 0;
    return (
      <InputAdornment
        position="end"
        sx={{ flexDirection: 'column', marginTop: '-70px' }}
        // Keep the field focused when a button is clicked: without this, the
        // input blurs on mousedown, showTemplateActions() flips to false and the
        // buttons unmount before the click lands (so Reset/Cancel never fire).
        onMouseDown={(event) => event.preventDefault()}
      >
        <TsButton
          variant="text"
          disabled={!canSave}
          data-tid={'save' + key + 'TID'}
          onClick={() => saveTemplate(key)}
        >
          {t('core:save')}
        </TsButton>
        <TsButton
          variant="text"
          tooltip={t('peri:resetsToDefaultPrompt')}
          data-tid={'reset' + key + 'TID'}
          onClick={() => resetTemplate(key)}
        >
          {t('core:resetBtn')}
        </TsButton>
        <TsButton
          variant="text"
          data-tid={'cancel' + key + 'TID'}
          onClick={() => cancelSavingTemplate(key)}
        >
          {t('core:cancel')}
        </TsButton>
      </InputAdornment>
    );
  };

  return (
    <Box
      sx={{
        overflowX: 'hidden',
        overflowY: 'auto',
        height: '100%',
        padding: '10px',
      }}
    >
      <Accordion defaultExpanded>
        <AccordionSummary
          aria-controls="ai-general"
          id="ai-general-header"
          data-tid="aiGeneralTID"
        >
          <Typography>{t('core:aiSettings')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography
            variant="caption"
            sx={{ display: 'block', marginBottom: 1 }}
          >
            {t('peri:aiClarification')}{' '}
          </Typography>
          <ClickAwayListener onClickAway={handleClose}>
            <Box
              ref={anchorRef}
              sx={{
                width: '100%',
                textAlign: 'left',
                position: 'relative',
              }}
            >
              <TsButton
                disabled={externalConfig}
                aria-controls={
                  openedNewAIMenu ? 'split-button-menu' : undefined
                }
                aria-expanded={openedNewAIMenu ? 'true' : undefined}
                aria-haspopup="menu"
                data-tid="createNewAIButtonTID"
                onClick={handleToggle}
                startIcon={<CreateFileIcon />}
                sx={{ marginBottom: AppConfig.defaultSpaceBetweenButtons }}
              >
                <Box
                  sx={{
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  {t('core:addAIEngine')}
                </Box>
              </TsButton>
              <Popper
                sx={{
                  zIndex: 1,
                }}
                open={openedNewAIMenu}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                placement="bottom-start"
                disablePortal
              >
                {({ TransitionProps, placement }) => (
                  <Grow
                    {...TransitionProps}
                    style={{
                      transformOrigin:
                        placement === 'bottom' ? 'center top' : 'center bottom',
                    }}
                  >
                    <Paper>
                      <TsMenuList id="split-button-menu" autoFocusItem>
                        {aiPresets.map((preset) => (
                          <MenuItem
                            key={preset.key}
                            data-tid={'aiAddProvider_' + preset.key + 'TID'}
                            onClick={() => {
                              addAiProvider(preset);
                              setOpenedNewAIMenu(false);
                            }}
                          >
                            <ListItemIcon>
                              {preset.icon === 'ollama' ? (
                                <OllamaIcon />
                              ) : (
                                <AIIcon />
                              )}
                            </ListItemIcon>
                            <ListItemText primary={preset.label} />
                          </MenuItem>
                        ))}
                      </TsMenuList>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </Box>
          </ClickAwayListener>
          {aiDefaultProvider && (
            <TsSelect
              disabled={externalConfig}
              value={aiDefaultProvider?.id}
              onChange={changeDefaultAiProvider}
              label={t('core:defaultAIEngine')}
            >
              {aiProviders
                .filter((p) => p.enable)
                .map((provider) => (
                  <MenuItem key={provider.id} value={provider.id}>
                    {engineIcon(provider.engine)}
                    <Box sx={{ display: 'inline-block', marginLeft: '5px' }}>
                      {provider.name}
                    </Box>
                  </MenuItem>
                ))}
            </TsSelect>
          )}
        </AccordionDetails>
      </Accordion>
      {!aiDefaultProvider && (
        <Accordion defaultExpanded>
          <AccordionSummary>
            <Typography variant="caption">
              {t('peri:aiFunctionalityDisabled')}
            </Typography>
          </AccordionSummary>
        </Accordion>
      )}
      {aiProviders.map((provider) => (
        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandIcon />}
            aria-controls={provider.id + 'content'}
            data-tid={provider.id + 'ollamaTID'}
            sx={{
              '& .MuiAccordionSummary-content': { alignItems: 'center' },
            }}
          >
            {engineIcon(provider.engine)}
            <Typography sx={{ marginLeft: '5px' }}>{provider.name}</Typography>
            <TsTooltip
              title={
                t('core:serviceStatus') +
                ': ' +
                (providersAlive.current[provider.id]
                  ? t('core:available')
                  : t('core:notAvailable'))
              }
            >
              {providersAlive.current[provider.id] === null ? (
                <CircularProgress size={12} />
              ) : (
                <FiberManualRecordIcon
                  sx={{
                    color: providersAlive.current[provider.id]
                      ? 'green'
                      : 'red',
                    fontSize: 19,
                    ml: 1,
                  }}
                />
              )}
            </TsTooltip>
            <TsIconButton
              aria-label="removeAIProvider"
              tooltip={t('core:remove')}
              onClick={(e) => {
                e.stopPropagation();
                const result = confirm(
                  t('peri:confirmRemoveAiConfig', { name: provider.name }),
                );
                if (result) {
                  dispatch(SettingsActions.removeAiProvider(provider.id));
                }
              }}
              data-tid="removeAIProviderTID"
            >
              <RemoveIcon />
            </TsIconButton>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              <FormControl>
                <TsTextField
                  disabled={externalConfig}
                  fullWidth
                  name="engineName"
                  label={t('core:engineName') + ' *'}
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
                  disabled={externalConfig}
                  fullWidth
                  name="ollamaSocket"
                  label={t('core:engineUrl') + ' *'}
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
                        <InputAdornment position="end" sx={{ height: 32 }}>
                          <TsIconButton
                            tooltip={t('core:refreshServiceStatus')}
                            onClick={() => {
                              checkOllamaAlive();
                            }}
                          >
                            <ReloadIcon />
                          </TsIconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </FormControl>
              <SelectChatModel
                disabled={!providersAlive.current[provider.id]}
                label={t('core:defaultAImodelText') + ' *'}
                handleChangeModel={(modelName: string) => {
                  handleChangeProvider(
                    provider.id,
                    'defaultTextModel',
                    modelName,
                  );
                  changeCurrentModel(modelName, closeSettings, provider);
                }}
                aiProvider={provider}
                chosenModel={provider.defaultTextModel}
              />
              <SelectChatModel
                disabled={!providersAlive.current[provider.id]}
                label={t('core:defaultAImodelImages')}
                handleChangeModel={(modelName: string) => {
                  handleChangeProvider(
                    provider.id,
                    'defaultImageModel',
                    modelName,
                  );
                  changeCurrentModel(modelName, closeSettings, provider);
                }}
                aiProvider={provider}
                chosenModel={provider.defaultImageModel}
              />
              <FormControlLabel
                labelPlacement="start"
                sx={{ justifyContent: 'space-between', marginLeft: 0 }}
                control={
                  <TsSwitch
                    data-tid="locationIsDefault"
                    name="isDefault"
                    checked={provider.enable}
                    disabled={
                      !providersAlive.current[provider.id] || externalConfig
                    }
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      if (providersAlive.current[provider.id]) {
                        handleChangeProvider(
                          provider.id,
                          'enable',
                          !provider.enable,
                        );
                      }
                    }}
                  />
                }
                label={t('core:engineEnabled')}
              />
            </FormGroup>
          </AccordionDetails>
        </Accordion>
      ))}
      {Pro && aiTemplatesContext && (
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandIcon />}
            aria-controls={'AdvancedContent'}
            data-tid={'AdvancedTID'}
            sx={{
              '& .MuiAccordionSummary-content': { alignItems: 'center' },
            }}
          >
            <Typography>{'Advanced'}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TsTextField
              fullWidth
              multiline
              rows={5}
              disabled={
                !(typeof AppConfig.ExtDefaultQuestionPrompt === 'undefined')
              }
              label={t('defaultQuestionPrompt')}
              value={
                aiTemplates.current['DEFAULT_QUESTION_PROMPT'] ??
                aiTemplatesContext.getTemplate('DEFAULT_QUESTION_PROMPT')
              }
              onChange={(e) => {
                aiTemplates.current['DEFAULT_QUESTION_PROMPT'] = e.target.value;
                forceUpdate();
              }}
              onFocus={handleTemplateFocus('DEFAULT_QUESTION_PROMPT')}
              onBlur={handleTemplateBlur('DEFAULT_QUESTION_PROMPT')}
              slotProps={{
                input: {
                  endAdornment:
                    showTemplateActions('DEFAULT_QUESTION_PROMPT') &&
                    actionButtons('DEFAULT_QUESTION_PROMPT'),
                },
              }}
            />
            <TsTextField
              fullWidth
              multiline
              rows={5}
              disabled={
                !(typeof AppConfig.ExtDefaultSystemPrompt === 'undefined')
              }
              label={t('defaultSystemPrompt')}
              value={
                aiTemplates.current['DEFAULT_SYSTEM_PROMPT'] ??
                aiTemplatesContext.getTemplate('DEFAULT_SYSTEM_PROMPT')
              }
              onChange={(e) => {
                aiTemplates.current['DEFAULT_SYSTEM_PROMPT'] = e.target.value;
                forceUpdate();
              }}
              onFocus={handleTemplateFocus('DEFAULT_SYSTEM_PROMPT')}
              onBlur={handleTemplateBlur('DEFAULT_SYSTEM_PROMPT')}
              slotProps={{
                input: {
                  endAdornment:
                    showTemplateActions('DEFAULT_SYSTEM_PROMPT') &&
                    actionButtons('DEFAULT_SYSTEM_PROMPT'),
                },
              }}
            />
            <TsTextField
              fullWidth
              multiline
              rows={5}
              disabled={!(typeof AppConfig.ExtSummarizePrompt === 'undefined')}
              label={t('summarizePrompt')}
              value={
                aiTemplates.current['SUMMARIZE_PROMPT'] ??
                aiTemplatesContext.getTemplate('SUMMARIZE_PROMPT')
              }
              onChange={(e) => {
                aiTemplates.current['SUMMARIZE_PROMPT'] = e.target.value;
                forceUpdate();
              }}
              onFocus={handleTemplateFocus('SUMMARIZE_PROMPT')}
              onBlur={handleTemplateBlur('SUMMARIZE_PROMPT')}
              slotProps={{
                input: {
                  endAdornment:
                    showTemplateActions('SUMMARIZE_PROMPT') &&
                    actionButtons('SUMMARIZE_PROMPT'),
                },
              }}
            />
            <TsTextField
              fullWidth
              multiline
              rows={5}
              disabled={
                !(
                  typeof AppConfig.ExtDescriptionFromImagePrompt === 'undefined'
                )
              }
              label={t('imageDescription')}
              value={
                aiTemplates.current['IMAGE_DESCRIPTION_PROMPT'] ??
                aiTemplatesContext.getTemplate('IMAGE_DESCRIPTION_PROMPT')
              }
              onChange={(e) => {
                aiTemplates.current['IMAGE_DESCRIPTION_PROMPT'] =
                  e.target.value;
                forceUpdate();
              }}
              onFocus={handleTemplateFocus('IMAGE_DESCRIPTION_PROMPT')}
              onBlur={handleTemplateBlur('IMAGE_DESCRIPTION_PROMPT')}
              slotProps={{
                input: {
                  endAdornment:
                    showTemplateActions('IMAGE_DESCRIPTION_PROMPT') &&
                    actionButtons('IMAGE_DESCRIPTION_PROMPT'),
                },
              }}
            />
            <TsTextField
              fullWidth
              multiline
              rows={5}
              disabled={
                !(
                  typeof AppConfig.ExtDescriptionFromImageStructuredPrompt ===
                  'undefined'
                )
              }
              label={t('imageDescriptionStructured')}
              value={
                aiTemplates.current['IMAGE_DESCRIPTION_STRUCTURED_PROMPT'] ??
                aiTemplatesContext.getTemplate(
                  'IMAGE_DESCRIPTION_STRUCTURED_PROMPT',
                )
              }
              onChange={(e) => {
                aiTemplates.current['IMAGE_DESCRIPTION_STRUCTURED_PROMPT'] =
                  e.target.value;
                forceUpdate();
              }}
              onFocus={handleTemplateFocus(
                'IMAGE_DESCRIPTION_STRUCTURED_PROMPT',
              )}
              onBlur={handleTemplateBlur('IMAGE_DESCRIPTION_STRUCTURED_PROMPT')}
              slotProps={{
                input: {
                  endAdornment:
                    showTemplateActions(
                      'IMAGE_DESCRIPTION_STRUCTURED_PROMPT',
                    ) && actionButtons('IMAGE_DESCRIPTION_STRUCTURED_PROMPT'),
                },
              }}
            />
            <TsTextField
              fullWidth
              multiline
              rows={5}
              disabled={
                !(typeof AppConfig.ExtDescriptionFromTextPrompt === 'undefined')
              }
              label={t('textDescription')}
              value={
                aiTemplates.current['TEXT_DESCRIPTION_PROMPT'] ??
                aiTemplatesContext.getTemplate('TEXT_DESCRIPTION_PROMPT')
              }
              onChange={(e) => {
                aiTemplates.current['TEXT_DESCRIPTION_PROMPT'] = e.target.value;
                forceUpdate();
              }}
              onFocus={handleTemplateFocus('TEXT_DESCRIPTION_PROMPT')}
              onBlur={handleTemplateBlur('TEXT_DESCRIPTION_PROMPT')}
              slotProps={{
                input: {
                  endAdornment:
                    showTemplateActions('TEXT_DESCRIPTION_PROMPT') &&
                    actionButtons('TEXT_DESCRIPTION_PROMPT'),
                },
              }}
            />
            <TsTextField
              fullWidth
              multiline
              rows={5}
              disabled={
                !(typeof AppConfig.ExtTagsFromImagePrompt === 'undefined')
              }
              label={t('generateImageTags')}
              value={
                aiTemplates.current['IMAGE_TAGS_PROMPT'] ??
                aiTemplatesContext.getTemplate('IMAGE_TAGS_PROMPT')
              }
              onChange={(e) => {
                aiTemplates.current['IMAGE_TAGS_PROMPT'] = e.target.value;
                forceUpdate();
              }}
              onFocus={handleTemplateFocus('IMAGE_TAGS_PROMPT')}
              onBlur={handleTemplateBlur('IMAGE_TAGS_PROMPT')}
              slotProps={{
                input: {
                  endAdornment:
                    showTemplateActions('IMAGE_TAGS_PROMPT') &&
                    actionButtons('IMAGE_TAGS_PROMPT'),
                },
              }}
            />
            <TsTextField
              fullWidth
              multiline
              rows={5}
              disabled={
                !(typeof AppConfig.ExtTagsFromTextPrompt === 'undefined')
              }
              label={t('generateTags')}
              value={
                aiTemplates.current['TEXT_TAGS_PROMPT'] ??
                aiTemplatesContext.getTemplate('TEXT_TAGS_PROMPT')
              }
              onChange={(e) => {
                aiTemplates.current['TEXT_TAGS_PROMPT'] = e.target.value;
                forceUpdate();
              }}
              onFocus={handleTemplateFocus('TEXT_TAGS_PROMPT')}
              onBlur={handleTemplateBlur('TEXT_TAGS_PROMPT')}
              slotProps={{
                input: {
                  endAdornment:
                    showTemplateActions('TEXT_TAGS_PROMPT') &&
                    actionButtons('TEXT_TAGS_PROMPT'),
                },
              }}
            />
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
}

export default SettingsAI;
