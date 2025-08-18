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
  CreateFileIcon,
  ExpandIcon,
  ReloadIcon,
  RemoveIcon,
} from '-/components/CommonIcons';
import { default as TooltipTS } from '-/components/Tooltip';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import TsMenuList from '-/components/TsMenuList';
import TsSelect from '-/components/TsSelect';
import TsTextField from '-/components/TsTextField';
import { AIProvider, AIProviders } from '-/components/chat/ChatTypes';
import SelectChatModel from '-/components/chat/SelectChatModel';
import { OllamaIcon } from '-/components/dialogs/components/Ollama';
import { useChatContext } from '-/hooks/useChatContext';
import { AppDispatch } from '-/reducers/app';
import {
  actions as SettingsActions,
  getAIProviders,
  getDefaultAIProvider,
} from '-/reducers/settings';
import { openURLExternally } from '-/services/utils-io';
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
  Switch,
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
import { Pro } from '-/pro';
import { TS } from '-/tagspaces.namespace';

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

  function checkOllamaAlive() {
    aiProviders.map((provider) =>
      checkProviderAlive(provider.url).then((alive) => {
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

  const addAiProvider = (provider: AIProviders) => {
    //event: ChangeEvent<HTMLInputElement>) => {
    //const provider: AIProviders = event.target.value as AIProviders;
    const providerUrl = provider === 'ollama' ? 'http://localhost:11434' : '';
    checkProviderAlive(providerUrl).then((isAlive) => {
      const providerId = getUuid();
      providersAlive.current = {
        ...providersAlive.current,
        [providerId]: isAlive,
      };
      const aiProvider: AIProvider = {
        id: providerId,
        engine: provider,
        name: provider,
        url: providerUrl,
        enable: true,
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

  function cancelSavingTemplate(key: string) {
    aiTemplates.current[key] = undefined;
    forceUpdate();
  }

  const externalConfig = typeof window.ExtAI !== 'undefined';

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
          //expandIcon={<ExpandIcon />}
          aria-controls="ai-general"
          id="ai-general-header"
          data-tid="aiGeneralTID"
        >
          <Box style={{ display: 'block' }}>
            <Typography>{t('core:aiSettings')}</Typography>
            <br />
            <Typography variant="caption">
              TagSpaces do not have its own AI engine or models, but relays
              entirely on external software like Ollama. If you don't have
              Ollama, you can download it for free from
              <TsButton
                style={{
                  fontSize: 13,
                  textTransform: 'unset',
                  fontWeight: 'normal',
                  paddingTop: 0,
                  paddingBottom: 0,
                }}
                variant="text"
                onClick={() => {
                  openURLExternally('https://ollama.com/download', true);
                }}
              >
                ollama.com
              </TsButton>{' '}
              and follow the installation instructions to get it set up on your
              computer.
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
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
                //tooltip={t('core:createNew')}
                disabled={externalConfig}
                aria-controls={
                  openedNewAIMenu ? 'split-button-menu' : undefined
                }
                aria-expanded={openedNewAIMenu ? 'true' : undefined}
                aria-haspopup="menu"
                data-tid="createNewAIButtonTID"
                onClick={handleToggle}
                startIcon={<CreateFileIcon />}
                style={{ marginBottom: AppConfig.defaultSpaceBetweenButtons }}
              >
                <Box
                  style={{
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
                        <MenuItem
                          key="createNewTextFileTID"
                          data-tid="aiCreateNewTextFileTID"
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
                    <OllamaIcon width={10} style={{ marginRight: 5 }} />
                    {provider.name}
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
              All AI-functionality is currently disabled. Please add and
              configure an AI-engine in order to use external AIs in TagSpaces.
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
            <Typography>
              <OllamaIcon width={15} style={{ marginRight: 5 }} />
              {provider.name}
            </Typography>
            <TooltipTS
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
            </TooltipTS>
            <TsIconButton
              aria-label="removeAIProvider"
              tooltip={t('core:remove')}
              onClick={(e) => {
                e.stopPropagation();
                const result = confirm(
                  'Do you want to remove "' + provider.name + '" AI config?',
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
                        <InputAdornment position="end" style={{ height: 32 }}>
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
                  changeCurrentModel(modelName, closeSettings);
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
                  changeCurrentModel(modelName, closeSettings);
                }}
                aiProvider={provider}
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
                !(typeof window.ExtDefaultQuestionPrompt === 'undefined')
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
              slotProps={{
                input: {
                  endAdornment: aiTemplates.current[
                    'DEFAULT_QUESTION_PROMPT'
                  ] && (
                    <InputAdornment position="end">
                      <TsButton
                        variant="contained"
                        data-tid={'saveDefaultQuestionPromptTID'}
                        onClick={() => saveTemplate('DEFAULT_QUESTION_PROMPT')}
                        style={{
                          // @ts-ignore
                          WebkitAppRegion: 'no-drag',
                        }}
                      >
                        {t('core:save')}
                      </TsButton>
                      <TsButton
                        variant="contained"
                        data-tid={'saveDefaultQuestionPromptTID'}
                        onClick={() =>
                          cancelSavingTemplate('DEFAULT_QUESTION_PROMPT')
                        }
                        style={{
                          // @ts-ignore
                          WebkitAppRegion: 'no-drag',
                        }}
                      >
                        {t('core:cancel')}
                      </TsButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TsTextField
              fullWidth
              multiline
              rows={5}
              disabled={!(typeof window.ExtDefaultSystemPrompt === 'undefined')}
              label={t('defaultSystemPrompt')}
              value={
                aiTemplates.current['DEFAULT_SYSTEM_PROMPT'] ??
                aiTemplatesContext.getTemplate('DEFAULT_SYSTEM_PROMPT')
              }
              onChange={(e) => {
                aiTemplates.current['DEFAULT_SYSTEM_PROMPT'] = e.target.value;
                forceUpdate();
              }}
              slotProps={{
                input: {
                  endAdornment: aiTemplates.current[
                    'DEFAULT_SYSTEM_PROMPT'
                  ] && (
                    <InputAdornment position="end">
                      <TsButton
                        variant="contained"
                        onClick={() => saveTemplate('DEFAULT_SYSTEM_PROMPT')}
                        style={{
                          // @ts-ignore
                          WebkitAppRegion: 'no-drag',
                        }}
                      >
                        {t('core:save')}
                      </TsButton>
                      <TsButton
                        variant="contained"
                        onClick={() =>
                          cancelSavingTemplate('DEFAULT_SYSTEM_PROMPT')
                        }
                        style={{
                          // @ts-ignore
                          WebkitAppRegion: 'no-drag',
                        }}
                      >
                        {t('core:cancel')}
                      </TsButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TsTextField
              fullWidth
              multiline
              rows={5}
              disabled={!(typeof window.ExtDefaultSystemPrompt === 'undefined')}
              label={t('summarizePrompt')}
              value={
                aiTemplates.current['SUMMARIZE_PROMPT'] ??
                aiTemplatesContext.getTemplate('SUMMARIZE_PROMPT')
              }
              onChange={(e) => {
                aiTemplates.current['SUMMARIZE_PROMPT'] = e.target.value;
                forceUpdate();
              }}
              slotProps={{
                input: {
                  endAdornment: aiTemplates.current['SUMMARIZE_PROMPT'] && (
                    <InputAdornment position="end">
                      <TsButton
                        variant="contained"
                        onClick={() => saveTemplate('SUMMARIZE_PROMPT')}
                        style={{
                          // @ts-ignore
                          WebkitAppRegion: 'no-drag',
                        }}
                      >
                        {t('core:save')}
                      </TsButton>
                      <TsButton
                        variant="contained"
                        onClick={() => cancelSavingTemplate('SUMMARIZE_PROMPT')}
                        style={{
                          // @ts-ignore
                          WebkitAppRegion: 'no-drag',
                        }}
                      >
                        {t('core:cancel')}
                      </TsButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TsTextField
              fullWidth
              multiline
              rows={5}
              disabled={!(typeof window.ExtDefaultSystemPrompt === 'undefined')}
              label={t('imageDescription')}
              value={
                aiTemplates.current['IMAGE_DESCRIPTION'] ??
                aiTemplatesContext.getTemplate('IMAGE_DESCRIPTION')
              }
              onChange={(e) => {
                aiTemplates.current['IMAGE_DESCRIPTION'] = e.target.value;
                forceUpdate();
              }}
              slotProps={{
                input: {
                  endAdornment: aiTemplates.current['IMAGE_DESCRIPTION'] && (
                    <InputAdornment position="end">
                      <TsButton
                        variant="contained"
                        onClick={() => saveTemplate('IMAGE_DESCRIPTION')}
                        style={{
                          // @ts-ignore
                          WebkitAppRegion: 'no-drag',
                        }}
                      >
                        {t('core:save')}
                      </TsButton>
                      <TsButton
                        variant="contained"
                        onClick={() =>
                          cancelSavingTemplate('IMAGE_DESCRIPTION')
                        }
                        style={{
                          // @ts-ignore
                          WebkitAppRegion: 'no-drag',
                        }}
                      >
                        {t('core:cancel')}
                      </TsButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TsTextField
              fullWidth
              multiline
              rows={5}
              disabled={!(typeof window.ExtDefaultSystemPrompt === 'undefined')}
              label={t('imageDescriptionStructured')}
              value={
                aiTemplates.current['IMAGE_DESCRIPTION_STRUCTURED'] ??
                aiTemplatesContext.getTemplate('IMAGE_DESCRIPTION_STRUCTURED')
              }
              onChange={(e) => {
                aiTemplates.current['IMAGE_DESCRIPTION_STRUCTURED'] =
                  e.target.value;
                forceUpdate();
              }}
              slotProps={{
                input: {
                  endAdornment: aiTemplates.current[
                    'IMAGE_DESCRIPTION_STRUCTURED'
                  ] && (
                    <InputAdornment position="end">
                      <TsButton
                        variant="contained"
                        onClick={() =>
                          saveTemplate('IMAGE_DESCRIPTION_STRUCTURED')
                        }
                        style={{
                          // @ts-ignore
                          WebkitAppRegion: 'no-drag',
                        }}
                      >
                        {t('core:save')}
                      </TsButton>
                      <TsButton
                        variant="contained"
                        onClick={() =>
                          cancelSavingTemplate('IMAGE_DESCRIPTION_STRUCTURED')
                        }
                        style={{
                          // @ts-ignore
                          WebkitAppRegion: 'no-drag',
                        }}
                      >
                        {t('core:cancel')}
                      </TsButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TsTextField
              fullWidth
              multiline
              rows={5}
              disabled={!(typeof window.ExtDefaultSystemPrompt === 'undefined')}
              label={t('textDescription')}
              value={
                aiTemplates.current['TEXT_DESCRIPTION'] ??
                aiTemplatesContext.getTemplate('TEXT_DESCRIPTION')
              }
              onChange={(e) => {
                aiTemplates.current['TEXT_DESCRIPTION'] = e.target.value;
                forceUpdate();
              }}
              slotProps={{
                input: {
                  endAdornment: aiTemplates.current['TEXT_DESCRIPTION'] && (
                    <InputAdornment position="end">
                      <TsButton
                        variant="contained"
                        onClick={() => saveTemplate('TEXT_DESCRIPTION')}
                        style={{
                          // @ts-ignore
                          WebkitAppRegion: 'no-drag',
                        }}
                      >
                        {t('core:save')}
                      </TsButton>
                      <TsButton
                        variant="contained"
                        onClick={() => cancelSavingTemplate('TEXT_DESCRIPTION')}
                        style={{
                          // @ts-ignore
                          WebkitAppRegion: 'no-drag',
                        }}
                      >
                        {t('core:cancel')}
                      </TsButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TsTextField
              fullWidth
              multiline
              rows={5}
              disabled={!(typeof window.ExtDefaultSystemPrompt === 'undefined')}
              label={t('generateImageTags')}
              value={
                aiTemplates.current['GENERATE_IMAGE_TAGS'] ??
                aiTemplatesContext.getTemplate('GENERATE_IMAGE_TAGS')
              }
              onChange={(e) => {
                aiTemplates.current['GENERATE_IMAGE_TAGS'] = e.target.value;
                forceUpdate();
              }}
              slotProps={{
                input: {
                  endAdornment: aiTemplates.current['GENERATE_IMAGE_TAGS'] && (
                    <InputAdornment position="end">
                      <TsButton
                        variant="contained"
                        onClick={() => saveTemplate('GENERATE_IMAGE_TAGS')}
                        style={{
                          // @ts-ignore
                          WebkitAppRegion: 'no-drag',
                        }}
                      >
                        {t('core:save')}
                      </TsButton>
                      <TsButton
                        variant="contained"
                        onClick={() =>
                          cancelSavingTemplate('GENERATE_IMAGE_TAGS')
                        }
                        style={{
                          // @ts-ignore
                          WebkitAppRegion: 'no-drag',
                        }}
                      >
                        {t('core:cancel')}
                      </TsButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TsTextField
              fullWidth
              multiline
              rows={5}
              disabled={!(typeof window.ExtDefaultSystemPrompt === 'undefined')}
              label={t('generateTags')}
              value={
                aiTemplates.current['GENERATE_TAGS'] ??
                aiTemplatesContext.getTemplate('GENERATE_TAGS')
              }
              onChange={(e) => {
                aiTemplates.current['GENERATE_TAGS'] = e.target.value;
                forceUpdate();
              }}
              slotProps={{
                input: {
                  endAdornment: aiTemplates.current['GENERATE_TAGS'] && (
                    <InputAdornment position="end">
                      <TsButton
                        variant="contained"
                        onClick={() => saveTemplate('GENERATE_TAGS')}
                        style={{
                          // @ts-ignore
                          WebkitAppRegion: 'no-drag',
                        }}
                      >
                        {t('core:save')}
                      </TsButton>
                      <TsButton
                        variant="contained"
                        onClick={() => cancelSavingTemplate('GENERATE_TAGS')}
                        style={{
                          // @ts-ignore
                          WebkitAppRegion: 'no-drag',
                        }}
                      >
                        {t('core:cancel')}
                      </TsButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </AccordionDetails>
        </Accordion>
      )}
    </div>
  );
}

export default SettingsAI;
