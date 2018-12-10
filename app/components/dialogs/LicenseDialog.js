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
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import GenericDialog, { onEnterKeyHandler } from './GenericDialog';
import i18n from '../../services/i18n';
import { loadFileContentPromise } from '../../services/utils-io';
import { Pro } from '../../pro';

const licenseUrl = Pro ? './node_modules/@tagspaces/pro/EULA.txt' : './LICENSE.txt';

type Props = {
  open: boolean,
  fullScreen: boolean,
  onClose: () => void
};

type State = {
  license?: string
};

function printElem(elem) {
  const printWin = window.open('', 'PRINT', 'height=400,width=600');
  printWin.document.write('<html><head><title>License Agreement</title>');
  printWin.document.write('</head><body >');
  printWin.document.write(document.getElementById(elem).innerHTML);
  printWin.document.write('</body></html>');
  printWin.document.close(); // necessary for IE >= 10
  printWin.focus(); // necessary for IE >= 10*/
  printWin.print();
  printWin.close();
  return true;
}

class LicenseDialog extends React.Component<Props, State> {
  state = {
    license: ''
  };

  componentWillMount() {
    loadFileContentPromise(licenseUrl, 'text').then(
      (result) => {
        this.setState({
          license: result
        });
        return true;
      }
    ).catch((err) => {
      console.log('Error loading license file ' + err);
    });
  }

  licenseElement;

  printLicense = () => {
    printElem(this.licenseElement);
  }

  renderTitle = () => <DialogTitle>{i18n.t('core:license')}</DialogTitle>;

  renderContent = () => (
    <DialogContent style={{ overflowY: 'visible', overflowX: 'auto' }}>
      <pre
        inputRef={(ref) => { this.licenseElement = ref; }}
        style={{ whiteSpace: 'pre-wrap' }}
      >
        { this.state.license }
      </pre>
    </DialogContent>
  );

  renderActions = () => (
    <DialogActions>
      {/* <Button
        onClick={this.printLicense}
        color="primary"
      >
        {i18n.t('core:print')}
      </Button> */}
      <Button
        data-tid="confirmLicenseDialog"
        onClick={this.props.onClose}
        color="primary"
      >
        {i18n.t('core:ok')}
      </Button>
    </DialogActions>
  );

  render() {
    const {
      fullScreen,
      open,
      onClose
    } = this.props;
    return (
      <GenericDialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        renderTitle={this.renderTitle}
        renderContent={this.renderContent}
        renderActions={this.renderActions}
      />
    );
  }
}

export default withMobileDialog()(LicenseDialog);
