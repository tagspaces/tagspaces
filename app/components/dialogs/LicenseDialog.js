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
import GenericDialog from './GenericDialog';
import i18n from '../../services/i18n';
import { Pro } from '../../pro';
import AppConfig from '../../config';
import LicenseContent from '../../LICENSE.txt';
import PlatformIO from '../../services/platform-io';

type Props = {
  open: boolean,
  fullScreen: boolean,
  onClose: () => void
};

// function printElem(elem) {
//   const printWin = window.open('', 'PRINT', 'height=400,width=600');
//   printWin.document.write('<html><head><title>License Agreement</title>');
//   printWin.document.write('</head><body >');
//   printWin.document.write(elem.innerHTML);
//   printWin.document.write('</body></html>');
//   printWin.document.close(); // necessary for IE >= 10
//   printWin.focus(); // necessary for IE >= 10*/
//   printWin.print();
//   printWin.close();
//   return true;
// }

const LicenseDialog = (props: Props) => {
  // let licenseElement;
  // function printLicense() {
  //   // printElem(licenseElement);
  //   window.print();
  // }

  function renderTitle() {
    return <DialogTitle>{i18n.t('core:license')}</DialogTitle>;
  }

  function renderContent() {
    return (
      <DialogContent
        // inputRef={ref => {
        //   licenseElement = ref;
        // }}
        style={{ overflow: AppConfig.isFirefox ? 'auto' : 'overlay' }}
      >
        <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: 'white', color: 'black' }} >
          {Pro ? Pro.EULAContent : LicenseContent}
        </pre>
      </DialogContent>
    );
  }

  function renderActions() {
    return (
      <DialogActions>
        {/* <Button
          onClick={printLicense}
          color="primary"
        >
          {i18n.t('core:print')}
        </Button> */}
        <Button
          data-tid="confirmLicenseDialog"
          onClick={PlatformIO.quitApp}
          color="primary"
        >
          {i18n.t('core:quit')}
        </Button>
        <Button
          data-tid="confirmLicenseDialog"
          onClick={props.onClose}
          color="primary"
        >
          {i18n.t('core:agreeLicense')}
        </Button>
      </DialogActions>
    );
  }

  const { fullScreen, open, onClose } = props;
  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      onBackdropClick={() => {}}
      fullScreen={fullScreen}
      renderTitle={renderTitle}
      renderContent={renderContent}
      renderActions={renderActions}
    />
  );
};

export default withMobileDialog()(LicenseDialog);
