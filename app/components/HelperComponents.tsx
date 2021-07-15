/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2021-present TagSpaces UG (haftungsbeschraenkt)
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

import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import i18n from '../services/i18n';
import { Pro } from '-/pro';

export const BetaLabel = () => (
  <Tooltip arrow placement="top" title={i18n.t('featureInBetaStatus')}>
    <Typography style={{ display: 'initial' }}>
      <sup style={{ marginLeft: 5 }}>BETA</sup>
    </Typography>
  </Tooltip>
);

export const ProLabel = () =>
  !Pro && (
    <Tooltip
      arrow
      placement="top"
      title={i18n.t('thisFunctionalityIsAvailableInPro')}
    >
      <Typography style={{ display: 'initial' }}>
        <sup style={{ marginLeft: 5 }}>PRO</sup>
      </Typography>
    </Tooltip>
  );

export const ProTooltip = props => {
  const { tooltip } = props;
  const proTooltip = tooltip && tooltip;
  const noProTooltip = tooltip
    ? tooltip + ' - ' + i18n.t('thisFunctionalityIsAvailableInPro')
    : i18n.t('thisFunctionalityIsAvailableInPro');
  return (
    <Tooltip arrow placement="top" title={Pro ? proTooltip : noProTooltip}>
      <span {...props} />
    </Tooltip>
  );
};
