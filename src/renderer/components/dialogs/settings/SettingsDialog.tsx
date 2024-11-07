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

import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import TsButton from '-/components/TsButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { isDesktopMode } from '-/reducers/settings';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import SettingsGeneral from '-/components/dialogs/settings/SettingsGeneral';
import SettingsKeyBindings from '-/components/dialogs/settings/SettingsKeyBindings';
import SettingsFileTypes from '-/components/dialogs/settings/SettingsFileTypes';
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
  const desktopMode = useSelector(isDesktopMode);
  const [isResetSettingsDialogOpened, setIsResetSettingsDialogOpened] =
    useState<boolean>(false);
  const { open, onClose } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabClick = (event, tab) => {
    setCurrentTab(tab);
  };

  const renderTitle = () => (
    <DialogTitle>
      {t('core:settings')}
      <DialogCloseButton testId="closeSettingsTID" onClose={onClose} />
    </DialogTitle>
  );

  const renderContent = () => (
    <DialogContent
      style={{
        overflowY: 'hidden',
        overflowX: 'hidden',
        display: fullScreen ? 'block' : 'flex',
        flexGrow: 1,
      }}
    >
      <Tabs
        value={currentTab}
        centered
        onChange={handleTabClick}
        indicatorColor="primary"
        scrollButtons="auto"
        variant={fullScreen ? 'scrollable' : 'standard'}
        orientation={fullScreen ? 'horizontal' : 'vertical'}
        style={{
          width: fullScreen ? '100%' : '170px',
        }}
      >
        <Tab
          style={{
            textTransform: 'unset',
            fontSize: 16,
            alignItems: 'baseline',
            paddingLeft: 0,
          }}
          data-tid="generalSettingsDialog"
          label={t('core:generalTab')}
        />
        <Tab
          style={{
            textTransform: 'unset',
            fontSize: 16,
            alignItems: 'baseline',
            paddingLeft: 0,
          }}
          data-tid="fileTypeSettingsDialog"
          label={t('core:fileTypeTab')}
        />
        <Tab
          style={{
            textTransform: 'unset',
            fontSize: 16,
            alignItems: 'baseline',
            paddingLeft: 0,
          }}
          data-tid="keyBindingsSettingsDialog"
          label={t('core:keyBindingsTab')}
        />
        <Tab
          style={{
            textTransform: 'unset',
            fontSize: 16,
            alignItems: 'baseline',
            paddingLeft: 0,
          }}
          data-tid="extensionsSettingsDialog"
          label={t('core:extensionsTab')}
        />
        <Tab
          style={{
            textTransform: 'unset',
            fontSize: 16,
            alignItems: 'baseline',
            paddingLeft: 0,
          }}
          data-tid="advancedSettingsDialogTID"
          label={t('core:advancedSettingsTab')}
        />
      </Tabs>
      <div
        data-tid="settingsDialog"
        style={{
          height: 'calc(100% - 50px)',
          minHeight: 400,
          width: fullScreen ? '100%' : 600,
          //minWidth: 600,
          //maxWidth: 600,
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

  const renderActions = () => (
    <TsDialogActions
      style={{
        justifyContent: 'space-between',
      }}
    >
      <TsButton
        onClick={() =>
          openURLExternally(Links.documentationLinks.settings, true)
        }
        color="secondary"
        style={{ float: 'left' }}
      >
        {t('core:help')}
      </TsButton>
      <TsButton data-tid="closeSettingsDialog" onClick={props.onClose}>
        {t('core:closeButton')}
      </TsButton>
    </TsDialogActions>
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
      fullScreen={fullScreen}
      open={open}
      keepMounted
      scroll="paper"
      onClose={onClose}
      style={{ maxWidth: 'auto' }}
    >
      {renderTitle()}
      {renderContent()}
      {renderActions()}
    </Dialog>
  );
}

export default SettingsDialog;
