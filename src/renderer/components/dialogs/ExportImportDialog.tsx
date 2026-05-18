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

import DraggablePaper from '-/components/DraggablePaper';
import ExportImportPanel from '-/components/dialogs/ExportImportPanel';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { TransferSection } from '-/services/export-import-utils';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  mode: 'export' | 'import';
  scope?: TransferSection;
  importFile?: File;
  onClose: () => void;
};

function ExportImportDialog(props: Props) {
  const { open, mode, scope, importFile, onClose } = props;
  const { t } = useTranslation();
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={smallScreen}
      keepMounted
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      scroll="paper"
    >
      <TsDialogTitle
        dialogTitle={
          mode === 'export'
            ? t('core:startExportButton')
            : t('core:startImportButton')
        }
        closeButtonTestId="closeExportImportTID"
        onClose={onClose}
      />
      <DialogContent sx={{ minWidth: smallScreen ? 'unset' : '420px' }}>
        <ExportImportPanel
          mode={mode}
          scope={scope}
          importFile={importFile}
          onDone={onClose}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}

export default ExportImportDialog;
