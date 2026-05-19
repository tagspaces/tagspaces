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
import {
  AIIcon,
  ExportImportIcon,
  ExtensionIcon,
  FileIcon,
  KeyboardIcon,
  OptionsIcon,
  PerspectiveIcon,
} from '-/components/CommonIcons';
import DraggablePaper from '-/components/DraggablePaper';
import { BetaLabel } from '-/components/HelperComponents';
import TsButton from '-/components/TsButton';
import SettingsAI from '-/components/dialogs/components/SettingsAI';
import SettingsBackupRestore from '-/components/dialogs/components/SettingsBackupRestore';
import SettingsExtensions from '-/components/dialogs/components/SettingsExtensions';
import SettingsFileTypes from '-/components/dialogs/components/SettingsFileTypes';
import SettingsGeneral from '-/components/dialogs/components/SettingsGeneral';
import SettingsKeyBindings from '-/components/dialogs/components/SettingsKeyBindings';
import SettingsPerspectives from '-/components/dialogs/components/SettingsPerspectives';
import SettingsTemplates from '-/components/dialogs/components/SettingsTemplates';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import type { SettingsBackupIntent } from '-/services/export-import-validators';
import { openURLExternally } from '-/services/utils-io';
import ArticleIcon from '@mui/icons-material/Article';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Links from 'assets/links';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export enum SettingsTab {
  General = 'general',
  FileTypes = 'fileTypes',
  Templates = 'templates',
  KeyBindings = 'keyBindings',
  Extensions = 'extensions',
  Perspectives = 'perspectives',
  BackupRestore = 'backupRestore',
  AI = 'ai',
}

// Re-exported for callers that import it from the dialog (e.g. the settings
// dialog context provider). Defined in export-import-validators to avoid an
// import cycle with SettingsBackupRestore.
export type { SettingsBackupIntent };

interface Props {
  open: boolean;
  tab?: SettingsTab;
  backup?: SettingsBackupIntent;
  classes?: any;
  onClose: () => void;
}

