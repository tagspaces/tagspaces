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

import React, { ChangeEvent, useState } from 'react';
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
} from '@mui/material';
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
import Input from '@mui/material/Input';
import InfoIcon from '-/components/InfoIcon';
import { Box } from '@mui/material/';

function SettingsAI() {
  const { i18n, t } = useTranslation();
  const ollamaSettings = useSelector(getOllamaSettings);

  const dispatch: AppDispatch = useDispatch();

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

  return (
    <>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandIcon />}
          aria-controls="ollama-content"
          id="ollama-header"
          data-tid="ollamaTID"
        >
          <Typography>
            {t('core:ollama')}
            <BetaLabel />
          </Typography>
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
              <Input
                fullWidth
                name="ollamaSocket"
                data-tid="ollamaSocketTID"
                value={ollamaSettings.url}
                onChange={handleInputChange}
              />
            </FormControl>
          </FormGroup>
        </AccordionDetails>
      </Accordion>
    </>
  );
}

export default SettingsAI;
