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

import React, { useState } from 'react';
import TsButton from '-/components/TsButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import DialogContent from '@mui/material/DialogContent';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import Tooltip from '-/components/Tooltip';
import semver from 'semver';
import DraggablePaper from '-/components/DraggablePaper';
import LogoIcon from '-/assets/images/icon100x100.svg';
import versionMeta from '-/version.json';
import { Pro } from '-/pro';
import { getLastVersionPromise } from '-/reducers/settings';
import Links from 'assets/links';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import AppConfig from '-/AppConfig';
import { openURLExternally } from '-/services/utils-io';
import { useTranslation } from 'react-i18next';
import { useLicenseDialogContext } from '-/components/dialogs/hooks/useLicenseDialogContext';
import { useThirdPartyLibsDialogContext } from '-/components/dialogs/hooks/useThirdPartyLibsDialogContext';
import TranslucentDialog from './TranslucentDialog';

interface Props {
  open: boolean;
  onClose: () => void;
}

let buildID = versionMeta.commitId;
if (buildID && buildID.length >= 11) {
  buildID = buildID.slice(0, 11);
}

const productName = versionMeta.name + (Pro ? ' Pro' : '');
document.title = productName + ' ' + versionMeta.version;

function AboutDialog(props: Props) {
  const { t } = useTranslation();
  const { openLicenseDialog } = useLicenseDialogContext();
  const { openThirdPartyLibsDialog } = useThirdPartyLibsDialogContext();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [newVersion, setNewVersion] = useState('');
  const { open, onClose } = props;

  function checkForUpdates() {
    if (updateAvailable) {
      openURLExternally(Links.links.downloadURL, true);
    } else {
      getLastVersionPromise()
        .then((lastVersion) => {
          console.log('Last version on server: ' + lastVersion);
          const cleanedLastVersion = semver.coerce(lastVersion);
          // const cleanedCurrentVersion = '3.0.2'
          const cleanedCurrentVersion = semver.coerce(versionMeta.version);
          if (
            semver.valid(cleanedLastVersion) &&
            semver.gt(cleanedLastVersion, cleanedCurrentVersion)
          ) {
            setUpdateAvailable(true);
            setNewVersion(cleanedLastVersion.version);
          } else {
            setNewVersion(versionMeta.version);
          }
          return true;
        })
        .catch((error) => {
          console.log('Error while checking for update: ' + error);
        });
    }
  }

  let versionInfo = 'Check for updates';
  if (newVersion && newVersion.length > 1) {
    if (updateAvailable) {
      versionInfo = t('getNewVersion', { newVersion });
    } else {
      versionInfo = t('latestVersion', { productName });
    }
  }

  let privacyURL = Links.links.privacyURL;
  if (AppConfig.isWeb) {
    privacyURL = '';
  }
  if (window.ExtPrivacyURL) {
    privacyURL = window.ExtPrivacyURL;
  }

  let imprintURL = Links.links.imprintURL;
  if (AppConfig.isWeb) {
    imprintURL = '';
  }
  if (window.ExtImprintURL) {
    imprintURL = window.ExtImprintURL;
  }

  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <TranslucentDialog
      open={open}
      onClose={onClose}
      fullScreen={smallScreen}
      keepMounted
      scroll="paper"
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      aria-labelledby="draggable-dialog-title"
    >
      <TsDialogTitle
        dialogTitle={productName}
        onClose={onClose}
        closeButtonTestId="closeAboutDialogTID"
      />
      <DialogContent style={{ overflowY: 'auto' }}>
        <img
          alt="TagSpaces logo"
          src={LogoIcon}
          style={{ float: 'left', marginRight: 10, width: 120, height: 120 }}
        />
        <Tooltip
          placement="top"
          title={
            'Build on: ' +
            versionMeta.buildTime +
            '\nPlatform: ' +
            navigator.userAgent
          }
        >
          <Typography variant="subtitle1">
            Version:&nbsp;
            {versionMeta.version}
            &nbsp;BuildID:&nbsp;
            {buildID}
          </Typography>
        </Tooltip>
        <br />
        <Typography id="aboutContent" variant="body1">
          <strong>
            {productName}
            &nbsp;
          </strong>
          is made possible by the TagSpaces project and other open source
          software listed in the:
          <p style={{ marginBottom: 5 }} />
          <TsButton onClick={() => openThirdPartyLibsDialog()}>
            Software Acknowledgements
          </TsButton>
          <br />
          {!Pro && (
            <span>
              This program is free software: you can redistribute it and/or
              modify it under the terms of the GNU Affero General Public License
              (version 3) as published by the Free Software Foundation.
            </span>
          )}
          <br />
          This program is distributed in the hope that it will be useful, but
          WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the License
          for more details.
          <br />
          <br />
          <div>
            {imprintURL && (
              <TsButton
                style={{ marginRight: 5 }}
                variant="text"
                onClick={() => {
                  openURLExternally(imprintURL, true);
                }}
              >
                Imprint
              </TsButton>
            )}
            {privacyURL && (
              <TsButton
                style={{ marginRight: 5 }}
                variant="text"
                onClick={() => {
                  openURLExternally(privacyURL, true);
                }}
              >
                Privacy Policy
              </TsButton>
            )}
            <TsButton
              style={{ marginRight: 5 }}
              variant="text"
              onClick={() => {
                openURLExternally(Links.links.changelogURL, true);
              }}
            >
              Changelog
            </TsButton>
            <TsButton
              style={{ marginRight: 5 }}
              variant="text"
              data-tid="openLicenseDialog"
              onClick={() => openLicenseDialog()}
            >
              {t('core:license')}
            </TsButton>
          </div>
        </Typography>
      </DialogContent>
      <TsDialogActions>
        {!Pro && (
          <TsButton
            data-tid="checkForUpdates"
            title={t('core:checkForNewVersion')}
            onClick={() => {
              openURLExternally(Links.links.productsOverview, true);
            }}
          >
            Upgrade to PRO
          </TsButton>
        )}
        <TsButton
          data-tid="checkForUpdates"
          title={t('core:checkForNewVersion')}
          onClick={checkForUpdates}
        >
          {versionInfo}
        </TsButton>
        {/* <TsButton
        data-tid="openLicenseDialog"
        onClick={this.props.toggleLicenseDialog}
      >
        {t('core:license')}
      </TsButton>
      <TsButton
        data-tid="openThirdPartyLibsDialog"
        onClick={this.props.toggleThirdPartyLibsDialog}
      >
        {t('core:thirdPartyLibs')}
      </TsButton> */}
        <TsButton
          data-tid="closeAboutDialog"
          onClick={onClose}
          variant="contained"
        >
          {t('core:ok')}
        </TsButton>
      </TsDialogActions>
    </TranslucentDialog>
  );
}

export default AboutDialog;
