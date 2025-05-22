/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2021-present TagSpaces GmbH
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

import { Pro } from '-/pro';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

export function BetaLabel() {
  const { t } = useTranslation();
  return (
    <Tooltip title={t('featureInBetaStatus')}>
      <Typography sx={{ display: 'initial' }}>
        <sup style={{ marginLeft: 5, textTransform: 'uppercase' }}>
          {t('betaStatus')}
        </sup>
      </Typography>
    </Tooltip>
  );
}

export function ProLabel() {
  const { t } = useTranslation();
  return (
    !Pro && (
      <Tooltip placement="top" title={t('thisFunctionalityIsAvailableInPro')}>
        <Typography sx={{ display: 'initial' }}>
          <sup style={{ marginLeft: 5 }}>PRO</sup>
        </Typography>
      </Tooltip>
    )
  );
}

export function ProSign() {
  const { t } = useTranslation();
  return (
    !Pro && (
      <Tooltip placement="top" title={t('thisFunctionalityIsAvailableInPro')}>
        <Typography sx={{ display: 'initial' }}>
          <sup
            style={{
              fontSize: 10,
              borderRadius: 4,
              backgroundColor: '#1dd19f',
              padding: 3,
            }}
          >
            PRO
          </sup>
        </Typography>
      </Tooltip>
    )
  );
}

export function ProTooltip(props) {
  const { tooltip, placement, children } = props;
  const { t } = useTranslation();
  const proTooltip = tooltip && tooltip;
  const tooltipPlacement = placement || 'top';
  const noProTooltip = tooltip
    ? tooltip + ' - ' + t('thisFunctionalityIsAvailableInPro')
    : t('thisFunctionalityIsAvailableInPro');
  return (
    <Tooltip
      arrow
      placement={tooltipPlacement}
      title={Pro ? proTooltip : noProTooltip}
    >
      <div style={{ display: 'flex' }} children={children}></div>
    </Tooltip>
  );
}
