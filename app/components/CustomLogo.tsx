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
import IconButton from '@mui/material/IconButton';
import withStyles from '@mui/styles/withStyles';
import Badge from '@mui/material/Badge';
import Tooltip from '-/components/Tooltip';
import AppConfig from '-/AppConfig';
import { Pro } from '../pro';
import TextLogoIcon from '../assets/images/text-logo.svg';
import WebLogoIcon from '../assets/images/text-logo-web.svg';
import LogoIcon from '../assets/images/icon100x100.svg';
import { actions as AppActions } from '../reducers/app';
import i18n from '../services/i18n';
import versionMeta from '../version.json';
import { getCurrentLanguage } from '-/reducers/settings';

const AppVersionBadge = withStyles(theme => ({
  badge: {
    top: '25%',
    right: -25,
    color:
      theme.palette.mode === 'light'
        ? theme.palette.grey[900]
        : theme.palette.grey[200],
    backgroundColor:
      theme.palette.mode === 'light'
        ? theme.palette.grey[200]
        : theme.palette.grey[900]
  }
}))(Badge);

interface Props {
  toggleAboutDialog: () => void;
}

let logo = Pro ? Pro.TextLogoIcon : TextLogoIcon;
if (AppConfig.isWeb) {
  logo = WebLogoIcon;
}
if (AppConfig.customLogo) {
  logo = AppConfig.customLogo;
}

function CustomLogo(props: Props) {
  return (
    <AppVersionBadge badgeContent={'v' + versionMeta.version} color="primary">
      <Tooltip title={i18n.t('core:aboutTitle')}>
        <IconButton
          onClick={props.toggleAboutDialog}
          style={{ padding: 0, paddingLeft: 5, height: 50 }}
        >
          <img
            style={{
              width: 40
            }}
            src={LogoIcon}
            alt="TagSpaces Logo"
          />
        </IconButton>
      </Tooltip>
      <Tooltip title={i18n.t('core:aboutTitle')}>
        <IconButton
          style={{ height: 50, padding: 0, marginBottom: 15 }}
          data-tid="aboutTagSpaces"
          onClick={props.toggleAboutDialog}
        >
          <img
            style={{ maxHeight: 50, maxWidth: 200 }}
            src={logo}
            alt="TagSpaces"
          />
        </IconButton>
      </Tooltip>
    </AppVersionBadge>
  );
}

function mapStateToProps(state) {
  return { language: getCurrentLanguage(state) };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      toggleAboutDialog: AppActions.toggleAboutDialog
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapActionCreatorsToProps)(CustomLogo);