function SettingsDialog(props: Props) {
  const { t } = useTranslation();
  const { open, onClose, tab, backup } = props;
  const [currentTab, setCurrentTab] = useState<SettingsTab>(
    tab || SettingsTab.General,
  );
  // const desktopMode = useSelector(isDesktopMode);
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabClick = (
    event: React.SyntheticEvent,
    newValue: SettingsTab | string,
  ) => {
    setCurrentTab(newValue as SettingsTab);
  };

  const helpButton = (
    <TsButton
      onClick={() => openURLExternally(Links.documentationLinks.settings, true)}
      sx={
        {
          WebkitAppRegion: 'no-drag',
        } as React.CSSProperties & { WebkitAppRegion?: string }
      }
    >
      {t('core:help')}
    </TsButton>
  );

  const renderContent = (
    <DialogContent
      sx={{
        overflowY: 'hidden',
        overflowX: 'hidden',
        display: smallScreen ? 'block' : 'flex',
        flexGrow: 1,
        padding: smallScreen ? 0 : '0 20px',
      }}
    >
      <Tabs
        value={currentTab}
        onChange={handleTabClick}
        indicatorColor="primary"
        scrollButtons="auto"
        variant="scrollable"
        orientation={smallScreen ? 'horizontal' : 'vertical'}
        allowScrollButtonsMobile
      >
        <Tab
          value={SettingsTab.General}
          sx={{
            textTransform: 'unset',
            justifyContent: 'flex-start',
          }}
          iconPosition="start"
          icon={smallScreen ? '' : <OptionsIcon />}
          data-tid="generalSettingsDialog"
          label={t('core:generalTab')}
        />
        <Tab
          value={SettingsTab.FileTypes}
          sx={{
            textTransform: 'unset',
            justifyContent: 'flex-start',
          }}
          iconPosition="start"
          icon={smallScreen ? '' : <FileIcon />}
          data-tid="fileTypeSettingsDialog"
          label={t('core:fileTypeTab')}
        />
        <Tab
          value={SettingsTab.Templates}
          sx={{
            textTransform: 'unset',
            justifyContent: 'flex-start',
          }}
          data-tid="templatesDialogTID"
          iconPosition="start"
          icon={smallScreen ? '' : <ArticleIcon />}
          label={
            <span style={{ whiteSpace: 'nowrap' }}>
              {t('core:templatesTab')}
            </span>
          }
        />
        <Tab
          value={SettingsTab.KeyBindings}
          sx={{
            textTransform: 'unset',
            justifyContent: 'flex-start',
          }}
          iconPosition="start"
          icon={smallScreen ? '' : <KeyboardIcon />}
          data-tid="keyBindingsSettingsDialog"
          label={t('core:keyBindingsTab')}
        />
        <Tab
          value={SettingsTab.Extensions}
          sx={{
            textTransform: 'unset',
            justifyContent: 'flex-start',
          }}
          iconPosition="start"
          icon={smallScreen ? '' : <ExtensionIcon />}
          data-tid="extensionsSettingsDialog"
          label={t('core:extensionsTab')}
        />
        <Tab
          value={SettingsTab.Perspectives}
          sx={{
            textTransform: 'unset',
            justifyContent: 'flex-start',
          }}
          iconPosition="start"
          icon={smallScreen ? '' : <PerspectiveIcon />}
          data-tid="perspectivesSettingsDialog"
          label={t('core:perspectivesSettingsTab')}
        />
        <Tab
          value={SettingsTab.BackupRestore}
          sx={{
            textTransform: 'unset',
            justifyContent: 'flex-start',
          }}
          iconPosition="start"
          icon={smallScreen ? '' : <ExportImportIcon />}
          data-tid="backupRestoreSettingsDialog"
          label={t('core:backupRestoreSettingsTab')}
        />
        <Tab
          value={SettingsTab.AI}
          sx={{
            textTransform: 'unset',
            justifyContent: 'flex-start',
          }}
          data-tid="aiSettingsDialogTID"
          iconPosition="start"
          icon={smallScreen ? '' : <AIIcon />}
          label={
            <span style={{ whiteSpace: 'nowrap' }}>
              {t('core:aiSettingsTab')}
              <BetaLabel />
            </span>
          }
        />
      </Tabs>
      <div
        data-tid="settingsDialog"
        style={{
          height: smallScreen ? 'calc(100% - 50px)' : '100%',
          minHeight: 400,
          width: smallScreen ? '100%' : 600,
        }}
      >
        {currentTab === SettingsTab.General && <SettingsGeneral />}
        {currentTab === SettingsTab.FileTypes && <SettingsFileTypes />}
        {currentTab === SettingsTab.Templates && <SettingsTemplates />}
        {currentTab === SettingsTab.KeyBindings && <SettingsKeyBindings />}
        {currentTab === SettingsTab.Extensions && <SettingsExtensions />}
        {currentTab === SettingsTab.Perspectives && <SettingsPerspectives />}
        {currentTab === SettingsTab.BackupRestore && (
          <SettingsBackupRestore backup={backup} />
        )}
        {currentTab === SettingsTab.AI && (
          <SettingsAI closeSettings={onClose} />
        )}
      </div>
    </DialogContent>
  );

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': {
          height: '100%',
          maxWidth: 'unset',
        },
      }}
      fullScreen={smallScreen}
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      open={open}
      keepMounted
      scroll="paper"
      onClose={onClose}
    >
      <TsDialogTitle
        dialogTitle={t('core:settings')}
        closeButtonTestId="closeSettingsTID"
        onClose={onClose}
        actionSlot={helpButton}
      />
      {renderContent}
      {!smallScreen && (
        <TsDialogActions
          sx={{
            justifyContent: 'space-between',
          }}
        >
          {helpButton}
          <TsButton data-tid="closeSettingsDialog" onClick={props.onClose}>
            {t('core:closeButton')}
          </TsButton>
        </TsDialogActions>
      )}
    </Dialog>
  );
}

export default SettingsDialog;
