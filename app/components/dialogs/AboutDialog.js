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
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  withMobileDialog
} from 'material-ui/Dialog';
import marked from 'marked';
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

const aboutMDContent = `
Copyright &copy; 2015-2018 TagSpaces UG (haftungsbeschraenkt). All rights reserved.

${productName} is made possible by the [TagSpaces](https://github.com/tagspaces/tagspaces) open source project
and other [open source software](THIRD-PARTY.txt).

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License (version 3) as
published by the Free Software Foundation.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

[Imprint](https://www.tagspaces.org/about/imprint/)&nbsp;&nbsp;&nbsp;&nbsp;[Privacy Policy](https://www.tagspaces.org/about/privacy/)&nbsp;&nbsp;&nbsp;&nbsp;[Changelog](https://www.tagspaces.org/whatsnew/)
`;

class AboutDialog extends React.Component<Props, State> {
  state = {
    updateAvailable: false,
    newVersion: ''
  }

  componentDidMount() {
    const links = document.querySelectorAll('#aboutContent a');
    links.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        console.log(event.currentTarget.href);

        // TODO evtl. use openFileNatively from app.js
        PlatformIO.openUrl(event.currentTarget.href);
      }, false);
    });
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
    <DialogContent style={{ overflowY: 'overlay' }}>
      <img
        alt="TagSpaces logo"
        src={LogoIcon}
        style={{ float: 'left', marginRight: 10, width: 120, height: 120 }}
      />
      <Typography variant="subheading" title={'Build on: ' + versionMeta.buildTime}>Version: {versionMeta.version} / BuildID: {buildID}</Typography>
      <br />
      <Typography
        id="aboutContent"
        variant="body2"
        dangerouslySetInnerHTML={{ __html: marked(aboutMDContent) }}
      />
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
        >
          {versionInfo}
        </Button>
        <Button
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
        </Button>
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
    return (
      <GenericDialog
        open={this.props.open}
        onClose={this.props.onClose}
        renderTitle={this.renderTitle}
        renderContent={this.renderContent}
        renderActions={this.renderActions}
      />
    );
  }
}

export default withMobileDialog()(AboutDialog);
