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

import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import uuidv1 from 'uuid';
import { useStateWithCallbackLazy } from 'use-state-with-callback';
import ConfirmDialog from '../ConfirmDialog';
import SettingsGeneral from '../settings/SettingsGeneral';
import SettingsKeyBindings from '../settings/SettingsKeyBindings';
import SettingsFileTypes from '../settings/SettingsFileTypes';
import i18n from '-/services/i18n';
import { actions, getSupportedFileTypes } from '-/reducers/settings';
import { clearAllURLParams, extend } from '-/utils/misc';
import AppConfig from '-/config';
import SettingsAdvanced from '-/components/dialogs/settings/SettingsAdvanced';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';

const styles: any = () => ({
  mainContent: {
    overflowY: AppConfig.isFirefox ? 'auto' : 'overlay'
  }
});

interface Props {
  open: boolean;
  fullScreen?: boolean;
  classes?: any;
  onClose: () => void;
  setSupportedFileTypes?: (fileTypes: Array<any>) => void;
  supportedFileTypes?: Array<any>;
}

const SettingsDialog = (props: Props) => {
  const [items, setItems] = useStateWithCallbackLazy<Array<any>>([]);
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<any>({});
  const [isValidationInProgress, setIsValidationInProgress] = useState<boolean>(
    false
  );
  const [isConfirmDialogOpened, setIsConfirmDialogOpened] = useState<boolean>(
    false
  );
  const [
    isResetSettingsDialogOpened,
    setIsResetSettingsDialogOpened
  ] = useState<boolean>(false);
  const settingsFileTypeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initSupportedFileTypes = props.supportedFileTypes.reduce(
      (accumulator, fileType) => {
        const modifiedFileType = extend({}, fileType, {
          id: fileType.id || uuidv1()
        });
        if (fileType.viewer !== '') {
          accumulator.push(modifiedFileType);
        }
        return accumulator;
      },
      []
    );
    setItems(initSupportedFileTypes, undefined);
    setIsValidationInProgress(false);
  }, [props.supportedFileTypes]);

  const handleTabClick = (event, tab) => {
    setCurrentTab(tab);
  };

  const onAddFileType = (item = defaultFileTypeObject) => {
    setItems([...items, item], () => {
      if (settingsFileTypeRef && settingsFileTypeRef.current) {
        const lastFileType = settingsFileTypeRef.current.querySelector(
          'li:last-child'
        );
        lastFileType.scrollIntoView({ behavior: 'smooth' });
      }
    });
  };

  const updateItems = (
    identifierKey,
    identifierValue,
    targetKey,
    targetValue,
    disableSave = false
  ) => {
    let isSaveable = false;
    let hasViewer = false;
    const modifiedItems = items.reduce((accumulator, item) => {
      let modifiedItem = extend({}, item);
      if (item[identifierKey] === identifierValue) {
        isSaveable = item.type !== '';
        hasViewer = item.viewer !== '';
        modifiedItem = extend(modifiedItem, {
          [targetKey]: targetValue
        });
      }
      accumulator.push(modifiedItem);
      return accumulator;
    }, []);

    setItems(modifiedItems, () => {
      if (
        (targetKey !== 'type' && isSaveable && !disableSave) ||
        (targetKey === 'type' && hasViewer && isSaveable && !disableSave)
      ) {
        saveFileTypes(modifiedItems);
      }
    });
  };

  const defaultFileTypeObject = {
    id: uuidv1(),
    type: '',
    viewer: '',
    editor: '',
    color: '#2196f3'
  };

  const saveFileTypes = newItems => {
    const { setSupportedFileTypes } = props;

    setIsValidationInProgress(true);

    const isValid = validateSelectedFileTypes(newItems);

    if (!isValid) {
      return false;
    }

    setSupportedFileTypes(newItems);
  };

  const validateSelectedFileTypes = newItems => {
    let isValid = true;

    newItems.map(item => {
      const hasDuplicates =
        items.filter(targetItem => targetItem.type === item.type).length > 1;

      if (
        isValid &&
        (item.type === '' || item.viewer === '' || hasDuplicates)
      ) {
        isValid = false;
      }
      return item;
    });

    return isValid;
  };

  const removeItem = (itemForRemoval: any) => {
    const filteredItems = items.filter(
      item => item.type !== itemForRemoval.type
    );
    // setItems(filteredItems, undefined);
    saveFileTypes(filteredItems);
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
          // variant="scrollable"
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
      {isConfirmDialogOpened && (
        <ConfirmDialog
          open={isConfirmDialogOpened}
          onClose={() => {
            setIsConfirmDialogOpened(false);
          }}
          title="Confirm"
          content={i18n.t('core:confirmFileTypeDeletion')}
          confirmCallback={result => {
            if (result) {
              removeItem(selectedItem);
            }
          }}
          cancelDialogTID="cancelDeleteFileTypeDialog"
          confirmDialogTID="confirmDeleteFileTypeDialog"
          confirmDialogContentTID="confirmDeleteFileTypeDialogContent"
        />
      )}

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

      <div
        data-tid="settingsDialog"
        className={props.classes.mainContent}
        ref={settingsFileTypeRef}
      >
        {currentTab === 0 && <SettingsGeneral />}
        {currentTab === 1 && (
          <SettingsFileTypes
            items={items}
            selectedItem={selectedItem}
            setSelectedItem={item => setSelectedItem(item)}
            updateItems={updateItems}
            isValidationInProgress={isValidationInProgress}
            onRemoveItem={item => {
              setSelectedItem(item);
              setIsConfirmDialogOpened(true);
            }}
          />
        )}
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
      {currentTab === 1 && (
        <Button
          data-tid="addNewFileTypeTID"
          onClick={() => onAddFileType()}
          color="secondary"
          style={{ float: 'left' }}
        >
          {i18n.t('core:addNewFileType')}
        </Button>
      )}

      <Button
        data-tid="closeSettingsDialog"
        onClick={props.onClose}
        color="primary"
      >
        {i18n.t('core:closeButton')}
      </Button>
    </DialogActions>
  );

  const { fullScreen, open, onClose } = props;
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
};

const mapStateToProps = state => ({
  supportedFileTypes: getSupportedFileTypes(state)
});

const mapDispatchToProps = dispatch => ({
  setSupportedFileTypes: supportedFileTypes =>
    dispatch(actions.setSupportedFileTypes(supportedFileTypes))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withMobileDialog()(withStyles(styles)(SettingsDialog)));
