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

import React, { useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import IconButton from '@mui/material/IconButton';
import Badge, { badgeClasses } from '@mui/material/Badge';
import Tooltip from '-/components/Tooltip';
import AppConfig from '-/AppConfig';
import { Pro } from '../pro';
import TextLogoIcon from '../assets/images/text-logo.svg';
import WebLogoIcon from '../assets/images/text-logo-web.svg';
import LogoIcon from '../assets/images/icon100x100.svg';
import versionMeta from '../version.json';
import { getCurrentLanguage } from '-/reducers/settings';
import { actions } from '-/reducers/app';
import { useTranslation } from 'react-i18next';

const StyledAppVersionBadge = styled(Badge)(({ theme }) => ({
  [`& .${badgeClasses.badge}`]: {
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
}));

function CustomLogo() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const language = useSelector(getCurrentLanguage);

  const logo = useMemo(() => {
    let customLogo = Pro ? Pro.TextLogoIcon : TextLogoIcon;
    if (AppConfig.isWeb) {
      customLogo = WebLogoIcon;
    }
    if (AppConfig.customLogo) {
      customLogo = AppConfig.customLogo;
    }
    return customLogo;
  }, []);

  return (
    <StyledAppVersionBadge
      badgeContent={'v' + versionMeta.version}
      color="primary"
    >
      <Tooltip title={t('core:aboutTitle')}>
        <IconButton
          onClick={() => dispatch(actions.toggleAboutDialog())}
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
      <Tooltip title={t('core:aboutTitle')}>
        <IconButton
          style={{ height: 50, padding: 0, marginBottom: 15 }}
          data-tid="aboutTagSpaces"
          onClick={() => dispatch(actions.toggleAboutDialog())}
        >
          <img
            style={{ maxHeight: 50, maxWidth: 200 }}
            src={logo}
            alt="TagSpaces"
          />
        </IconButton>
      </Tooltip>
    </StyledAppVersionBadge>
  );
}

export default CustomLogo;
