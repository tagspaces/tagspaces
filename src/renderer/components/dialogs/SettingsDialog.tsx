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
import {
  AIIcon,
  AdvancedSettingsIcon,
  ExtensionIcon,
  FileIcon,
  KeyboardIcon,
  OptionsIcon,
} from '-/components/CommonIcons';
import DraggablePaper from '-/components/DraggablePaper';
import { BetaLabel } from '-/components/HelperComponents';
import TsButton from '-/components/TsButton';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import SettingsAI from '-/components/dialogs/components/SettingsAI';
import SettingsAdvanced from '-/components/dialogs/components/SettingsAdvanced';
import SettingsExtensions from '-/components/dialogs/components/SettingsExtensions';
import SettingsFileTypes from '-/components/dialogs/components/SettingsFileTypes';
import SettingsGeneral from '-/components/dialogs/components/SettingsGeneral';
import SettingsKeyBindings from '-/components/dialogs/components/SettingsKeyBindings';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { isDesktopMode } from '-/reducers/settings';
import { openURLExternally } from '-/services/utils-io';
import { clearAllURLParams } from '-/utils/dom';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Links from 'assets/links';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

interface Props {
  open: boolean;
  classes?: any;
  onClose: () => void;
}

function SettingsDialog(props: Props) {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState<number>(0);
  const desktopMode = useSelector(isDesktopMode);
  const [isResetSettingsDialogOpened, setIsResetSettingsDialogOpened] =
    useState<boolean>(false);
  const { open, onClose } = props;
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabClick = (event, tab) => {
    setCurrentTab(tab);
  };

  const helpButton = (
    <TsButton
      onClick={() => openURLExternally(Links.documentationLinks.settings, true)}
      color="secondary"
      style={{
        // @ts-ignore
        WebkitAppRegion: 'no-drag',
      }}
    >
      {t('core:help')}
    </TsButton>
  );

  const renderContent = (
    <DialogContent
      style={{
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
        variant={smallScreen ? 'scrollable' : 'standard'}
        orientation={smallScreen ? 'horizontal' : 'vertical'}
        // allowScrollButtonsMobile
      >
        <Tab
          style={{
            textTransform: 'unset',
            justifyContent: 'flex-start',
          }}
          iconPosition="start"
          icon={smallScreen ? '' : <OptionsIcon />}
          data-tid="generalSettingsDialog"
          label={t('core:generalTab')}
        />
        <Tab
          style={{
            textTransform: 'unset',
            justifyContent: 'flex-start',
          }}
          iconPosition="start"
          icon={smallScreen ? '' : <FileIcon />}
          data-tid="fileTypeSettingsDialog"
          label={t('core:fileTypeTab')}
        />
        <Tab
          style={{
            textTransform: 'unset',
            justifyContent: 'flex-start',
          }}
          iconPosition="start"
          icon={smallScreen ? '' : <KeyboardIcon />}
          data-tid="keyBindingsSettingsDialog"
          label={t('core:keyBindingsTab')}
        />
        <Tab
          style={{
            textTransform: 'unset',
            justifyContent: 'flex-start',
          }}
          iconPosition="start"
          icon={smallScreen ? '' : <ExtensionIcon />}
          data-tid="extensionsSettingsDialog"
          label={t('core:extensionsTab')}
        />
        <Tab
          style={{
            textTransform: 'unset',
            justifyContent: 'flex-start',
          }}
          iconPosition="start"
          icon={smallScreen ? '' : <AdvancedSettingsIcon />}
          data-tid="advancedSettingsDialogTID"
          label={t('core:advancedSettingsTab')}
        />
        <Tab
          style={{
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
        {currentTab === 0 && <SettingsGeneral />}
        {currentTab === 1 && <SettingsFileTypes />}
        {currentTab === 2 && <SettingsKeyBindings />}
        {currentTab === 3 && <SettingsExtensions />}
        {currentTab === 4 && (
          <SettingsAdvanced
            showResetSettings={setIsResetSettingsDialogOpened}
          />
        )}
        {currentTab === 5 && <SettingsAI closeSettings={onClose} />}
      </div>
      {isResetSettingsDialogOpened && (
        <ConfirmDialog
          open={isResetSettingsDialogOpened}
          onClose={() => {
            setIsResetSettingsDialogOpened(false);
          }}
          title="Confirm"
          content={t('core:confirmResetSettings')}
          confirmCallback={(result) => {
            if (result) {
              clearAllURLParams();
              localStorage.clear();
              // eslint-disable-next-line no-restricted-globals
              if (AppConfig.isElectron) {
                window.electronIO.ipcRenderer.sendMessage('reloadWindow');
              } else {
                window.location.reload();
              }
            }
          }}
          cancelDialogTID="cancelResetSettingsDialogTID"
          confirmDialogTID="confirmResetSettingsDialogTID"
          confirmDialogContentTID="confirmResetSettingsDialogContentTID"
        />
      )}
    </DialogContent>
  );

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': {
          maxWidth: 'unset',
          height: '100%',
          // background: props.fullScreen
          //   ? theme.palette.background.default
          //   : alpha(theme.palette.background.default, 0.85),
          // backdropFilter: props.fullScreen ? 'unset' : 'blur(5px)',
        },
      }}
      fullScreen={smallScreen}
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      open={open}
      keepMounted
      scroll="paper"
      onClose={onClose}
      style={{ maxWidth: 'auto' }}
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
          style={{
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
