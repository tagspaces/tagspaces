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
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import Dialog from '@material-ui/core/Dialog';
import semver from 'semver';
import LogoIcon from '-/assets/images/icon100x100.svg';
import i18n from '-/services/i18n';
import versionMeta from '-/version.json';
import { Pro } from '-/pro';
import { getLastVersionPromise } from '-/reducers/settings';
import AppConfig from '-/config';

interface Props {
  open: boolean;
  fullScreen: boolean;
  openURLExternally: (url: string) => void;
  toggleLicenseDialog: () => void;
  toggleThirdPartyLibsDialog: () => void;
  onClose: () => void;
}

let buildID = versionMeta.commitId;
if (buildID && buildID.length >= 11) {
  buildID = buildID.slice(0, 11);
}

const productName = versionMeta.name + (Pro ? ' Pro' : '');
document.title = productName + ' ' + versionMeta.version;

const AboutDialog = (props: Props) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [newVersion, setNewVersion] = useState('');
  const { open, onClose, fullScreen } = props;

  function checkForUpdates() {
    if (updateAvailable) {
      props.openURLExternally(AppConfig.links.downloadURL);
    } else {
      getLastVersionPromise()
        .then(lastVersion => {
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
        .catch(error => {
          console.warn('Error while checking for update: ' + error);
        });
    }
  }

  // function confirmFunction(event) {
  //   if (event.key === 'Enter' || event.keyCode === 13) {
  //     props.onClose();
  //     event.stopPropagation();
  //   }
  // }

  let versionInfo = 'Check for updates';
  if (newVersion && newVersion.length > 1) {
    if (updateAvailable) {
      versionInfo = i18n.t('getNewVersion', { newVersion });
    } else {
      versionInfo = i18n.t('latestVersion', { productName });
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      keepMounted
      scroll="paper"
      // onKeyDown={confirmFunction}
    >
      <DialogTitle>{productName}</DialogTitle>
      <DialogContent>
        <img
          alt="TagSpaces logo"
          src={LogoIcon}
          style={{ float: 'left', marginRight: 10, width: 120, height: 120 }}
        />
        <Typography
          variant="subtitle1"
          title={
            'Build on: ' +
            versionMeta.buildTime +
            '\nPlatform: ' +
            navigator.appVersion
          }
        >
          Version:&nbsp;
          {versionMeta.version}
          &nbsp;BuildID:&nbsp;
          {buildID}
        </Typography>
        <br />
        <Typography id="aboutContent" variant="body1">
          <strong>
            {productName}
            &nbsp;
          </strong>
          is made possible by the TagSpaces(github.com/tagspaces) open source
          project and other
          <Button
            size="small"
            color="primary"
            style={{ marginLeft: 10 }}
            onClick={props.toggleThirdPartyLibsDialog}
          >
            open source software
          </Button>
          .
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
          <Button
            size="small"
            color="primary"
            onClick={() => {
              props.openURLExternally(AppConfig.links.imprintURL);
            }}
          >
            Imprint
          </Button>
          <Button
            size="small"
            color="primary"
            onClick={() => {
              props.openURLExternally(AppConfig.links.privacyURL);
            }}
          >
            Privacy Policy
          </Button>
          <Button
            size="small"
            color="primary"
            onClick={() => {
              props.openURLExternally(AppConfig.links.changelogURL);
            }}
          >
            Changelog
          </Button>
          <Button
            size="small"
            color="primary"
            data-tid="openLicenseDialog"
            onClick={props.toggleLicenseDialog}
          >
            License Agreement
          </Button>
        </Typography>
      </DialogContent>
      <DialogActions>
        {!Pro && (
          <Button
            data-tid="checkForUpdates"
            title={i18n.t('core:checkForNewVersion')}
            onClick={() => {
              props.openURLExternally(AppConfig.links.productsOverview);
            }}
            color="primary"
          >
            Upgrade to PRO
          </Button>
        )}
        <Button
          data-tid="checkForUpdates"
          title={i18n.t('core:checkForNewVersion')}
          onClick={checkForUpdates}
          color="primary"
        >
          {versionInfo}
        </Button>
        {/* <Button
        data-tid="openLicenseDialog"
        onClick={this.props.toggleLicenseDialog}
      >
        {i18n.t('core:license')}
      </Button>
      <Button
        data-tid="openThirdPartyLibsDialog"
        onClick={this.props.toggleThirdPartyLibsDialog}
      >
        {i18n.t('core:thirdPartyLibs')}
      </Button> */}
        <Button
          data-tid="closeAboutDialog"
          onClick={props.onClose}
          color="primary"
        >
          {i18n.t('core:ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withMobileDialog()(AboutDialog);
