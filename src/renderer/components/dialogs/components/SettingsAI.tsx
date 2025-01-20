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
import { default as Tooltip, default as TooltipTS } from '-/components/Tooltip';
import TsButton from '-/components/TsButton';
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
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
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
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import React, { ChangeEvent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getOllamaModels } from '-/components/chat/OllamaClient';

interface Props {
  closeSettings: () => void;
}

function SettingsAI(props: Props) {
  const { i18n, t } = useTranslation();
  const { closeSettings } = props;
  const { changeCurrentModel } = useChatContext();
  const aiDefaultProvider: AIProvider = useSelector(getDefaultAIProvider);
  const aiProviders: AIProvider[] = useSelector(getAIProviders);
  //const ollamaAlive = useRef<boolean | null>(null);
  const [ignored, forceUpdate] = React.useReducer((x) => x + 1, 0, undefined);
  const dispatch: AppDispatch = useDispatch();
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const providersAlive = React.useRef({});
  const [openedNewAIMenu, setOpenedNewAIMenu] = React.useState(false);

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
      getOllamaModels(provider.url).then((m) => {
        const alive = !!m;
        providersAlive.current = {
          ...providersAlive.current,
          [provider.id]: alive,
        };
        forceUpdate();
        return alive;
        /*if (provider.alive !== alive) {
            handleChangeProvider(provider.id, 'alive', alive);
          }*/
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
    getOllamaModels(providerUrl).then((m) => {
      const providerId = getUuid();
      providersAlive.current = {
        ...providersAlive.current,
        [providerId]: !!m,
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
              TagSpaces do <b>not</b> have its own AI engine or models, but
              relays entirely on external services like Ollama. If you haven't
              already installed Ollama, you can download it from the{' '}
              <a href="https://ollama.com/download" target="_blank">
                official website
              </a>{' '}
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
            <IconButton
              aria-label={t('core:deleteModel')}
              onClick={() => {
                const result = confirm(
                  'Do you want to remove ' + provider.name + ' AI config?',
                );
                if (result) {
                  dispatch(SettingsActions.removeAiProvider(provider.id));
                }
              }}
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
                label={t('core:defaultAImodelText') + ' *'}
                handleChangeModel={(modelName: string) => {
                  handleChangeProvider(
                    provider.id,
                    'defaultTextModel',
                    modelName,
                  );
                  changeCurrentModel(modelName, closeSettings);
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
                  changeCurrentModel(modelName, closeSettings);
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
    </div>
  );
}

export default SettingsAI;
