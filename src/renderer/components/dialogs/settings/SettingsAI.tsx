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

import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  InputLabel,
  MenuItem,
  FormLabel,
  Select,
  Switch,
  FormControl,
  CircularProgress,
  Box,
} from '@mui/material';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import {
  actions as SettingsActions,
  getOllamaSettings,
} from '-/reducers/settings';
import { BetaLabel } from '-/components/HelperComponents';
import { AppDispatch } from '-/reducers/app';
import { useTranslation } from 'react-i18next';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { ExpandIcon } from '-/components/CommonIcons';
import Typography from '@mui/material/Typography';
import InfoIcon from '-/components/InfoIcon';
import TsTextField from '-/components/TsTextField';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '-/components/Tooltip';
import IconButton from '@mui/material/IconButton';
import { OllamaIcon } from '-/components/dialogs/settings/Ollama';

function SettingsAI() {
  const { i18n, t } = useTranslation();
  const ollamaSettings = useSelector(getOllamaSettings);
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

  return (
    <>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandIcon />}
          aria-controls="ollama-content"
          id="ollama-header"
          data-tid="ollamaTID"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={2}
          >
            <Typography>
              <OllamaIcon width={20} /> {t('core:ollama')}
              <BetaLabel /> Service Status
            </Typography>
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
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 2 }}>
          <FormGroup style={{ width: '100%' }}>
            <FormControlLabel
              labelPlacement="start"
              style={{ justifyContent: 'space-between' }}
              control={
                <Switch
                  data-tid="locationIsDefault"
                  name="isDefault"
                  checked={ollamaSettings.enabled}
                  onChange={handleSwitchChange}
                />
              }
              label={t('core:ollamaEnabled')}
            />
            <FormControl>
              <Typography>
                {t('core:ollamaSocket')}
                <InfoIcon tooltip={t('core:ollamaSocketHelp')} />
              </Typography>
              <TsTextField
                fullWidth
                name="ollamaSocket"
                data-tid="ollamaSocketTID"
                value={ollamaSettings.url}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end" style={{ height: 32 }}>
                      <Tooltip title="Check Ollama Service Status">
                        <IconButton
                          onClick={() => {
                            checkOllamaAlive();
                          }}
                          size="large"
                        >
                          <AutorenewIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>
          </FormGroup>
        </AccordionDetails>
      </Accordion>
    </>
  );
}

export default SettingsAI;
