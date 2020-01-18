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

import React from 'react';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import uuidv1 from 'uuid';
import ConfirmDialog from '../ConfirmDialog';
import GenericDialog from '../GenericDialog';
import SettingsGeneral from '../settings/SettingsGeneral';
import SettingsKeyBindings from '../settings/SettingsKeyBindings';
import SettingsFileTypes from '../settings/SettingsFileTypes';
import i18n from '-/services/i18n';
import { getSettings, actions } from '-/reducers/settings';
import { extend } from '-/utils/misc';
import AppConfig from '-/config';

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
  setSupportedFileTypes?: (fileTypes: Array<Object>) => void;
  supportedFileTypes?: Array<Object>;
  settings?: Array<Object>;
}

interface State {
  currentTab: number;
  items: Array<Object>;
  selectedItem: any;
  activeItem?: any;
  isValidationInProgress: boolean;
  isConfirmDialogOpened: boolean;
}

class SettingsDialog extends React.Component<Props, State> {
  state = {
    currentTab: 0,
    items: [],
    selectedItem: {},
    isValidationInProgress: false,
    isConfirmDialogOpened: false
  };

  componentWillReceiveProps = nextProps => {
    const { settings } = nextProps;
    const supportedFileTypes = settings.supportedFileTypes.reduce(
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

    this.setState({
      items: supportedFileTypes,
      isValidationInProgress: false
    });
  };

  settingsFileTypeRef;

  handleTabClick = (event, currentTab) => {
    this.setState({ currentTab });
  };

  onAddFileType = item => {
    const { items } = this.state;
    this.setState({ items: [...items, item] }, () => {
      const { settingsFileTypeRef } = this;
      const lastFileType = settingsFileTypeRef.querySelector('li:last-child');
      lastFileType.scrollIntoView({ behavior: 'smooth' });
    });
  };

  setSelectedItem = selectedItem => {
    this.setState({ selectedItem });
  };

  updateItems = (
    identifierKey,
    identifierValue,
    targetKey,
    targetValue,
    disableSave = false
  ) => {
    const { items } = this.state;
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

    this.setState(
      {
        items: modifiedItems
      },
      () => {
        if (
          (targetKey !== 'type' && isSaveable && !disableSave) ||
          (targetKey === 'type' && hasViewer && isSaveable && !disableSave)
        ) {
          this.saveFileTypes();
        }
      }
    );
  };

  getDefaultFileTypeObject = () => ({
    id: uuidv1(),
    type: '',
    viewer: '',
    editor: '',
    color: '#2196f3'
  });

  saveFileTypes = () => {
    const { setSupportedFileTypes } = this.props;
    const { items } = this.state;

    this.setState({
      isValidationInProgress: true
    });

    const isValid = this.validateSelectedFileTypes();

    if (!isValid) {
      return false;
    }

    setSupportedFileTypes(items);
  };

  validateSelectedFileTypes = () => {
    const { items } = this.state;
    let isValid = true;

    items.map(item => {
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

  removeItem = (itemForRemoval: any) => {
    const { items } = this.state;
    const filteredItems = items.filter(
      item => item.type !== itemForRemoval.type
    );
    this.setState({ items: filteredItems }, () => this.saveFileTypes());
  };

  renderTitle = () => (
    <React.Fragment>
      <DialogTitle>{i18n.t('core:options')}</DialogTitle>
      <AppBar position="static" color="default">
        <Tabs
          value={this.state.currentTab}
          onChange={this.handleTabClick}
          indicatorColor="primary"
          variant="fullWidth"
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
        </Tabs>
      </AppBar>
    </React.Fragment>
  );

  renderContent = () => (
    <DialogContent className={this.props.classes.mainContent}>
      <ConfirmDialog
        open={this.state.isConfirmDialogOpened}
        onClose={() => {
          this.setState({
            activeItem: {},
            isConfirmDialogOpened: false
          });
        }}
        title="Confirm"
        content={i18n.t('core:confirmFileTypeDeletion')}
        confirmCallback={result => {
          if (result) {
            const { selectedItem } = this.state;
            this.removeItem(selectedItem);
          }
        }}
        cancelDialogTID="cancelDeleteFileTypeDialog"
        confirmDialogTID="confirmDeleteFileTypeDialog"
        confirmDialogContentTID="confirmDeleteFileTypeDialogContent"
      />

      <div
        data-tid="settingsDialog"
        className={this.props.classes.mainContent}
        ref={el => {
          this.settingsFileTypeRef = el;
        }}
      >
        {this.state.currentTab === 0 && <SettingsGeneral />}
        {this.state.currentTab === 1 && (
          <SettingsFileTypes
            items={this.state.items}
            selectedItem={this.state.selectedItem}
            setSelectedItem={this.setSelectedItem}
            updateItems={this.updateItems}
            isValidationInProgress={this.state.isValidationInProgress}
            onRemoveItem={selectedItem => {
              this.setState({
                selectedItem,
                isConfirmDialogOpened: true
              });
            }}
          />
        )}
        {this.state.currentTab === 2 && <SettingsKeyBindings />}
      </div>
    </DialogContent>
  );

  renderActions = () => (
    <DialogActions
      style={{
        justifyContent:
          this.state.currentTab === 1 ? 'space-between' : 'flex-end'
      }}
    >
      {this.state.currentTab === 1 && (
        <Button
          data-tid="closeSettingsDialog"
          onClick={() => this.onAddFileType(this.getDefaultFileTypeObject())}
          color="secondary"
        >
          {i18n.t('core:addNewFileType')}
        </Button>
      )}

      <Button
        data-tid="closeSettingsDialog"
        onClick={this.props.onClose}
        color="primary"
      >
        {i18n.t('core:closeButton')}
      </Button>
    </DialogActions>
  );

  render() {
    const { fullScreen, open, onClose } = this.props;
    return (
      <GenericDialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        renderTitle={this.renderTitle}
        renderContent={this.renderContent}
        renderActions={this.renderActions}
      />
    );
  }
}

const mapStateToProps = state => ({
  settings: getSettings(state)
});

const mapDispatchToProps = dispatch => ({
  setSupportedFileTypes: supportedFileTypes =>
    dispatch(actions.setSupportedFileTypes(supportedFileTypes))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withMobileDialog()(withStyles(styles)(SettingsDialog)));
