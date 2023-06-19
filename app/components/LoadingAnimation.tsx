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
import withStyles from '@mui/styles/withStyles';
import PlatformIO from '-/services/platform-facade';
import { isLoading } from '-/reducers/app';

interface Props {
  theme: any;
}

function LoadingAnimation(props: Props) {
  const { theme } = props;
  const loading = useSelector(isLoading);

  if (
    !loading ||
    !(PlatformIO.haveObjectStoreSupport() && PlatformIO.haveWebDavSupport())
  ) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 1000,
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backdropFilter: 'grayscale(1)'
      }}
    >
      <div className="lds-ellipsis">
        <div style={{ backgroundColor: theme.palette.primary.main }} />
        <div style={{ backgroundColor: theme.palette.primary.main }} />
        <div style={{ backgroundColor: theme.palette.primary.main }} />
        <div style={{ backgroundColor: theme.palette.primary.main }} />
      </div>
    </div>
  );
}

export default withStyles(undefined, { withTheme: true })(
  React.memo(LoadingAnimation)
);
