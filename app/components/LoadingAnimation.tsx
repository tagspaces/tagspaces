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
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import PlatformIO from '-/services/platform-facade';
import { isLoading } from '-/reducers/app';

interface Props {
  theme: any;
  loading: boolean;
}

function LoadingAnimation(props: Props) {
  const { theme, loading } = props;

  if (!loading || !PlatformIO.haveObjectStoreSupport()) {
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
        // backdropFilter: 'blur(2px)',
        // backgroundColor: '#fafafa33' // red: '#eb585882' '#d9d9d980'
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

function mapStateToProps(state) {
  return {
    loading: isLoading(state)
  };
}

const areEqual = (prevProp: Props, nextProp: Props) =>
  nextProp.loading === prevProp.loading;

export default connect(mapStateToProps)(
  withStyles(undefined, { withTheme: true })(
    React.memo(LoadingAnimation, areEqual)
  )
);
