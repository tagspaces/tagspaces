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

import { InfoIcon } from '-/components/CommonIcons';
import { useTargetPathContext } from '-/components/dialogs/hooks/useTargetPathContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import { useTranslation } from 'react-i18next';

function TargetPath() {
  const { t } = useTranslation();
  const { findLocation } = useCurrentLocationContext();
  const { targetDirectoryPath } = useTargetPathContext();
  const currentLocation = findLocation();

  return (
    <Grid container style={{ marginTop: '20px' }}>
      {targetDirectoryPath ? (
        <Typography
          sx={{ display: 'flex', alignItems: 'center' }}
          variant="caption"
        >
          <InfoIcon sx={{ paddingRight: '10px' }} />
          {t('core:entriesWillBeCreatedIn') +
            ' ' +
            (currentLocation?.type === locationType.TYPE_CLOUD
              ? currentLocation.name + '/'
              : '') +
            targetDirectoryPath}
        </Typography>
      ) : (
        <Typography variant="caption">{t('noSuitableLocation')}</Typography>
      )}
    </Grid>
  );
}

export default TargetPath;
