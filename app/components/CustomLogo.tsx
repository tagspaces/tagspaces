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
import { bindActionCreators } from 'redux';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import Badge from '@material-ui/core/Badge';
import { Pro } from '../pro';
import TextLogoIcon from '../assets/images/text-logo.svg';
import { actions as AppActions } from '../reducers/app';
import versionMeta from '../version.json';

const AppVersionBadge = withStyles(theme => ({
  badge: {
    top: '25%',
    right: -15,
    color:
      theme.palette.type === 'light'
        ? theme.palette.grey[900]
        : theme.palette.grey[200],
    backgroundColor:
      theme.palette.type === 'light'
        ? theme.palette.grey[200]
        : theme.palette.grey[900]
  }
}))(Badge);

interface Props {
  toggleAboutDialog: () => void;
}

let logo = Pro ? Pro.TextLogoIcon : TextLogoIcon;
// logo = 'assets/images/custom-logo.svg';
const externalLogo = window.ExtLogoURL || false;
if (externalLogo) {
  logo = externalLogo;
}

const CustomLogo = (props: Props) => (
  <AppVersionBadge
    title="App Version"
    badgeContent={'v' + versionMeta.version}
    color="primary"
  >
    <IconButton
      style={{ height: 50, padding: 0, marginBottom: 15 }}
      data-tid="aboutTagSpaces"
      onClick={props.toggleAboutDialog}
    >
      <img style={{ maxHeight: 50 }} src={logo} alt="TagSpaces Logo" />
    </IconButton>
  </AppVersionBadge>
);

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      toggleAboutDialog: AppActions.toggleAboutDialog
    },
    dispatch
  );
}

export default connect(undefined, mapActionCreatorsToProps)(CustomLogo);
