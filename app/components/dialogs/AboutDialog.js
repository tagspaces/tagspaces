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
 * @flow
 */

import React from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import semver from 'semver';
import GenericDialog from './GenericDialog';
import LogoIcon from '../../assets/images/icon100x100.svg';
import i18n from '../../services/i18n';
import versionMeta from '../../version.json';
import PlatformIO from '../../services/platform-io';
import { Pro } from '../../pro';
import { getLastVersionPromise } from '../../reducers/settings';
import AppConfig from '../../config';

type Props = {
  open: boolean,
  fullScreen: boolean,
  toggleLicenseDialog: () => void,
  toggleThirdPartyLibsDialog: () => void,
  onClose: () => void
};

type State = {
  updateAvailable?: boolean,
  newVersion?: string
};

let buildID = versionMeta.commitId;
if (buildID && buildID.length >= 11) {
  buildID = buildID.slice(0, 11);
}

const productName = versionMeta.name + (Pro ? ' Pro' : '');
document.title = productName + ' ' + versionMeta.version;

class AboutDialog extends React.Component<Props, State> {
  state = {
    updateAvailable: false,
    newVersion: ''
  }

  checkForUpdates = () => {
    if (this.state.updateAvailable) {
      PlatformIO.openUrl(AppConfig.downloadURL);
    } else {
      getLastVersionPromise().then((lastVersion) => {
        console.log('Last version on server: ' + lastVersion);
        const cleanedLastVersion = semver.coerce(lastVersion);
        // const cleanedCurrentVersion = '3.0.2'
        const cleanedCurrentVersion = semver.coerce(versionMeta.version);
        if (semver.valid(cleanedLastVersion) && semver.gt(cleanedLastVersion, cleanedCurrentVersion)) {
          this.setState({
            updateAvailable: true,
            newVersion: cleanedLastVersion.version
          });
        }
        // this.setState({ newVersion: '3.0.1' });
        return true;
      })
        .catch(error => {
          console.warn('Error while checking for update: ' + error);
        });
    }
  }

  renderTitle = () => <DialogTitle>{productName}</DialogTitle>;

  renderContent = () => (
    <DialogContent>
      <img
        alt="TagSpaces logo"
        src={LogoIcon}
        style={{ float: 'left', marginRight: 10, width: 120, height: 120 }}
      />
      <Typography variant="subtitle1" title={'Build on: ' + versionMeta.buildTime}>Version: {versionMeta.version} / BuildID: {buildID}</Typography>
      <br />
      <Typography
        id="aboutContent"
        variant="body1"
      >
        <strong>{productName}</strong> is made possible by the TagSpaces(github.com/tagspaces) open source project
        and other <Button onClick={this.props.toggleThirdPartyLibsDialog}>open source software</Button>.
        <br />
        {!Pro && (<span>This program is free software: you can redistribute it and/or modify
        it under the terms of the GNU Affero General Public License (version 3) as
        published by the Free Software Foundation.</span>)}
        <br />
        This program is distributed in the hope that it will be useful,
        but WITHOUT ANY WARRANTY; without even the implied warranty of
        MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
        License for more details.
        <br /><br />
        <Button
          onClick={() => { PlatformIO.openUrl('https://www.tagspaces.org/about/imprint/'); }}
        >
          Imprint
        </Button>
        <Button
          onClick={() => { PlatformIO.openUrl('https://www.tagspaces.org/about/privacy/'); }}
        >
          Privacy Policy
        </Button>
        <Button
          onClick={() => { PlatformIO.openUrl('https://www.tagspaces.org/whatsnew/'); }}
        >
          Changelog
        </Button>
        <Button
          data-tid="openLicenseDialog"
          onClick={this.props.toggleLicenseDialog}
        >
          License Agreement
        </Button>
      </Typography>
    </DialogContent>
  );

  renderActions = () => {
    let versionInfo = 'Check for updates';
    if (this.state.newVersion.length > 1) {
      if (this.state.updateAvailable) {
        versionInfo = i18n.t('getNewVersion', { newVersion: this.state.newVersion });
      } else {
        versionInfo = i18n.t('latestVersion', { productName });
      }
    }

    return (
      <DialogActions>
        <Button
          data-tid="checkForUpdates"
          title={i18n.t('core:checkForNewVersion')}
          onClick={this.checkForUpdates}
          color="primary"
        >
          {versionInfo}
        </Button>
        { /* <Button
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
        </Button> */ }
        <Button
          data-tid="closeAboutDialog"
          onClick={this.props.onClose}
          color="primary"
        >
          {i18n.t('core:ok')}
        </Button>
      </DialogActions>
    );
  };

  render() {
    const {
      fullScreen,
      open,
      onClose
    } = this.props;
    return (
      <GenericDialog
        fullScreen={fullScreen}
        open={open}
        onClose={onClose}
        renderTitle={this.renderTitle}
        renderContent={this.renderContent}
        renderActions={this.renderActions}
      />
    );
  }
}

export default withMobileDialog()(AboutDialog);
