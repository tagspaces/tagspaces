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
import { useDispatch, useSelector } from 'react-redux';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Tooltip from '-/components/Tooltip';
import AppConfig from '-/AppConfig';
import { Pro } from '../pro';
import TextLogoIcon from '-/assets/images/text-logo.svg';
import LogoIcon from '-/assets/images/icon100x100.svg';
import versionMeta from '../version.json';
import { actions, isUpdateAvailable } from '-/reducers/app';
import { useTranslation } from 'react-i18next';
import { Badge, Typography } from '@mui/material';
import { useAboutDialogContext } from '-/components/dialogs/hooks/useAboutDialogContext';

function CustomLogo() {
  const { t } = useTranslation();
  const { openAboutDialog } = useAboutDialogContext();
  const updateAvailable = useSelector(isUpdateAvailable);
  const tsType = Pro ? 'PRO' : 'LITE';

  const logo = useMemo(() => {
    let customLogo = TextLogoIcon;
    // if (AppConfig.isWeb) {
    //   customLogo = WebLogoIcon;
    // }
    if (AppConfig.customLogo) {
      customLogo = AppConfig.customLogo;
    }
    return customLogo;
  }, []);

  return (
    <div
      onClick={() => openAboutDialog()}
      style={{
        width: '100%',
        textAlign: 'center',
        // @ts-ignore
        WebkitAppRegion: 'drag',
      }}
    >
      <Tooltip title={t('core:aboutTitle')}>
        <IconButton style={{ padding: 0 }}>
          <img
            style={{
              width: 30,
              height: 30,
              // @ts-ignore
              WebkitAppRegion: 'no-drag',
            }}
            src={LogoIcon}
            alt="TagSpaces Logo"
          />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('core:aboutTitle')}>
        <IconButton
          style={{ height: 47, padding: 0 }}
          data-tid="aboutTagSpaces"
        >
          <img
            style={{
              maxHeight: 26,
              maxWidth: 200,
              // @ts-ignore
              WebkitAppRegion: 'no-drag',
            }}
            src={logo}
            alt="TagSpaces"
          />
        </IconButton>
      </Tooltip>
      <sup>
        <Tooltip title={updateAvailable ? t('core:newVersionAvailable') : ''}>
          <Badge
            color="secondary"
            variant="dot"
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            invisible={!updateAvailable}
            style={{
              // @ts-ignore
              WebkitAppRegion: 'no-drag',
            }}
          >
            <Typography
              style={{
                display: 'inline',
                fontSize: '10px',
                marginLeft: 3,
                lineHeight: '16px',
              }}
            >
              {'v' + versionMeta.version}
            </Typography>
          </Badge>
        </Tooltip>
      </sup>
      <sub>
        <Typography
          style={{
            display: 'inline',
            fontSize: '10px',
            marginLeft: -25,
            lineHeight: '40px',
            // @ts-ignore
            WebkitAppRegion: 'no-drag',
          }}
        >
          {tsType}
        </Typography>
      </sub>
    </div>
  );
}

export default CustomLogo;
