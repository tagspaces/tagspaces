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
import { useSelector } from 'react-redux';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import i18n from '-/services/i18n';
import { getCurrentLocation } from '-/reducers/locations';
import { InfoIcon } from '-/components/CommonIcons';
import { useTargetPathContext } from '-/components/dialogs/hooks/useTargetPathContext';

function TargetPath() {
  const currentLocation = useSelector(getCurrentLocation);
  const { targetDirectoryPath } = useTargetPathContext();

  return (
    <Grid item style={{ marginTop: 20 }} xs={12}>
      {targetDirectoryPath ? (
        <Typography
          style={{ display: 'flex', alignItems: 'center' }}
          variant="caption"
        >
          <InfoIcon style={{ paddingRight: 10 }} />
          {i18n.t('core:entriesWillBeCreatedIn') +
            ' ' +
            (currentLocation ? currentLocation.name : '') +
            ' ' +
            targetDirectoryPath}
        </Typography>
      ) : (
        <Typography variant="caption">
          {i18n.t('noSuitableLocation')}
        </Typography>
      )}
    </Grid>
  );
}

export default TargetPath;
