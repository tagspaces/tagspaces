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

import AppConfig from '-/AppConfig';
import LogoIcon from '-/assets/images/icon100x100.svg';
import TextLogoIcon from '-/assets/images/text-logo.svg';
import Tooltip from '-/components/Tooltip';
import TsIconButton from '-/components/TsIconButton';
import { useAboutDialogContext } from '-/components/dialogs/hooks/useAboutDialogContext';
import { isUpdateAvailable } from '-/reducers/app';
import { Badge, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Pro } from '../pro';
import versionMeta from '../version.json';

function CustomLogo() {
  const { t } = useTranslation();
  const { openAboutDialog } = useAboutDialogContext();
  const updateAvailable = useSelector(isUpdateAvailable);
  const tsType = Pro ? 'PRO' : 'LITE';
  const tsAboutTitle =
    versionMeta.name + ' ' + tsType + ' ' + versionMeta.version;

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
      <Tooltip
        title={updateAvailable ? t('core:newVersionAvailable') : tsAboutTitle}
        placeCloser
      >
        <Badge
          color="secondary"
          variant="dot"
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          invisible={!updateAvailable}
          style={
            {
              marginTop: 7,
              WebkitAppRegion: 'no-drag',
            } as React.CSSProperties & { WebkitAppRegion?: string }
          }
        >
          {AppConfig.showTSLogo && (
            <TsIconButton
              //tooltip={tsAboutTitle}
              style={{ padding: 0, marginTop: -5, height: 40 }}
            >
              <img
                style={
                  {
                    width: 30,
                    height: 30,
                    WebkitAppRegion: 'no-drag',
                  } as React.CSSProperties & { WebkitAppRegion?: string }
                }
                src={LogoIcon}
                alt="TagSpaces Logo"
              />
            </TsIconButton>
          )}
          <TsIconButton
            // tooltip={tsAboutTitle}
            style={{ height: 40, padding: 0, marginTop: -5 }}
            data-tid="aboutTagSpaces"
          >
            <img
              style={
                {
                  maxHeight: 26,
                  maxWidth: 200,
                  WebkitAppRegion: 'no-drag',
                } as React.CSSProperties & { WebkitAppRegion?: string }
              }
              src={logo}
              alt="Application Logo"
            />
          </TsIconButton>
          {AppConfig.showTSVersion && (
            <>
              <sup>
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
              </sup>
              <sub>
                <Typography
                  style={
                    {
                      display: 'inline',
                      fontSize: '10px',
                      marginLeft: -25,
                      lineHeight: '40px',
                      WebkitAppRegion: 'no-drag',
                    } as React.CSSProperties & { WebkitAppRegion?: string }
                  }
                >
                  {tsType}
                </Typography>
              </sub>
            </>
          )}
        </Badge>
      </Tooltip>
    </div>
  );
}

export default CustomLogo;
