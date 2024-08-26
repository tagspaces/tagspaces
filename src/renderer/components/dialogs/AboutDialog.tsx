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

import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Tooltip from '-/components/Tooltip';
import semver from 'semver';
import DraggablePaper from '-/components/DraggablePaper';
import LogoIcon from '-/assets/images/icon100x100.svg';
import versionMeta from '-/version.json';
import { Pro } from '-/pro';
import { getLastVersionPromise } from '-/reducers/settings';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
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
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <TranslucentDialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      keepMounted
      scroll="paper"
      PaperComponent={fullScreen ? Paper : DraggablePaper}
      aria-labelledby="draggable-dialog-title"
    >
      <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
        {productName}
        <DialogCloseButton testId="closeAboutDialogTID" onClose={onClose} />
      </DialogTitle>
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
          <br />
          <Button
            size="small"
            color="primary"
            style={{ marginLeft: -5 }}
            onClick={() => openThirdPartyLibsDialog()}
          >
            Software Acknowledgements
          </Button>
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
          {imprintURL && (
            <Button
              size="small"
              color="primary"
              onClick={() => {
                openURLExternally(imprintURL, true);
              }}
            >
              Imprint
            </Button>
          )}
          {privacyURL && (
            <Button
              size="small"
              color="primary"
              onClick={() => {
                openURLExternally(privacyURL, true);
              }}
            >
              Privacy Policy
            </Button>
          )}
          <Button
            size="small"
            color="primary"
            onClick={() => {
              openURLExternally(Links.links.changelogURL, true);
            }}
          >
            Changelog
          </Button>
          <Button
            size="small"
            color="primary"
            data-tid="openLicenseDialog"
            onClick={() => openLicenseDialog()}
          >
            License Agreement
          </Button>
        </Typography>
      </DialogContent>
      <DialogActions
        style={fullScreen ? { padding: '10px 30px 30px 30px' } : {}}
      >
        {!Pro && (
          <Button
            data-tid="checkForUpdates"
            title={t('core:checkForNewVersion')}
            onClick={() => {
              openURLExternally(Links.links.productsOverview, true);
            }}
            color="primary"
            // variant="outlined"
          >
            Upgrade to PRO
          </Button>
        )}
        <Button
          data-tid="checkForUpdates"
          title={t('core:checkForNewVersion')}
          onClick={checkForUpdates}
          // variant="outlined"
          color="primary"
        >
          {versionInfo}
        </Button>
        {/* <Button
        data-tid="openLicenseDialog"
        onClick={this.props.toggleLicenseDialog}
      >
        {t('core:license')}
      </Button>
      <Button
        data-tid="openThirdPartyLibsDialog"
        onClick={this.props.toggleThirdPartyLibsDialog}
      >
        {t('core:thirdPartyLibs')}
      </Button> */}
        <Button
          data-tid="closeAboutDialog"
          onClick={onClose}
          variant="contained"
          color="primary"
        >
          {t('core:ok')}
        </Button>
      </DialogActions>
    </TranslucentDialog>
  );
}

export default AboutDialog;
