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
import ExportImportPanel from '-/components/dialogs/ExportImportPanel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

function SettingsBackupRestore() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'export' | 'import'>(undefined);
  const [importFile, setImportFile] = useState<File>(undefined);

  const reset = () => {
    setMode(undefined);
    setImportFile(undefined);
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
    <List
      sx={{
        overflowX: 'hidden',
        overflowY: 'auto',
        height: 'calc(100% - 18px)',
      }}
    >
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
      {mode && (
        <ListItem>
          <div style={{ width: '100%' }}>
            <ExportImportPanel
              key={mode + (importFile ? importFile.name : '')}
              mode={mode}
              importFile={importFile}
              onDone={reset}
              onCancel={reset}
            />
          </div>
        </ListItem>
      )}
      <input
        style={{ display: 'none' }}
        ref={fileInputRef}
        accept="*"
        type="file"
        onChange={handleFileInputChange}
      />
    </List>
  );
}

export default SettingsBackupRestore;
