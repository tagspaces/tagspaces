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
import DraggablePaper from '-/components/DraggablePaper';
import Tooltip from '-/components/Tooltip';
import TsButton from '-/components/TsButton';
import TranslucentDialog from '-/components/dialogs/components/TranslucentDialog';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { useLicenseDialogContext } from '-/components/dialogs/hooks/useLicenseDialogContext';
import { useThirdPartyLibsDialogContext } from '-/components/dialogs/hooks/useThirdPartyLibsDialogContext';
import { Pro } from '-/pro';
import { getLastVersionPromise } from '-/reducers/settings';
import { openURLExternally } from '-/services/utils-io';
import versionMeta from '-/version.json';
import DialogContent from '@mui/material/DialogContent';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Links from 'assets/links';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import semver from 'semver';

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
      <DialogContent sx={{ overflowY: 'auto' }}>
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
          <TsButton
            sx={{ marginTop: '5px' }}
            onClick={() => openThirdPartyLibsDialog()}
          >
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
          {imprintURL && (
            <TsButton
              sx={{ marginRight: AppConfig.defaultSpaceBetweenButtons }}
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
              sx={{ marginRight: AppConfig.defaultSpaceBetweenButtons }}
              variant="text"
              onClick={() => {
                openURLExternally(privacyURL, true);
              }}
            >
              Privacy Policy
            </TsButton>
          )}
          <TsButton
            sx={{ marginRight: AppConfig.defaultSpaceBetweenButtons }}
            variant="text"
            onClick={() => {
              openURLExternally(Links.links.changelogURL, true);
            }}
          >
            Changelog
          </TsButton>
          <TsButton
            sx={{ marginRight: AppConfig.defaultSpaceBetweenButtons }}
            variant="text"
            data-tid="openLicenseDialog"
            onClick={() => openLicenseDialog()}
          >
            {t('core:license')}
          </TsButton>
        </Typography>
      </DialogContent>
      <TsDialogActions style={{ justifyContent: 'space-between' }}>
        <span>
          {!Pro && (
            <TsButton
              data-tid="checkForUpdates"
              title={t('core:checkForNewVersion')}
              onClick={() => {
                openURLExternally(Links.links.productsOverview, true);
              }}
              sx={{ marginRight: AppConfig.defaultSpaceBetweenButtons }}
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
        </span>
        <TsButton
          data-tid="closeAboutDialog"
          variant="contained"
          onClick={onClose}
        >
          {t('core:ok')}
        </TsButton>
      </TsDialogActions>
    </TranslucentDialog>
  );
}

export default AboutDialog;
