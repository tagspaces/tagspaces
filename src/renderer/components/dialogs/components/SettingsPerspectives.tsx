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

import { BetaLabel } from '-/components/HelperComponents';
import TsButton from '-/components/TsButton';
import { usePerspectiveOnboardingContext } from '-/components/dialogs/hooks/usePerspectiveOnboardingContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import {
  AvailablePerspectives,
  perspectiveHasOnboarding,
} from '-/perspectives';
import { Pro } from '-/pro';
import {
  actions as SettingsActions,
  getEnabledPerspectives,
  isEnabledPerspectivesLocked,
  isHideProFeatures,
} from '-/reducers/settings';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

function SettingsPerspectives() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { showNotification } = useNotificationContext();
  const { openPerspectiveOnboarding } = usePerspectiveOnboardingContext();
  const enabledPerspectives: string[] = useSelector(getEnabledPerspectives);
  const hideProFeatures: boolean = useSelector(isHideProFeatures);
  const configLocked: boolean = isEnabledPerspectivesLocked();
  const hasPro = Pro ? true : false;

  const handleShowIntro = (perspectiveId: string) => () => {
    dispatch(SettingsActions.resetPerspectiveOnboarding(perspectiveId));
    openPerspectiveOnboarding(perspectiveId);
  };

  // A perspective only "counts" as a fallback for the guard if the user
  // can actually use it — Pro entries on a Lite build are perpetually
  // enabled in redux (defaults add them all) but the user can never reach
  // them through the switcher, so they shouldn't suppress the
  // last-enabled warning when the user disables Grid or List.
  const isUserUsable = (id: string): boolean => {
    const meta = AvailablePerspectives.find((p) => p.id === id);
    if (!meta) return false;
    if (meta.pro === true && !hasPro) return false;
    return true;
  };

  const handleToggle =
    (perspectiveId: string, currentlyEnabled: boolean) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      if (configLocked) {
        return;
      }
      const next = event.target.checked;
      if (!next) {
        const remaining = enabledPerspectives.filter(
          (id) => id !== perspectiveId && isUserUsable(id),
        );
        if (remaining.length === 0) {
          showNotification(
            t('core:cannotDisableLastPerspective'),
            'warning',
            true,
          );
          return;
        }
      }
      dispatch(SettingsActions.setPerspectiveEnabled(perspectiveId, next));
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
      <Typography variant="body2" sx={{ marginBottom: 1 }}>
        {configLocked
          ? t('core:perspectivesConfiguredByExtConfig')
          : t('core:perspectivesSettingsHelp')}
      </Typography>
      <List>
        {AvailablePerspectives.map((perspective) => {
          if (perspective.pro === true && hideProFeatures && !hasPro) {
            return null;
          }
          const enabled = enabledPerspectives.includes(perspective.id);
          const proLocked = perspective.pro === true && !hasPro;
          const disabled = proLocked || configLocked;
          const switchControl = (
            <Switch
              data-tid={'enablePerspective_' + perspective.id}
              checked={enabled}
              disabled={disabled}
              onChange={handleToggle(perspective.id, enabled)}
            />
          );
          let wrappedSwitch = switchControl;
          if (configLocked) {
            wrappedSwitch = (
              <Tooltip title={t('core:perspectivesConfiguredByExtConfig')}>
                <span>{switchControl}</span>
              </Tooltip>
            );
          } else if (proLocked) {
            wrappedSwitch = (
              <Tooltip title={t('core:thisFunctionalityIsAvailableInPro')}>
                <span>{switchControl}</span>
              </Tooltip>
            );
          }
          const hasOnboarding = perspectiveHasOnboarding(perspective.id);
          return (
            <ListItem
              key={perspective.id}
              data-tid={'perspectiveRow_' + perspective.id}
              secondaryAction={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {hasOnboarding && (
                    <TsButton
                      data-tid={'showPerspectiveIntro_' + perspective.id}
                      onClick={handleShowIntro(perspective.id)}
                      size="small"
                    >
                      {t('core:showPerspectiveIntro')}
                    </TsButton>
                  )}
                  {wrappedSwitch}
                </Box>
              }
            >
              <ListItemIcon>{perspective.icon}</ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {perspective.title}
                    {perspective.pro && (
                      <Chip size="small" color="primary" label="PRO" />
                    )}
                    {perspective.beta && <BetaLabel />}
                  </Box>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}

export default SettingsPerspectives;
