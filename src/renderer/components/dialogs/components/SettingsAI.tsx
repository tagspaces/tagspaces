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

import {
  CreateFileIcon,
  ExpandIcon,
  NewFileIcon,
  ReloadIcon,
  RemoveIcon,
} from '-/components/CommonIcons';
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
  Grow,
  MenuItem,
  Paper,
  Popper,
  Switch,
} from '@mui/material';
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import React, { ChangeEvent, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useChatContext } from '-/hooks/useChatContext';
import AppConfig from '-/AppConfig';
import Box from '@mui/material/Box';
import TsButton from '-/components/TsButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import TsMenuList from '-/components/TsMenuList';

interface Props {
  closeSettings: () => void;
}

function SettingsAI(props: Props) {
  const { i18n, t } = useTranslation();
  const { closeSettings } = props;
  const { changeCurrentModel } = useChatContext();
  const aiDefailtProvider: AIProvider = useSelector(getDefaultAIProvider);
  const aiProviders: AIProvider[] = useSelector(getAIProviders);
  //const ollamaAlive = useRef<boolean | null>(null);
  const [ignored, forceUpdate] = React.useReducer((x) => x + 1, 0, undefined);
  const dispatch: AppDispatch = useDispatch();
  const anchorRef = React.useRef<HTMLDivElement>(null);
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

  const addAiProvider = (provider: AIProviders) => {
    //event: ChangeEvent<HTMLInputElement>) => {
    //const provider: AIProviders = event.target.value as AIProviders;
    const providerUrl = provider === 'ollama' ? 'http://localhost:11434' : '';
    window.electronIO.ipcRenderer
      .invoke('getOllamaModels', providerUrl)
      .then((m) => {
        const aiProvider: AIProvider = {
          id: getUuid(),
          engine: provider,
          name: provider,
          url: providerUrl,
          alive: !!m,
          enable: false,
        };
        dispatch(SettingsActions.addAiProvider(aiProvider));
      });
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
          {/*<TsSelect
            value={-1}
            onChange={addAiProvider}
            label={t('core:addAIEngine')}
          >
            <MenuItem value="ollama">
              <OllamaIcon width={10} style={{ marginRight: 5 }} />
              Ollama
            </MenuItem>
          </TsSelect>*/}
          <ClickAwayListener onClickAway={handleClose}>
            <Box
              ref={anchorRef}
              sx={{
                width: '100%',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <TsButton
                //tooltip={t('core:createNew')}
                aria-controls={
                  openedNewAIMenu ? 'split-button-menu' : undefined
                }
                aria-expanded={openedNewAIMenu ? 'true' : undefined}
                aria-haspopup="menu"
                data-tid="createNewAIButtonTID"
                onClick={handleToggle}
                startIcon={<CreateFileIcon />}
                style={{
                  borderRadius: AppConfig.defaultCSSRadius,
                }}
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
                          ata-tid="createNewTextFileTID"
                          onClick={() => addAiProvider('ollama')}
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
            <Typography>
              <OllamaIcon width={15} style={{ marginRight: 5 }} />
              {provider.name}
            </Typography>
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
