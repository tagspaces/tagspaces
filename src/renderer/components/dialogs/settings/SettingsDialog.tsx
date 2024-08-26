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

import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import ConfirmDialog from '../ConfirmDialog';
import SettingsGeneral from '../settings/SettingsGeneral';
import SettingsKeyBindings from '../settings/SettingsKeyBindings';
import SettingsFileTypes from '../settings/SettingsFileTypes';
import { clearAllURLParams } from '-/utils/dom';
import SettingsAdvanced from '-/components/dialogs/settings/SettingsAdvanced';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import Links from 'assets/links';
import SettingsExtensions from '-/components/dialogs/settings/SettingsExtensions';
import { openURLExternally } from '-/services/utils-io';
import { useTranslation } from 'react-i18next';
import AppConfig from '-/AppConfig';
import TranslucentDialog from '-/components/dialogs/TranslucentDialog';

interface Props {
  open: boolean;
  classes?: any;
  onClose: () => void;
}

function SettingsDialog(props: Props) {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [isResetSettingsDialogOpened, setIsResetSettingsDialogOpened] =
    useState<boolean>(false);

  const handleTabClick = (event, tab) => {
    setCurrentTab(tab);
  };

  const renderTitle = () => (
    <>
      <DialogTitle>
        {t('core:settings')}
        <DialogCloseButton testId="closeSettingsTID" onClose={onClose} />
      </DialogTitle>
      <AppBar position="static" color="default">
        <Tabs
          value={currentTab}
          onChange={handleTabClick}
          indicatorColor="primary"
          scrollButtons="auto"
          variant="scrollable"
        >
          <Tab data-tid="generalSettingsDialog" label={t('core:generalTab')} />
          <Tab
            data-tid="fileTypeSettingsDialog"
            label={t('core:fileTypeTab')}
          />
          <Tab
            data-tid="keyBindingsSettingsDialog"
            label={t('core:keyBindingsTab')}
          />
          <Tab
            data-tid="extensionsSettingsDialog"
            label={t('core:extensionsTab')}
          />
          <Tab
            data-tid="advancedSettingsDialogTID"
            label={t('core:advancedSettingsTab')}
          />
        </Tabs>
      </AppBar>
    </>
  );

  const renderContent = () => (
    <DialogContent
      style={{
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
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

              /* const electron = window.require('electron');
              const webContents = electron.remote.getCurrentWebContents();
              webContents.session.clearStorageData();
              webContents.reload(); */
            }
          }}
          cancelDialogTID="cancelResetSettingsDialogTID"
          confirmDialogTID="confirmResetSettingsDialogTID"
          confirmDialogContentTID="confirmResetSettingsDialogContentTID"
        />
      )}

      <div data-tid="settingsDialog">
        {currentTab === 0 && <SettingsGeneral />}
        {currentTab === 1 && <SettingsFileTypes />}
        {currentTab === 2 && <SettingsKeyBindings />}
        {currentTab === 3 && <SettingsExtensions />}
        {currentTab === 4 && (
          <SettingsAdvanced
            showResetSettings={setIsResetSettingsDialogOpened}
          />
        )}
      </div>
    </DialogContent>
  );

  const renderActions = () => (
    <DialogActions
      style={{
        justifyContent: 'space-between',
        padding: fullScreen ? '10px 30px 30px 30px' : undefined,
      }}
    >
      <Button
        onClick={() =>
          openURLExternally(Links.documentationLinks.settings, true)
        }
        color="secondary"
        style={{ float: 'left' }}
      >
        {t('core:help')}
      </Button>

      <Button
        data-tid="closeSettingsDialog"
        onClick={props.onClose}
        color="primary"
        variant="contained"
      >
        {t('core:closeButton')}
      </Button>
    </DialogActions>
  );

  const { open, onClose } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <TranslucentDialog
      fullScreen={fullScreen}
      open={open}
      keepMounted
      scroll="paper"
      onClose={onClose}
    >
      {renderTitle()}
      {renderContent()}
      {renderActions()}
    </TranslucentDialog>
  );
}

export default SettingsDialog;
