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

import React, { useState } from 'react';
import { connect } from 'react-redux';
import Button from '@mui/material/Button';
import withStyles from '@mui/styles/withStyles';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/styles/useTheme';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import AppConfig from '-/AppConfig';
import ConfirmDialog from '../ConfirmDialog';
import SettingsGeneral from '../settings/SettingsGeneral';
import SettingsKeyBindings from '../settings/SettingsKeyBindings';
import SettingsFileTypes from '../settings/SettingsFileTypes';
import i18n from '-/services/i18n';
import { getCurrentLanguage } from '-/reducers/settings';
import { clearAllURLParams } from '-/utils/dom';
import SettingsAdvanced from '-/components/dialogs/settings/SettingsAdvanced';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import Links from '-/content/links';

const styles: any = () => ({
  mainContent: {
    overflowY: AppConfig.isFirefox ? 'auto' : 'overlay'
  }
});

interface Props {
  open: boolean;
  classes?: any;
  onClose: () => void;
  openURLExternally: (url: string, skipConfirmation?: boolean) => void;
}

function SettingsDialog(props: Props) {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [
    isResetSettingsDialogOpened,
    setIsResetSettingsDialogOpened
  ] = useState<boolean>(false);

  const handleTabClick = (event, tab) => {
    setCurrentTab(tab);
  };

  const renderTitle = () => (
    <>
      <DialogTitle>
        {i18n.t('core:settings')}
        <DialogCloseButton onClose={onClose} />
      </DialogTitle>
      <AppBar position="static" color="default">
        <Tabs
          value={currentTab}
          onChange={handleTabClick}
          indicatorColor="primary"
          scrollButtons="auto"
          variant="scrollable"
        >
          <Tab
            data-tid="generalSettingsDialog"
            label={i18n.t('core:generalTab')}
          />
          <Tab
            data-tid="fileTypeSettingsDialog"
            label={i18n.t('core:fileTypeTab')}
          />
          <Tab
            data-tid="keyBindingsSettingsDialog"
            label={i18n.t('core:keyBindingsTab')}
          />
          <Tab
            data-tid="advancedSettingsDialogTID"
            label={i18n.t('core:advancedSettingsTab')}
          />
        </Tabs>
      </AppBar>
    </>
  );

  const renderContent = () => (
    <DialogContent className={props.classes.mainContent}>
      {isResetSettingsDialogOpened && (
        <ConfirmDialog
          open={isResetSettingsDialogOpened}
          onClose={() => {
            setIsResetSettingsDialogOpened(false);
          }}
          title="Confirm"
          content={i18n.t('core:confirmResetSettings')}
          confirmCallback={result => {
            if (result) {
              clearAllURLParams();
              localStorage.clear();
              // eslint-disable-next-line no-restricted-globals
              location.reload();

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

      <div data-tid="settingsDialog" className={props.classes.mainContent}>
        {currentTab === 0 && <SettingsGeneral />}
        {currentTab === 1 && <SettingsFileTypes />}
        {currentTab === 2 && <SettingsKeyBindings />}
        {currentTab === 3 && (
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
        justifyContent: currentTab === 1 ? 'space-between' : 'flex-end'
      }}
    >
      <Button
        onClick={() =>
          openURLExternally(Links.documentationLinks.settings, true)
        }
        color="secondary"
        style={{ float: 'left' }}
      >
        {i18n.t('core:help')}
      </Button>

      <Button
        data-tid="closeSettingsDialog"
        onClick={props.onClose}
        color="primary"
      >
        {i18n.t('core:closeButton')}
      </Button>
    </DialogActions>
  );

  const { open, onClose, openURLExternally } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      keepMounted
      scroll="paper"
      onClose={onClose}
    >
      {renderTitle()}
      {renderContent()}
      {renderActions()}
    </Dialog>
  );
}

const mapStateToProps = state => ({
  language: getCurrentLanguage(state)
});

export default connect(mapStateToProps)(withStyles(styles)(SettingsDialog));
