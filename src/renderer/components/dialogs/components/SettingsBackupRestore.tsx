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
import { ExportIcon, ImportIcon } from '-/components/CommonIcons';
import TsButton from '-/components/TsButton';
import type { SettingsBackupIntent } from '-/components/dialogs/SettingsDialog';
import ExportImportPanel from '-/components/dialogs/ExportImportPanel';
import type { TransferSection } from '-/services/export-import-validators';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  /** When set (e.g. opened from the Locations menu), jump straight into a
   *  scoped export/import instead of showing the Export/Import buttons. */
  backup?: SettingsBackupIntent;
};

function SettingsBackupRestore(props: Props) {
  const { backup } = props;
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'export' | 'import'>(backup?.mode);
  const [importFile, setImportFile] = useState<File>(backup?.importFile);
  const [scope, setScope] = useState<TransferSection>(backup?.scope);

  // Apply a (possibly new) intent if Settings is reopened with one.
  useEffect(() => {
    if (backup) {
      setMode(backup.mode);
      setImportFile(backup.importFile);
      setScope(backup.scope);
    }
  }, [backup]);

  const reset = () => {
    setMode(undefined);
    setImportFile(undefined);
    setScope(undefined);
  };

  function handleFileInputChange(selection: any) {
    const target = selection.currentTarget;
    const file = target.files[0];
    if (file) {
      setImportFile(file);
      setMode('import');
    }
    target.value = null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100% - 18px)',
        overflow: 'hidden',
      }}
    >
      {!mode && (
        <List sx={{ overflowX: 'hidden', overflowY: 'auto' }}>
          <ListItem>
            <ListItemText
              primary={t('core:exportImportTitle')}
              secondary={t('core:selectWhatToExport')}
            />
            <TsButton
              data-tid="settingsExportTID"
              startIcon={<ExportIcon />}
              onClick={() => {
                setImportFile(undefined);
                setMode('export');
              }}
            >
              {t('core:startExportButton')}
            </TsButton>
            <TsButton
              data-tid="settingsImportTID"
              startIcon={<ImportIcon />}
              sx={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}
              onClick={() => fileInputRef.current?.click()}
            >
              {t('core:startImportButton')}
            </TsButton>
          </ListItem>
        </List>
      )}
      {mode && (
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <ExportImportPanel
            key={mode + (scope || '') + (importFile ? importFile.name : '')}
            mode={mode}
            scope={scope}
            importFile={importFile}
            onDone={reset}
            onCancel={reset}
          />
        </Box>
      )}
      <input
        style={{ display: 'none' }}
        ref={fileInputRef}
        accept="*"
        type="file"
        onChange={handleFileInputChange}
      />
    </Box>
  );
}

export default SettingsBackupRestore;
