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

import React, { useRef } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Switch from '@material-ui/core/Switch';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import i18n from '-/services/i18n';
import useValidation from '-/utils/useValidation';
import { TS } from '-/tagspaces.namespace';
import { actions as SettingsActions } from '-/reducers/settings';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';

interface Props {
  open: boolean;
  onClose: () => void;
  tileServer: TS.MapTileServer;
  isDefault: boolean;
  editTileServers: (tileServer: TS.MapTileServer, isDefault: boolean) => void;
  addTileServers: (tileServer: TS.MapTileServer, isDefault: boolean) => void;
  deleteTileServer: (uuid: string) => void;
}

const MapTileServerDialog = (props: Props) => {
  const name = useRef<string>(props.tileServer.name);
  const serverURL = useRef<string>(props.tileServer.serverURL);
  const serverInfo = useRef<string>(props.tileServer.serverInfo);
  const isDefault = useRef<boolean>(props.isDefault);

  const { setError, haveError } = useValidation();
  const renderTitle = () => (
    <DialogTitle>
      {i18n.t(
        props.tileServer.uuid
          ? 'core:tileServerDialogEdit'
          : 'core:tileServerDialogAdd'
      )}
      <DialogCloseButton onClose={onClose} />
    </DialogTitle>
  );

  const validateForm = () => {
    if (!name.current) {
      setError('name');
      return false;
    }
    setError('name', false);
    return true;
  };

  const saveTileServer = () => {
    if (validateForm()) {
      if (props.tileServer.uuid) {
        props.editTileServers(
          {
            uuid: props.tileServer.uuid,
            name: name.current,
            serverInfo: serverInfo.current,
            serverURL: serverURL.current
          },
          isDefault.current
        );
      } else {
        props.addTileServers(
          {
            uuid: props.tileServer.uuid,
            name: name.current,
            serverInfo: serverInfo.current,
            serverURL: serverURL.current
          },
          isDefault.current
        );
      }
      props.onClose();
    }
  };

  const renderContent = () => (
    <DialogContent>
      <FormControl fullWidth={true} error={haveError('name')}>
        <TextField
          fullWidth
          error={haveError('name')}
          margin="dense"
          autoFocus
          name="name"
          label={i18n.t('core:tileServerNameTitle')}
          onChange={event => {
            const { target } = event;
            name.current = target.value;
            validateForm();
          }}
          defaultValue={name.current}
          data-tid="tileServerNameTID"
        />
      </FormControl>
      <FormControl fullWidth={true}>
        <TextField
          fullWidth
          margin="dense"
          name="serverURL"
          label={i18n.t('core:tileServerUrlTitle')}
          onChange={event => {
            const { target } = event;
            serverURL.current = target.value;
          }}
          defaultValue={serverURL.current}
          data-tid="tileServerUrlTID"
        />
        <FormHelperText>{i18n.t('core:tileServerUrlHelp')}</FormHelperText>
      </FormControl>
      <FormControl fullWidth={true}>
        <TextField
          fullWidth
          margin="dense"
          name="serverInfo"
          label={i18n.t('core:tileServerInfoTitle')}
          onChange={event => {
            const { target } = event;
            serverInfo.current = target.value;
          }}
          defaultValue={serverInfo.current}
          data-tid="tileserverInfoTID"
        />
      </FormControl>
      <FormControl fullWidth={true}>
        <Switch
          data-tid="serverIsDefaultTID"
          onClick={() => {
            isDefault.current = !isDefault.current;
          }}
          defaultChecked={isDefault.current}
        />
        <FormHelperText>{i18n.t('core:serverIsDefaultHelp')}</FormHelperText>
      </FormControl>
    </DialogContent>
  );

  const renderActions = () => (
    <DialogActions
      style={{
        justifyContent: props.tileServer.uuid ? 'space-between' : 'flex-end'
      }}
    >
      {props.tileServer.uuid && (
        <Button
          style={{
            marginLeft: 10
          }}
          data-tid="deleteTileServerTID"
          onClick={() => {
            props.deleteTileServer(props.tileServer.uuid);
            props.onClose();
          }}
        >
          {i18n.t('core:delete')}
        </Button>
      )}
      <div>
        <Button
          data-tid="closeTileServerDialogTID"
          onClick={props.onClose}
          color="primary"
        >
          {i18n.t('core:closeButton')}
        </Button>
        <Button
          data-tid="saveTileServerDialogTID"
          onClick={saveTileServer}
          color="primary"
        >
          {i18n.t('core:confirmSaveButton')}
        </Button>
      </div>
    </DialogActions>
  );

  const { open, onClose } = props;
  return (
    <Dialog open={open} keepMounted scroll="paper" onClose={onClose}>
      {renderTitle()}
      {renderContent()}
      {renderActions()}
    </Dialog>
  );
};

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      editTileServers: SettingsActions.editTileServers,
      addTileServers: SettingsActions.addTileServers,
      deleteTileServer: SettingsActions.deleteTileServer
    },
    dispatch
  );
}

export default connect(
  undefined,
  mapActionCreatorsToProps
)(MapTileServerDialog);
