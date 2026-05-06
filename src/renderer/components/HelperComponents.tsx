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
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import TooltipTS from './Tooltip';

export function BetaLabel() {
  const { t } = useTranslation();
  return (
    <TooltipTS title={t('featureInBetaStatus')}>
      <Typography sx={{ display: 'initial' }}>
        <sup
          style={{ marginLeft: 5, textTransform: 'uppercase', fontSize: 11 }}
        >
          {t('betaStatus')}
        </sup>
      </Typography>
    </TooltipTS>
  );
}

export function ProLabel() {
  const { t } = useTranslation();
  return (
    !Pro && (
      <TooltipTS title={t('thisFunctionalityIsAvailableInPro')}>
        <Typography sx={{ display: 'initial' }}>
          <sup style={{ marginLeft: 5, fontSize: 11 }}>PRO</sup>
        </Typography>
      </TooltipTS>
    )
  );
}

export function ProSign() {
  const { t } = useTranslation();
  return (
    !Pro && (
      <TooltipTS title={t('thisFunctionalityIsAvailableInPro')}>
        <Typography sx={{ display: 'initial' }}>
          <sup
            style={{
              fontSize: 10,
              borderRadius: 8,
              backgroundColor: '#1dd19f',
              padding: '3px 5px',
            }}
          >
            PRO
          </sup>
        </Typography>
      </TooltipTS>
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
    <TooltipTS
      arrow
      placement={tooltipPlacement}
      title={Pro ? proTooltip : noProTooltip}
    >
      <div style={{ display: 'flex' }} children={children}></div>
    </TooltipTS>
  );
}
