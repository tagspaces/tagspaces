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

import LicenseContent from '-/LICENSE.txt';
import TsButton from '-/components/TsButton';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import { Pro } from '-/pro';
import { quitApp } from '-/services/utils-io';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';

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
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      disableEscapeKeyDown
      fullScreen={smallScreen}
      scroll="paper"
    >
      <DialogTitle>{t('core:license')}</DialogTitle>
      <DialogContent
        // inputRef={ref => {
        //   licenseElement = ref;
        // }}
        sx={{ overflow: 'auto' }}
      >
        <pre style={{ whiteSpace: 'pre-wrap', userSelect: 'text' }}>
          {Pro ? Pro.EULAContent : LicenseContent}
        </pre>
      </DialogContent>
      <TsDialogActions>
        {/* <TsButton
          onClick={printLicense}
        >
          {t('core:print')}
        </TsButton> */}
        <TsButton data-tid="confirmLicenseDialog" onClick={quitApp}>
          {t('core:quit')}
        </TsButton>
        <TsButton
          data-tid="agreeLicenseDialog"
          onClick={props.onClose}
          variant="contained"
        >
          {t('core:agreeLicense')}
        </TsButton>
      </TsDialogActions>
    </Dialog>
  );
}

export default LicenseDialog;
