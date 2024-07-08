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

import React, {
  ChangeEvent,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
  getMetaFileLocationForFile,
  extractTitle,
} from '@tagspaces/tagspaces-common/paths';
import L from 'leaflet';
import {
  Grid,
  FormControl,
  Typography,
  TextField,
  inputBaseClasses,
  Button,
  InputAdornment,
  Popover,
  Box,
} from '@mui/material';
import Tooltip from '-/components/Tooltip';
import Stack from '@mui/material/Stack';
import {
  LinkIcon,
  LocalLocationIcon,
  CloudLocationIcon,
  IDIcon,
} from '-/components/CommonIcons';
import InfoIcon from '-/components/InfoIcon';
import QRCodeIcon from '@mui/icons-material/QrCode';
import ColorPaletteIcon from '@mui/icons-material/ColorLens';
import SetBackgroundIcon from '@mui/icons-material/OpacityOutlined';
import ClearBackgroundIcon from '@mui/icons-material/FormatColorResetOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  AttributionControl,
  MapContainer,
  LayerGroup,
  Marker,
  Popup,
  TileLayer,
} from 'react-leaflet';
import { ButtonGroup, IconButton } from '@mui/material';
import { formatBytes } from '@tagspaces/tagspaces-common/misc';
import {
  extractContainingDirectoryPath,
  extractFileName,
  extractDirectoryName,
} from '@tagspaces/tagspaces-common/paths';
import TagDropContainer from './TagDropContainer';
import MoveCopyFilesDialog from './dialogs/MoveCopyFilesDialog';
import {
  fileNameValidation,
  dirNameValidation,
  getAllTags,
  openUrl,
} from '-/services/utils-io';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { parseGeoLocation } from '-/utils/geo';
import { Pro } from '../pro';
import TagsSelect from './TagsSelect';
import TransparentBackground from './TransparentBackground';
import MarkerIcon from '-/assets/icons/marker-icon.png';
import Marker2xIcon from '-/assets/icons/marker-icon-2x.png';
import MarkerShadowIcon from '-/assets/icons/marker-shadow.png';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import { TS } from '-/tagspaces.namespace';
import NoTileServer from '-/components/NoTileServer';
import { ProTooltip } from '-/components/HelperComponents';
import PerspectiveSelector from '-/components/PerspectiveSelector';
import FormHelperText from '@mui/material/FormHelperText';
import LinkGeneratorDialog from '-/components/dialogs/LinkGeneratorDialog';
import { useTranslation } from 'react-i18next';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { generateClipboardLink } from '-/utils/dom';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';

const PREFIX = 'EntryProperties';

