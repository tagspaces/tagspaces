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
import { HelpIcon } from '-/components/CommonIcons';
import DraggablePaper from '-/components/DraggablePaper';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import TsTextField from '-/components/TsTextField';
import TsDialogActions from '-/components/dialogs/components/TsDialogActions';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import { AppDispatch } from '-/reducers/app';
import { actions as SettingsActions } from '-/reducers/settings';
import { openUrl } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import useValidation from '-/utils/useValidation';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import FormControl from '@mui/material/FormControl';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Links from 'assets/links';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

const OSM_TILE_SERVER = {
  name: 'OpenStreetMap',
  serverURL: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  serverInfo:
    '<b>Leaflet</b> | Map data: &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};
const OSM_PRIVACY_URL = 'https://osmfoundation.org/wiki/Privacy_Policy';

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
  const [osmConfirmOpen, setOsmConfirmOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const applyOsmDefaults = () => {
    name.current = OSM_TILE_SERVER.name;
    serverURL.current = OSM_TILE_SERVER.serverURL;
    serverInfo.current = OSM_TILE_SERVER.serverInfo;
    setError('name', false);
    setFormKey((k) => k + 1);
    setOsmConfirmOpen(false);
  };

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
      {!props.tileServer.uuid && (
        <Stack sx={{ marginBottom: '8px' }}>
          <TsButton
            variant="outlined"
            data-tid="useOpenStreetMapTID"
            onClick={() => setOsmConfirmOpen(true)}
          >
            {t('core:tileServerUseOpenStreetMap')}
          </TsButton>
        </Stack>
      )}
      <FormControl fullWidth={true} error={haveError('name')}>
        <TsTextField
          key={'name-' + formKey}
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
          key={'url-' + formKey}
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
      </FormControl>
      <FormControl fullWidth={true}>
        <TsTextField
          key={'info-' + formKey}
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
      <TsDialogActions sx={{ justifyContent: 'space-between' }}>
        <div>
          <TsIconButton
            tooltip={t('core:documentation')}
            data-tid="tileServerHelpTID"
            onClick={() => openUrl(Links.documentationLinks.mapTiles)}
            aria-label="help"
          >
            <HelpIcon />
          </TsIconButton>
          {props.tileServer.uuid && (
            <TsButton
              sx={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}
              data-tid="deleteTileServerTID"
              onClick={() => {
                dispatch(
                  SettingsActions.deleteTileServer(props.tileServer.uuid),
                );
                props.onClose();
              }}
            >
              {t('core:delete')}
            </TsButton>
          )}
        </div>
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
      <Dialog
        open={osmConfirmOpen}
        onClose={() => setOsmConfirmOpen(false)}
        keepMounted={false}
        sx={{ zIndex: 1301 }}
      >
        <TsDialogTitle
          dialogTitle={t('core:tileServerOsmConfirmTitle')}
          closeButtonTestId="closeOsmConfirmTID"
          onClose={() => setOsmConfirmOpen(false)}
        />
        <DialogContent>
          <DialogContentText>
            {t('core:tileServerOsmConfirmText')}
          </DialogContentText>
          <TsButton
            variant="text"
            sx={{ marginTop: '8px', paddingLeft: 0 }}
            onClick={() => openUrl(OSM_PRIVACY_URL)}
          >
            {t('core:tileServerOsmPrivacyPolicy')}
          </TsButton>
        </DialogContent>
        <TsDialogActions>
          <TsButton
            data-tid="cancelOsmConfirmTID"
            onClick={() => setOsmConfirmOpen(false)}
          >
            {t('core:cancel')}
          </TsButton>
          <TsButton
            data-tid="acceptOsmConfirmTID"
            onClick={applyOsmDefaults}
            sx={{ marginLeft: AppConfig.defaultSpaceBetweenButtons }}
            variant="contained"
          >
            {t('core:tileServerOsmConfirmAccept')}
          </TsButton>
        </TsDialogActions>
      </Dialog>
    </Dialog>
  );
}

export default MapTileServerDialog;
