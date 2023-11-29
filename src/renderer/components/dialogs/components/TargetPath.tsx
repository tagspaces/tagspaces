/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
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
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { InfoIcon } from '-/components/CommonIcons';
import { useTargetPathContext } from '-/components/dialogs/hooks/useTargetPathContext';
import { useTranslation } from 'react-i18next';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';

function TargetPath() {
  const { t } = useTranslation();
  const { currentLocation } = useCurrentLocationContext();
  const { targetDirectoryPath } = useTargetPathContext();

  return (
    <Grid item style={{ marginTop: 20 }} xs={12}>
      {targetDirectoryPath ? (
        <Typography
          style={{ display: 'flex', alignItems: 'center' }}
          variant="caption"
        >
          <InfoIcon style={{ paddingRight: 10 }} />
          {t('core:entriesWillBeCreatedIn') +
            ' ' +
            (currentLocation ? currentLocation.name : '') +
            ' ' +
            targetDirectoryPath}
        </Typography>
      ) : (
        <Typography variant="caption">{t('noSuitableLocation')}</Typography>
      )}
    </Grid>
  );
}

export default TargetPath;