const classes = {
  entryProperties: `${PREFIX}-entryProperties`,
  tags: `${PREFIX}-tags`,
  editTagsButton: `${PREFIX}-editTagsButton`,
  textField: `${PREFIX}-textField`,
  dropText: `${PREFIX}-dropText`,
  propertyName: `${PREFIX}-propertyName`,
  actionPlaceholder: `${PREFIX}-actionPlaceholder`,
  button: `${PREFIX}-button`,
  mdHelpers: `${PREFIX}-mdHelpers`,
  formControl: `${PREFIX}-formControl`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.tags}`]: {
    padding: '5px 5px 2px 2px',
    margin: 6,
    clear: 'both',
    boxShadow:
      '0 1px 1px 0 rgba(0,0,0,0.16),0 1px 1px 0 rgba(239,239,239,0.12)',
  },

  [`& .${classes.editTagsButton}`]: {
    float: 'right',
    margin: '0 0 10px 0',
  },

  [`& .${classes.textField}`]: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '100vh',
  },

  [`& .${classes.dropText}`]: {
    display: 'flex',
    width: '100%',
    padding: '20px',
    color: '#728496',
  },

  [`& .${classes.propertyName}`]: {
    marginTop: 10,
  },

  [`& .${classes.actionPlaceholder}`]: {
    textAlign: 'end',
  },

  [`& .${classes.button}`]: {
    position: 'relative',
    padding: '8px 12px 6px 8px',
    margin: '0',
  },

  [`& .${classes.mdHelpers}`]: {
    borderRadius: '0.25rem',
    paddingLeft: '0.25rem',
    paddingRight: '0.25rem',
    backgroundColor: '#bcc0c561',
  },
  [`& .${classes.formControl}`]: {
    marginLeft: theme.spacing(0),
    width: '100%',
  },
}));

const ThumbnailTextField = styled(TextField)(({ theme }) => ({
  //[`& .MuiInputBase-root}`]: {
  [`& .${inputBaseClasses.root}`]: {
    height: 220,
  },
}));

const ThumbnailChooserDialog =
  Pro && Pro.UI ? Pro.UI.ThumbnailChooserDialog : false;
const CustomBackgroundDialog =
  Pro && Pro.UI ? Pro.UI.CustomBackgroundDialog : false;
const BgndImgChooserDialog =
  Pro && Pro.UI ? Pro.UI.BgndImgChooserDialog : false;

interface Props {
  tileServer: TS.MapTileServer;
}

const defaultBackgrounds = [
  'transparent',
  '#00000044',
  '#ac725e44',
  '#f83a2244',
  '#ff753744',
  '#ffad4644',
  '#42d69244',
  '#00800044',
  '#7bd14844',
  '#fad16544',
  '#92e1c044',
  '#9fe1e744',
  '#9fc6e744',
  '#4986e744',
  '#9a9cff44',
  '#c2c2c244',
  '#cca6ac44',
  '#f691b244',
  '#cd74e644',
  '#a47ae244',
  '#845EC260',
  '#D65DB160',
  '#FF6F9160',
  '#FF967160',
  '#FFC75F60',
  '#F9F87160',
  '#008E9B60',
  '#008F7A60',
  'linear-gradient(43deg, rgb(65, 88, 208) 0%, rgb(200, 80, 190) 45%, rgb(255, 204, 112) 100%)',
  'linear-gradient( 102deg,  rgba(253,189,85,1) 8%, rgba(249,131,255,1) 100% )',
  'radial-gradient( circle farthest-corner at 1.4% 2.8%,  rgba(240,249,249,1) 0%, rgba(182,199,226,1) 100% )',
  'linear-gradient( 110deg,  rgba(48,207,208,1) 11.2%, rgba(51,8,103,1) 90% )',
];

function EntryProperties(props: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { openedEntry, sharingLink, getOpenedDirProps } =
    useOpenedEntryContext();
  const { isEditMode } = useFilePropertiesContext();
  const {
    renameDirectory,
    renameFile,
    setBackgroundColorChange,
    saveDirectoryPerspective,
  } = useIOActionsContext();
  const { addTags, removeTags, removeAllTags } = useTaggingActionsContext();
  const { findLocation, readOnlyMode } = useCurrentLocationContext();
  const { showNotification } = useNotificationContext();

  const dirProps = useRef<TS.DirProp>(undefined);
  const fileNameRef = useRef<HTMLInputElement>(null);
  const sharingLinkRef = useRef<HTMLInputElement>(null);
  const disableConfirmButton = useRef<boolean>(true);
  const fileNameError = useRef<boolean>(false);
  const location = findLocation(openedEntry.locationID);

  const entryName = openedEntry
    ? openedEntry.isFile
      ? extractFileName(openedEntry.path, location?.getDirSeparator())
      : extractDirectoryName(openedEntry.path, location?.getDirSeparator())
    : '';

  const [editName, setEditName] = useState<string>(undefined);
  const [isMoveCopyFilesDialogOpened, setMoveCopyFilesDialogOpened] =
    useState<boolean>(false);
  const [isConfirmResetColorDialogOpened, setConfirmResetColorDialogOpened] =
    useState<boolean>(false);
  const [isFileThumbChooseDialogOpened, setFileThumbChooseDialogOpened] =
    useState<boolean>(false);
  const [showSharingLinkDialog, setShowSharingLinkDialog] =
    useState<boolean>(false);
  const [isBgndImgChooseDialogOpened, setBgndImgChooseDialogOpened] =
    useState<boolean>(false);
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  const [popoverAnchorEl, setPopoverAnchorEl] =
    React.useState<HTMLElement | null>(null);

  const popoverOpen = Boolean(popoverAnchorEl);
  const popoverId = popoverOpen ? 'popoverBackground' : undefined;

  const handlePopeverClick = (event: React.MouseEvent<HTMLElement>) => {
    setPopoverAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setPopoverAnchorEl(null);
  };

  useEffect(() => {
    if (editName === entryName && fileNameRef.current) {
      fileNameRef.current.focus();
    }
  }, [editName]);

  const renameEntry = () => {
    if (editName !== undefined) {
      const path = extractContainingDirectoryPath(
        openedEntry.path,
        location?.getDirSeparator(),
      );
      const nextPath = path + location.getDirSeparator() + editName;

      if (openedEntry.isFile) {
        renameFile(openedEntry.path, nextPath, openedEntry.locationID).catch(
          () => {
            fileNameRef.current.value = entryName;
          },
        );
      } else {
        renameDirectory(
          openedEntry.path,
          editName,
          openedEntry.locationID,
        ).catch(() => {
          fileNameRef.current.value = entryName;
        });
      }

      setEditName(undefined);
    }
  };

  const activateEditNameField = () => {
    if (readOnlyMode) {
      setEditName(undefined);
      return;
    }
    setEditName(entryName);
  };

  const deactivateEditNameField = () => {
    setEditName(undefined);
    fileNameError.current = false;
    if (fileNameRef) {
      fileNameRef.current.value = entryName;
    }
  };

  const toggleMoveCopyFilesDialog = () => {
    /*props.setSelectedEntries([
      { name: '', isFile: true, tags: [], ...openedEntry.current }
    ]);*/
    setMoveCopyFilesDialogOpened(!isMoveCopyFilesDialogOpened);
  };

  const toggleThumbFilesDialog = () => {
    if (!Pro) {
      showNotification(t('core:thisFunctionalityIsAvailableInPro'));
      return true;
    }
    if (!isEditMode && editName === undefined) {
      setFileThumbChooseDialogOpened(!isFileThumbChooseDialogOpened);
    }
  };

  const toggleBgndImgDialog = () => {
    if (!Pro) {
      showNotification(t('core:thisFunctionalityIsAvailableInPro'));
      return true;
    }
    if (!isEditMode && editName === undefined) {
      setBgndImgChooseDialogOpened(!isBgndImgChooseDialogOpened);
    }
  };

  const fileSize = () => {
    if (openedEntry.isFile) {
      return formatBytes(openedEntry.size);
    } else if (dirProps.current) {
      return formatBytes(dirProps.current.totalSize);
    }
    return t(location.haveObjectStoreSupport() ? 'core:notAvailable' : '?');
  };

  const toggleBackgroundColorPicker = () => {
    if (readOnlyMode) {
      return;
    }
    if (!Pro) {
      showNotification(t('core:thisFunctionalityIsAvailableInPro'));
      return;
    }
    /*if (!Pro.MetaOperations) {
      showNotification(t('Saving color not supported'));
      return;
    }*/
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleChangeColor = (color) => {
    if (color === 'transparent0') {
      // eslint-disable-next-line no-param-reassign
      color = 'transparent';
    }
    //openedEntry.color = color;
    setBackgroundColorChange(openedEntry, color).then(() => {
      openedEntry.meta = { ...openedEntry.meta, color };
    });
  };

  const handleFileNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'name') {
      const initValid = disableConfirmButton.current;
      let noValid;
      if (openedEntry.isFile) {
        noValid = fileNameValidation(value);
      } else {
        noValid = dirNameValidation(value);
      }
      disableConfirmButton.current = noValid;
      if (noValid || initValid !== noValid) {
        fileNameError.current = noValid;
      }
      setEditName(value);
    }
  };

  const handleChange = (name: string, value: Array<TS.Tag>, action: string) => {
    if (action === 'remove-value') {
      if (!value) {
        // no tags left in the select element
        return removeAllTags([openedEntry.path]);
      } else {
        return removeTags([openedEntry.path], value);
      }
    } else if (action === 'clear') {
      return removeAllTags([openedEntry.path]);
    }
    // create-option or select-option
    const tags =
      openedEntry.tags === undefined
        ? value
        : value.filter(
            (tag) => !openedEntry.tags.some((obj) => obj.title === tag.title),
          );
    return addTags([openedEntry.path], tags);
  };

  if (!openedEntry || !openedEntry.path || openedEntry.path === '') {
    return <div />;
  }

  const ldtm = openedEntry.lmdt
    ? new Date(openedEntry.lmdt)
        .toISOString()
        .substring(0, 19)
        .split('T')
        .join(' ')
    : ' ';

  const changePerspective = (event: any) => {
    const perspective = event.target.value;
    openedEntry.meta = {
      ...(openedEntry.meta && openedEntry.meta),
      perspective,
    };
    saveDirectoryPerspective(openedEntry, perspective, openedEntry.locationID);
    /*.then((entryMeta: TS.FileSystemEntryMeta) => {
        openedEntry.meta = entryMeta;
        //return updateOpenedFile(openedEntry.path, entryMeta);
      })
      .catch((error) => {
        console.warn('Error saving perspective for folder ' + error);
        showNotification(t('Error saving perspective for folder'));
      });*/
  };

  let perspectiveDefault;
  if (openedEntry.meta && openedEntry.meta.perspective) {
    perspectiveDefault = openedEntry.meta.perspective; // props.perspective;
  } else {
    perspectiveDefault = 'unspecified'; // perspectives.DEFAULT;
  }

  // https://github.com/Leaflet/Leaflet/blob/main/src/layer/marker/Icon.Default.js#L22
  const iconFileMarker = new L.Icon({
    iconUrl: MarkerIcon,
    iconRetinaUrl: Marker2xIcon,
    shadowUrl: MarkerShadowIcon,
    tooltipAnchor: [16, -28],
    iconSize: [25, 41], // size of the icon
    shadowSize: [41, 41], // size of the shadow
    iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
    shadowAnchor: [5, 41], // the same for the shadow
    popupAnchor: [1, -34], // point from which the popup should open relative to the iconAnchor
  });

  function getGeoLocation(tags: Array<TS.Tag>) {
    if (!Pro) {
      return;
    }
    if (tags) {
      for (let i = 0; i < tags.length; i += 1) {
        const location = parseGeoLocation(tags[i].title);
        if (location !== undefined) {
          return location;
        }
      }
    }
  }

  const geoLocation: any = getGeoLocation(
    openedEntry.isFile ? openedEntry.tags : openedEntry.meta?.tags,
  );

  const isCloudLocation = openedEntry.url && openedEntry.url.length > 5;

  const showLinkForDownloading = isCloudLocation && openedEntry.isFile;

  const thumbUrl = location.getThumbPath(
    openedEntry.meta?.thumbPath,
    openedEntry.meta?.lastUpdated,
  );
  const backgroundUrl = location.getFolderBgndPath(
    openedEntry.path,
    openedEntry.meta?.lastUpdated,
  );

  return (
    <Root>
      <Grid container>
        <Grid item xs={12}>
          <TextField
            error={fileNameError.current}
            label={
              openedEntry.isFile ? t('core:fileName') : t('core:folderName')
            }
            InputProps={{
              readOnly: editName === undefined,
              endAdornment: (
                <InputAdornment position="end">
                  {!readOnlyMode && !isEditMode && (
                    <div style={{ textAlign: 'right' }}>
                      {editName !== undefined ? (
                        <div>
                          <Button
                            data-tid="cancelRenameEntryTID"
                            onClick={deactivateEditNameField}
                          >
                            {t('core:cancel')}
                          </Button>
                          <Button
                            data-tid="confirmRenameEntryTID"
                            color="primary"
                            onClick={renameEntry}
                            disabled={disableConfirmButton.current}
                          >
                            {t('core:confirmSaveButton')}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          data-tid="startRenameEntryTID"
                          color="primary"
                          onClick={activateEditNameField}
                        >
                          {t('core:rename')}
                        </Button>
                      )}
                    </div>
                  )}
                </InputAdornment>
              ),
            }}
            margin="dense"
            name="name"
            fullWidth={true}
            data-tid="fileNameProperties"
            defaultValue={entryName} // openedEntry.current.name}
            inputRef={fileNameRef}
            onClick={() => {
              if (!isEditMode && editName === undefined) {
                activateEditNameField();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !fileNameError.current) {
                renameEntry();
              }
            }}
            onChange={handleFileNameChange}
          />
          {fileNameError.current && (
            <FormHelperText>
              {t(
                'core:' +
                  (openedEntry.isFile ? 'fileNameHelp' : 'directoryNameHelp'),
              )}
            </FormHelperText>
          )}
        </Grid>
        <Grid item xs={12} style={{ marginTop: 10 }}>
          <TagDropContainer entryPath={openedEntry.path}>
            <TagsSelect
              label={t('core:fileTags')}
              dataTid="PropertiesTagsSelectTID"
              placeholderText={t('core:dropHere')}
              /*isReadOnlyMode={
                isReadOnlyMode ||
                openedEntry.current.editMode ||
                editName !== undefined
              }*/
              tags={getAllTags(openedEntry)}
              tagMode="default"
              handleChange={handleChange}
              selectedEntryPath={openedEntry.path}
            />
          </TagDropContainer>
        </Grid>

        {geoLocation && (
          <Grid item xs={12}>
            <MapContainer
              tap={true}
              style={{
                height: '200px',
                width: '99%',
                margin: 2,
                marginTop: 8,
                borderRadius: 5,
                border: '1px solid rgba(0, 0, 0, 0.38)',
              }}
              doubleClickZoom={true}
              keyboard={false}
              dragging={true}
              center={geoLocation}
              zoom={13}
              scrollWheelZoom={false}
              zoomControl={true}
              attributionControl={false}
            >
              {props.tileServer ? (
                <TileLayer
                  attribution={props.tileServer.serverInfo}
                  url={props.tileServer.serverURL}
                />
              ) : (
                <NoTileServer />
              )}
              <LayerGroup>
                <Marker
                  icon={iconFileMarker}
                  position={[geoLocation.lat, geoLocation.lng]}
                >
                  <Popup>
                    <Typography
                      style={{ margin: 0, color: theme.palette.text.primary }}
                    >
                      {t('core:lat') + ' : ' + geoLocation.lat}
                      <br />
                      {t('core:lat') + ' : ' + geoLocation.lng}
                    </Typography>
                    <br />
                    <ButtonGroup>
                      <Button
                        size="small"
                        color="primary"
                        variant="outlined"
                        onClick={() => {
                          openUrl(
                            'https://www.openstreetmap.org/?mlat=' +
                              geoLocation.lat +
                              '&mlon=' +
                              geoLocation.lng +
                              '#map=14/' +
                              geoLocation.lat +
                              '/' +
                              geoLocation.lng,
                          );
                        }}
                        title="Open in OpenStreetMap"
                      >
                        Open in
                        <br />
                        OpenStreetMap
                      </Button>
                      <Button
                        size="small"
                        color="primary"
                        variant="outlined"
                        onClick={() => {
                          openUrl(
                            'https://maps.google.com/?q=' +
                              geoLocation.lat +
                              ',' +
                              geoLocation.lng +
                              '&ll=' +
                              geoLocation.lat +
                              ',' +
                              geoLocation.lng +
                              '&z=15',
                          );
                        }}
                      >
                        Open in
                        <br />
                        Google Maps
                      </Button>
                    </ButtonGroup>
                  </Popup>
                </Marker>
              </LayerGroup>
              <AttributionControl position="bottomright" prefix="" />
            </MapContainer>
          </Grid>
        )}

        <Grid container item xs={12} spacing={1}>
          <Grid item xs={6}>
            <TextField
              margin="dense"
              fullWidth={true}
              value={ldtm}
              label={t('core:fileLDTM')}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <Tooltip
              title={
                !location.haveObjectStoreSupport() &&
                dirProps.current &&
                !openedEntry.isFile &&
                dirProps.current.dirsCount +
                  ' ' +
                  t('core:directories') +
                  ', ' +
                  dirProps.current.filesCount +
                  ' ' +
                  t('core:files')
              }
            >
              <TextField
                margin="dense"
                fullWidth={true}
                value={fileSize()}
                label={t('core:fileSize')}
                InputProps={{
                  readOnly: true,
                  ...(!openedEntry.isFile && {
                    endAdornment: (
                      <RefreshIcon
                        onClick={() =>
                          getOpenedDirProps().then((props) => {
                            dirProps.current = props;
                            forceUpdate();
                          })
                        }
                      />
                    ),
                  }),
                }}
              />
            </Tooltip>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth={true} className={classes.formControl}>
            <TextField
              margin="dense"
              name="path"
              title={openedEntry.url || openedEntry.path}
              fullWidth={true}
              label={t('core:filePath')}
              data-tid="filePathProperties"
              value={openedEntry.path || ''}
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    {isCloudLocation ? (
                      <CloudLocationIcon
                        style={{ color: theme.palette.text.secondary }}
                      />
                    ) : (
                      <LocalLocationIcon
                        style={{ color: theme.palette.text.secondary }}
                      />
                    )}
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {!readOnlyMode && !isEditMode && editName === undefined && (
                      <Button
                        data-tid="moveCopyEntryTID"
                        color="primary"
                        onClick={toggleMoveCopyFilesDialog}
                      >
                        {t('core:move')}
                      </Button>
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
        </Grid>

        <Grid
          container
          item
          xs={12}
          spacing={1}
          alignItems="center"
          justifyContent="center"
        >
          <Grid item xs={showLinkForDownloading ? 8 : 12}>
            <TextField
              data-tid="sharingLinkTID"
              margin="dense"
              name="path"
              label={
                <>
                  {t('core:sharingLink')}
                  <InfoIcon tooltip={t('core:sharingLinkTooltip')} />
                </>
              }
              fullWidth={true}
              value={sharingLink}
              inputRef={sharingLinkRef}
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkIcon style={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={t('core:copyLinkToClipboard')}>
                      <Button
                        data-tid="copyLinkToClipboardTID"
                        color="primary"
                        onClick={() => {
                          const entryTitle = extractTitle(
                            openedEntry.name,
                            !openedEntry.isFile,
                            location?.getDirSeparator(),
                          );
                          const clibboardItem = generateClipboardLink(
                            sharingLink,
                            entryTitle,
                          );
                          const promise =
                            navigator.clipboard.write(clibboardItem);
                          showNotification(t('core:linkCopied'));
                        }}
                      >
                        {t('core:copy')}
                      </Button>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {showLinkForDownloading && (
            <Grid item xs={4}>
              <TextField
                margin="dense"
                name="downloadLink"
                label={
                  <>
                    {t('core:downloadLink')}
                    <InfoIcon tooltip={t('core:downloadLinkTooltip')} />
                  </>
                }
                fullWidth
                value={' '}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start" style={{ width: '100%' }}>
                      <Tooltip title={t('core:generateDownloadLink')}>
                        <Button
                          onClick={() => setShowSharingLinkDialog(true)}
                          startIcon={
                            <QRCodeIcon
                              style={{ color: theme.palette.text.secondary }}
                            />
                          }
                        >
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {t('core:generateDownloadLink')}
                          </span>
                        </Button>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          )}
        </Grid>

        {!openedEntry.isFile && (
          <Grid item xs={12} style={{ marginTop: 10 }}>
            <PerspectiveSelector
              onChange={changePerspective}
              defaultValue={perspectiveDefault}
              label={t('core:choosePerspective')}
              testId="changePerspectiveTID"
            />
          </Grid>
        )}

        {!openedEntry.isFile && (
          <Grid item xs={12} style={{ marginTop: 5 }}>
            <TextField
              margin="dense"
              name="path"
              label={
                <>
                  {t('core:backgroundColor')}
                  <InfoIcon
                    tooltip={t(
                      'The background color will not be visible if you have set a background image',
                    )}
                  />
                </>
              }
              fullWidth
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start" style={{ marginTop: 10 }}>
                    <TransparentBackground>
                      <Tooltip title={t('editBackgroundColor')}>
                        <Button
                          fullWidth
                          style={{
                            width: 140,
                            background: openedEntry.meta?.color,
                          }}
                          onClick={toggleBackgroundColorPicker}
                        >
                          &nbsp;
                        </Button>
                      </Tooltip>
                    </TransparentBackground>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Box>
                      <ProTooltip tooltip={t('changeBackgroundColor')}>
                        <IconButton
                          data-tid="changeBackgroundColorTID"
                          aria-describedby={popoverId}
                          onClick={handlePopeverClick}
                          disabled={!Pro}
                        >
                          <ColorPaletteIcon />
                        </IconButton>
                      </ProTooltip>
                      <Popover
                        open={popoverOpen}
                        onClose={handlePopoverClose}
                        anchorEl={popoverAnchorEl}
                        id={popoverId}
                        anchorOrigin={{
                          vertical: 'top',
                          horizontal: 'center',
                        }}
                        transformOrigin={{
                          vertical: 'bottom',
                          horizontal: 'center',
                        }}
                      >
                        <Box style={{ padding: 10 }}>
                          {defaultBackgrounds.map((background, cnt) => (
                            <>
                              <IconButton
                                key={cnt}
                                data-tid={'backgroundTID' + cnt}
                                aria-label="changeFolderBackround"
                                onClick={() => {
                                  handleChangeColor(background);
                                  handlePopoverClose();
                                }}
                                style={{
                                  backgroundColor: background,
                                  backgroundImage: background,
                                  margin: 5,
                                }}
                              >
                                <SetBackgroundIcon />
                              </IconButton>
                              {cnt % 4 === 3 && <br />}
                            </>
                          ))}
                        </Box>
                      </Popover>
                    </Box>
                    {openedEntry.meta && openedEntry.meta.color && (
                      <>
                        <ProTooltip tooltip={t('clearFolderColor')}>
                          <IconButton
                            data-tid={'backgroundClearTID'}
                            disabled={!Pro}
                            aria-label="clear"
                            onClick={() =>
                              setConfirmResetColorDialogOpened(true)
                            }
                          >
                            <ClearBackgroundIcon />
                          </IconButton>
                        </ProTooltip>
                      </>
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        )}
        <Grid container item xs={12} spacing={1}>
          <Grid item xs={openedEntry.isFile ? 12 : 6}>
            <ThumbnailTextField
              margin="dense"
              label={t('core:thumbnail')}
              fullWidth
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="end">
                    <Stack
                      direction="column"
                      spacing={1}
                      style={{ alignItems: 'center' }}
                    >
                      {!readOnlyMode &&
                        !isEditMode &&
                        editName === undefined && (
                          <ProTooltip tooltip={t('changeThumbnail')}>
                            <Button
                              data-tid="changeThumbnailTID"
                              fullWidth
                              onClick={toggleThumbFilesDialog}
                            >
                              {t('core:change')}
                            </Button>
                          </ProTooltip>
                        )}
                      <div
                        role="button"
                        tabIndex={0}
                        style={{
                          backgroundSize: 'cover',
                          backgroundRepeat: 'no-repeat',
                          backgroundImage: thumbUrl
                            ? 'url("' + thumbUrl + '")'
                            : '',
                          backgroundPosition: 'center',
                          borderRadius: 8,
                          minHeight: 150,
                          minWidth: 150,
                          marginBottom: 5,
                        }}
                        onClick={toggleThumbFilesDialog}
                      />
                    </Stack>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          {!openedEntry.isFile && (
            <Grid item xs={6}>
              <ThumbnailTextField
                margin="dense"
                label={t('core:backgroundImage')}
                fullWidth
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="end">
                      <Stack
                        direction="column"
                        spacing={1}
                        style={{ alignItems: 'center' }}
                      >
                        {!readOnlyMode &&
                          !isEditMode &&
                          editName === undefined && (
                            <ProTooltip tooltip={t('changeBackgroundImage')}>
                              <Button
                                data-tid="changeBackgroundImageTID"
                                fullWidth
                                onClick={toggleBgndImgDialog}
                              >
                                {t('core:change')}
                              </Button>
                            </ProTooltip>
                          )}
                        <div
                          data-tid="propsBgnImageTID"
                          role="button"
                          tabIndex={0}
                          style={{
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat',
                            backgroundImage: 'url("' + backgroundUrl + '")',
                            backgroundPosition: 'center',
                            borderRadius: 8,
                            minHeight: 150,
                            minWidth: 150,
                            marginBottom: 5,
                          }}
                          onClick={toggleBgndImgDialog}
                        />
                      </Stack>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          )}
        </Grid>
      </Grid>
      <Grid
        container
        item
        xs={12}
        spacing={1}
        alignItems="center"
        justifyContent="center"
      >
        <Grid item xs={12}>
          <TextField
            data-tid="entryIDTID"
            margin="dense"
            name="path"
            label={
              <>
                {t('core:entryId')}
                <InfoIcon tooltip={t('core:entryIdTooltip')} />
              </>
            }
            fullWidth={true}
            value={openedEntry?.meta?.id}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <IDIcon style={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={t('core:copyIdToClipboard')}>
                    <Button
                      data-tid="copyIdToClipboardTID"
                      color="primary"
                      disabled={!openedEntry?.meta?.id}
                      onClick={() => {
                        const entryId = openedEntry?.meta?.id;
                        if (entryId) {
                          const clibboardItem = generateClipboardLink(
                            entryId,
                            entryId,
                          );
                          const promise =
                            navigator.clipboard.write(clibboardItem);
                          showNotification(t('core:entryIdCopied'));
                        }
                      }}
                    >
                      {t('core:copy')}
                    </Button>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
      {isConfirmResetColorDialogOpened && (
        <ConfirmDialog
          open={isConfirmResetColorDialogOpened}
          onClose={() => {
            setConfirmResetColorDialogOpened(false);
          }}
          title={t('core:confirm')}
          content={t('core:confirmResetColor')}
          confirmCallback={(result) => {
            if (result) {
              handleChangeColor('transparent');
            } else {
              setConfirmResetColorDialogOpened(false);
            }
          }}
          cancelDialogTID="cancelConfirmResetColorDialog"
          confirmDialogTID="confirmConfirmResetColorDialog"
          confirmDialogContentTID="confirmResetColorDialogContent"
        />
      )}
      {isMoveCopyFilesDialogOpened && (
        <MoveCopyFilesDialog
          key={getUuid()}
          open={isMoveCopyFilesDialogOpened}
          onClose={toggleMoveCopyFilesDialog}
          entries={[
            {
              ...openedEntry,
              isFile: openedEntry.isFile,
              name: entryName,
              tags: [],
            },
          ]}
        />
      )}
      {ThumbnailChooserDialog && (
        <ThumbnailChooserDialog
          open={isFileThumbChooseDialogOpened}
          onClose={toggleThumbFilesDialog}
          entry={openedEntry as TS.FileSystemEntry}
        />
      )}
      {showSharingLinkDialog && (
        <LinkGeneratorDialog
          open={showSharingLinkDialog}
          onClose={() => setShowSharingLinkDialog(false)}
        />
      )}
      {BgndImgChooserDialog && (
        <BgndImgChooserDialog
          open={isBgndImgChooseDialogOpened}
          onClose={toggleBgndImgDialog}
          entry={openedEntry as TS.FileSystemEntry}
        />
      )}
      {CustomBackgroundDialog && (
        <CustomBackgroundDialog
          color={openedEntry.meta?.color}
          open={displayColorPicker}
          setColor={handleChangeColor}
          onClose={toggleBackgroundColorPicker}
          currentDirectoryPath={openedEntry.path}
        />
      )}
    </Root>
  );
}

export default EntryProperties;
