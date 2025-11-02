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
import DraggablePaper from '-/components/DraggablePaper';
import TsButton from '-/components/TsButton';
import TsTextField from '-/components/TsTextField';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { AppDispatch } from '-/reducers/app';
import { actions as SettingsActions } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import useValidation from '-/utils/useValidation';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

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
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { open, onClose } = props;
  const { setError, haveError } = useValidation();

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
        <TsTextField
          error={haveError('name')}
          autoFocus
          name="name"
          label={t('core:tileServerNameTitle')}
          onChange={(event) => {
            const { target } = event;
            name.current = target.value;
            validateForm();
          }}
          retrieveValue={() => name.current}
          defaultValue={name.current}
          data-tid="tileServerNameTID"
        />
      </FormControl>
      <FormControl fullWidth={true}>
        <TsTextField
          name="serverURL"
          label={t('core:tileServerUrlTitle')}
          onChange={(event) => {
            const { target } = event;
            serverURL.current = target.value;
          }}
          retrieveValue={() => serverURL.current}
          defaultValue={serverURL.current}
          data-tid="tileServerUrlTID"
        />
        <FormHelperText
          sx={{ marginLeft: 0, marginTop: 0, marginBottom: '10px' }}
        >
          {t('core:tileServerUrlHelp')}
        </FormHelperText>
      </FormControl>
      <FormControl fullWidth={true}>
        <TsTextField
          name="serverInfo"
          label={t('core:tileServerInfoTitle')}
          onChange={(event) => {
            const { target } = event;
            serverInfo.current = target.value;
          }}
          retrieveValue={() => serverInfo.current}
          defaultValue={serverInfo.current}
          data-tid="tileserverInfoTID"
        />
      </FormControl>
      <ListItem sx={{ paddingLeft: 0, paddingRight: 0 }}>
        <ListItemText primary={t('core:serverIsDefaultHelp')} />
        <Switch
          data-tid="serverIsDefaultTID"
          onClick={() => {
            isDefault.current = !isDefault.current;
          }}
          defaultChecked={isDefault.current}
        />
      </ListItem>
    </DialogContent>
  );

  return (
    <Dialog
      open={open}
      fullScreen={smallScreen}
      keepMounted
      scroll="paper"
      PaperComponent={smallScreen ? Paper : DraggablePaper}
      onClose={onClose}
    >
      <TsDialogTitle
        dialogTitle={t(
          props.tileServer.uuid
            ? 'core:tileServerDialogEdit'
            : 'core:tileServerDialogAdd',
        )}
        closeButtonTestId="closeMapTileServerTID"
        onClose={onClose}
      />
      {renderContent()}
      <TsDialogActions
        style={{
          justifyContent: props.tileServer.uuid ? 'space-between' : 'flex-end',
        }}
      >
        {props.tileServer.uuid && (
          <TsButton
            sx={{
              marginLeft: '10px',
            }}
            data-tid="deleteTileServerTID"
            onClick={() => {
              dispatch(SettingsActions.deleteTileServer(props.tileServer.uuid));
              props.onClose();
            }}
          >
            {t('core:delete')}
          </TsButton>
        )}
        <div>
          <TsButton data-tid="closeTileServerDialogTID" onClick={props.onClose}>
            {t('core:closeButton')}
          </TsButton>
          <TsButton
            data-tid="saveTileServerDialogTID"
            onClick={saveTileServer}
            sx={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}
            variant="contained"
          >
            {t('core:confirmSaveButton')}
          </TsButton>
        </div>
      </TsDialogActions>
    </Dialog>
  );
}

export default MapTileServerDialog;
