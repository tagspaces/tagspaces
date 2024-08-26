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

import React from 'react';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { Pro } from '-/pro';
import LicenseContent from '-/LICENSE.txt';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';
import { quitApp } from '-/services/utils-io';

// import DialogCloseButton from '-/components/dialogs/DialogCloseButton';

interface Props {
  open: boolean;
  onClose: () => void;
}

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

function LicenseDialog(props: Props) {
  const { open, onClose } = props;
  const { t } = useTranslation();
  // let licenseElement;
  // function printLicense() {
  //   // printElem(licenseElement);
  //   window.print();
  // }

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      disableEscapeKeyDown
      fullScreen={fullScreen}
      scroll="paper"
    >
      <DialogTitle>{t('core:license')}</DialogTitle>
      <DialogContent
        // inputRef={ref => {
        //   licenseElement = ref;
        // }}
        style={{ overflow: 'auto' }}
      >
        <pre style={{ whiteSpace: 'pre-wrap', userSelect: 'text' }}>
          {Pro ? Pro.EULAContent : LicenseContent}
        </pre>
      </DialogContent>
      <DialogActions
        style={fullScreen ? { padding: '10px 30px 30px 30px' } : {}}
      >
        {/* <Button
          onClick={printLicense}
          color="primary"
        >
          {t('core:print')}
        </Button> */}
        <Button
          data-tid="confirmLicenseDialog"
          onClick={quitApp}
          color="primary"
        >
          {t('core:quit')}
        </Button>
        <Button
          data-tid="agreeLicenseDialog"
          onClick={props.onClose}
          color="primary"
          variant="contained"
        >
          {t('core:agreeLicense')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default LicenseDialog;
