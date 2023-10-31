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
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Switch from '@mui/material/Switch';
import { useDispatch } from 'react-redux';
import useValidation from '-/utils/useValidation';
import { TS } from '-/tagspaces.namespace';
import { actions as SettingsActions } from '-/reducers/settings';
import DialogCloseButton from '-/components/dialogs/DialogCloseButton';
import { AppDispatch } from '-/reducers/app';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onClose: () => void;
  tileServer: TS.MapTileServer;
  isDefault: boolean;
}

function MapTileServerDialog(props: Props) {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const name = useRef<string>(props.tileServer.name);
  const serverURL = useRef<string>(props.tileServer.serverURL);
  const serverInfo = useRef<string>(props.tileServer.serverInfo);
  const isDefault = useRef<boolean>(props.isDefault);

  const { setError, haveError } = useValidation();
  const renderTitle = () => (
    <DialogTitle>
      {t(
        props.tileServer.uuid
          ? 'core:tileServerDialogEdit'
          : 'core:tileServerDialogAdd',
      )}
      <DialogCloseButton testId="closeMapTileServerTID" onClose={onClose} />
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
        dispatch(
          SettingsActions.editTileServers(
            {
              uuid: props.tileServer.uuid,
              name: name.current,
              serverInfo: serverInfo.current,
              serverURL: serverURL.current,
            },
            isDefault.current,
          ),
        );
      } else {
        dispatch(
          SettingsActions.addTileServers(
            {
              uuid: props.tileServer.uuid,
              name: name.current,
              serverInfo: serverInfo.current,
              serverURL: serverURL.current,
            },
            isDefault.current,
          ),
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
          label={t('core:tileServerNameTitle')}
          onChange={(event) => {
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
          label={t('core:tileServerUrlTitle')}
          onChange={(event) => {
            const { target } = event;
            serverURL.current = target.value;
          }}
          defaultValue={serverURL.current}
          data-tid="tileServerUrlTID"
        />
        <FormHelperText>{t('core:tileServerUrlHelp')}</FormHelperText>
      </FormControl>
      <FormControl fullWidth={true}>
        <TextField
          fullWidth
          margin="dense"
          name="serverInfo"
          label={t('core:tileServerInfoTitle')}
          onChange={(event) => {
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
        <FormHelperText>{t('core:serverIsDefaultHelp')}</FormHelperText>
      </FormControl>
    </DialogContent>
  );

  const renderActions = () => (
    <DialogActions
      style={{
        justifyContent: props.tileServer.uuid ? 'space-between' : 'flex-end',
      }}
    >
      {props.tileServer.uuid && (
        <Button
          style={{
            marginLeft: 10,
          }}
          data-tid="deleteTileServerTID"
          onClick={() => {
            dispatch(SettingsActions.deleteTileServer(props.tileServer.uuid));
            props.onClose();
          }}
        >
          {t('core:delete')}
        </Button>
      )}
      <div>
        <Button
          data-tid="closeTileServerDialogTID"
          onClick={props.onClose}
          color="primary"
        >
          {t('core:closeButton')}
        </Button>
        <Button
          data-tid="saveTileServerDialogTID"
          onClick={saveTileServer}
          color="primary"
          variant="contained"
        >
          {t('core:confirmSaveButton')}
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
}

export default MapTileServerDialog;
