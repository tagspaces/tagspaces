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
  getBgndFileLocationForDirectory,
  getMetaFileLocationForFile,
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
} from '@mui/material';
import QRCodeIcon from '@mui/icons-material/QrCode';
import Tooltip from '-/components/Tooltip';
import { LocalLocationIcon, CloudLocationIcon } from '-/components/CommonIcons';
import Stack from '@mui/material/Stack';
import SetBackgroundIcon from '@mui/icons-material/OpacityOutlined';
import ClearBackgroundIcon from '@mui/icons-material/FormatColorResetOutlined';
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
  getThumbFileLocationForFile,
  getThumbFileLocationForDirectory,
  extractFileName,
  extractDirectoryName,
} from '@tagspaces/tagspaces-common/paths';
import TagDropContainer from './TagDropContainer';
import MoveCopyFilesDialog from './dialogs/MoveCopyFilesDialog';
import {
  fileNameValidation,
  dirNameValidation,
  normalizeUrl,
} from '-/services/utils-io';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { parseGeoLocation } from '-/utils/geo';
import { Pro } from '../pro';
import PlatformIO from '../services/platform-facade';
import TagsSelect from './TagsSelect';
import TransparentBackground from './TransparentBackground';
import { getThumbnailURLPromise } from '-/services/thumbsgenerator';
import {
  AppDispatch,
  getLastBackgroundImageChange,
  getLastThumbnailImageChange,
} from '-/reducers/app';
import MarkerIcon from '-/assets/icons/marker-icon.png';
import Marker2xIcon from '-/assets/icons/marker-icon-2x.png';
import MarkerShadowIcon from '-/assets/icons/marker-shadow.png';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import { TS } from '-/tagspaces.namespace';
import NoTileServer from '-/components/NoTileServer';
import InfoIcon from '-/components/InfoIcon';
import { ProTooltip } from '-/components/HelperComponents';
import PerspectiveSelector from '-/components/PerspectiveSelector';
import { useDispatch, useSelector } from 'react-redux';
import FormHelperText from '@mui/material/FormHelperText';
import { actions as AppActions } from '-/reducers/app';
import useFirstRender from '-/utils/useFirstRender';
import LinkGeneratorDialog from '-/components/dialogs/LinkGeneratorDialog';
import { LinkIcon } from '-/components/CommonIcons';
import { useTranslation } from 'react-i18next';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useFSWatcherContext } from '-/hooks/useFSWatcherContext';

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
  'linear-gradient(43deg, rgb(65, 88, 208) 0%, rgb(200, 80, 190) 45%, rgb(255, 204, 112) 100%)',
  'linear-gradient( 102deg,  rgba(253,189,85,1) 8%, rgba(249,131,255,1) 100% )',
  'radial-gradient( circle farthest-corner at 1.4% 2.8%,  rgba(240,249,249,1) 0%, rgba(182,199,226,1) 100% )',
  'linear-gradient( 110deg,  rgba(48,207,208,1) 11.2%, rgba(51,8,103,1) 90% )',
];

function EntryProperties(props: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { openedEntry, dirProps, updateOpenedFile, sharingLink } =
    useOpenedEntryContext();
  const { renameDirectory, renameFile } = useIOActionsContext();
  const { addTags, removeTags, removeAllTags } = useTaggingActionsContext();
  const {
    currentDirectoryPath,
    updateThumbnailUrl,
    setDirectoryMeta,
    setDirectoryPerspective,
  } = useDirectoryContentContext();
  const { switchLocationTypeByID, switchCurrentLocationType, readOnlyMode } =
    useCurrentLocationContext();
  const { showNotification } = useNotificationContext();
  const { ignoreByWatcher, deignoreByWatcher } = useFSWatcherContext();
  const dispatch: AppDispatch = useDispatch();

  const fileNameRef = useRef<HTMLInputElement>(null);
  const sharingLinkRef = useRef<HTMLInputElement>(null);
  // const fileDescriptionRef = useRef<MilkdownRef>(null);
  const disableConfirmButton = useRef<boolean>(true);
  const fileNameError = useRef<boolean>(false);
  //const openedEntry = openedEntries[0];
  const lastBackgroundImageChange = useSelector(getLastBackgroundImageChange);
  const lastThumbnailImageChange = useSelector(getLastThumbnailImageChange);

  const entryName = openedEntry
    ? openedEntry.isFile
      ? extractFileName(openedEntry.path, PlatformIO.getDirSeparator())
      : extractDirectoryName(openedEntry.path, PlatformIO.getDirSeparator())
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
  const bgndUrl = useRef<string>(getBgndUrl());
  const thumbUrl = useRef<string>(getThumbUrl());

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);
  const firstRender = useFirstRender();

  useEffect(() => {
    if (editName === entryName && fileNameRef.current) {
      fileNameRef.current.focus();
    }
  }, [editName]);

  useEffect(() => {
    if (!firstRender) {
      bgndUrl.current = getBgndUrl();
      forceUpdate();
    }
  }, [lastBackgroundImageChange]);

  useEffect(() => {
    if (!firstRender) {
      thumbUrl.current = getThumbUrl();
      forceUpdate();
    }
  }, [lastThumbnailImageChange]);

  const renameEntry = () => {
    if (editName !== undefined) {
      const path = extractContainingDirectoryPath(
        openedEntry.path,
        PlatformIO.getDirSeparator(),
      );
      const nextPath = path + PlatformIO.getDirSeparator() + editName;

      switchLocationTypeByID(openedEntry.locationId).then(
        (currentLocationId) => {
          if (openedEntry.isFile) {
            renameFile(openedEntry.path, nextPath)
              .then(() => switchCurrentLocationType())
              .catch(() => {
                switchCurrentLocationType();
                fileNameRef.current.value = entryName;
              });
          } else {
            renameDirectory(openedEntry.path, editName)
              .then((newDirPath) => switchCurrentLocationType())
              .catch(() => {
                switchCurrentLocationType();
                fileNameRef.current.value = entryName;
              });
          }
        },
      );

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
    if (!openedEntry.editMode && editName === undefined) {
      setFileThumbChooseDialogOpened(!isFileThumbChooseDialogOpened);
    }
  };

  const toggleBgndImgDialog = () => {
    if (!Pro) {
      showNotification(t('core:thisFunctionalityIsAvailableInPro'));
      return true;
    }
    if (!openedEntry.editMode && editName === undefined) {
      setBgndImgChooseDialogOpened(!isBgndImgChooseDialogOpened);
    }
  };

  const setThumb = (filePath, thumbFilePath) => {
    if (filePath !== undefined) {
      return switchLocationTypeByID(openedEntry.locationId).then(
        (currentLocationId) => {
          if (
            PlatformIO.haveObjectStoreSupport() ||
            PlatformIO.haveWebDavSupport()
          ) {
            updateThumbnailUrl(
              openedEntry.path,
              PlatformIO.getURLforPath(thumbFilePath),
            );
            return true;
          }
          /*return replaceThumbnailURLPromise(filePath, thumbFilePath)
          .then(objUrl => {*/
          updateThumbnailUrl(
            openedEntry.path,
            thumbFilePath,
            // objUrl.tmbPath
            /*(props.lastThumbnailImageChange
                  ? '?' + props.lastThumbnailImageChange
                  : '')*/
          );
          return switchCurrentLocationType();
        },
      );
    } else {
      // reset Thumbnail
      return getThumbnailURLPromise(openedEntry.path)
        .then((objUrl) => {
          updateThumbnailUrl(openedEntry.path, objUrl.tmbPath);
          return true;
        })
        .catch((err) => {
          console.warn('Error getThumbnailURLPromise ' + err);
          showNotification('Error reset Thumbnail');
        });
    }
  };

  const toggleBackgroundColorPicker = () => {
    if (readOnlyMode) {
      return;
    }
    if (!Pro) {
      showNotification(t('core:thisFunctionalityIsAvailableInPro'));
      return;
    }
    if (!Pro.MetaOperations) {
      showNotification(t('Saving color not supported'));
      return;
    }
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleChangeColor = (color) => {
    if (color === 'transparent0') {
      // eslint-disable-next-line no-param-reassign
      color = 'transparent';
    }
    openedEntry.color = color;
    switchLocationTypeByID(openedEntry.locationId).then((currentLocationId) => {
      Pro.MetaOperations.saveFsEntryMeta(openedEntry.path, { color })
        .then((entryMeta) => {
          if (openedEntry.path === currentDirectoryPath) {
            setDirectoryMeta(entryMeta);
          }
          // for KanBan
          dispatch(
            AppActions.setLastBackgroundColorChange(
              openedEntry.path,
              new Date().getTime(),
            ),
          );
          // todo handle LastBackgroundColorChange and skip updateOpenedFile
          updateOpenedFile(openedEntry.path, entryMeta).then(() =>
            switchCurrentLocationType(),
          );

          /* } else {
            setCurrentEntry({ ...openedEntry, color });
          } */
          return true;
        })
        .catch((error) => {
          switchCurrentLocationType();
          console.warn('Error saving color for folder ' + error);
          showNotification(t('Error saving color for folder'));
        });
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

  /*const handleDescriptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'description') {
      setEditDescription(value);
    }
  };*/

  const handleChange = (name: string, value: Array<TS.Tag>, action: string) => {
    const metaFilePath = getMetaFileLocationForFile(
      openedEntry.path,
      PlatformIO.getDirSeparator(),
    );
    // tmp fix; saving meta sidecar file is not ignored by watcher
    ignoreByWatcher(metaFilePath);
    switchLocationTypeByID(openedEntry.locationId)
      .then((currentLocationId) => {
        if (action === 'remove-value') {
          if (!value) {
            // no tags left in the select element
            return removeAllTags([openedEntry.path]).then(() =>
              updateOpenedFile(openedEntry.path, {
                id: '',
                tags: [],
              }),
            );
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
                (tag) =>
                  !openedEntry.tags.some((obj) => obj.title === tag.title),
              );
        return addTags([openedEntry.path], tags);
      })
      .then(() => {
        switchCurrentLocationType().then(() => deignoreByWatcher(metaFilePath));
      });
  };

  if (!openedEntry || !openedEntry.path || openedEntry.path === '') {
    return <div />;
  }

  function getBgndUrl() {
    if (openedEntry && !openedEntry.isFile) {
      const bgndPath = getBgndFileLocationForDirectory(
        openedEntry.path,
        PlatformIO.getDirSeparator(),
      );
      if (bgndPath !== undefined) {
        if (
          PlatformIO.haveObjectStoreSupport() ||
          PlatformIO.haveWebDavSupport()
        ) {
          return PlatformIO.getURLforPath(bgndPath);
        } else {
          return (
            normalizeUrl(bgndPath) +
            (lastBackgroundImageChange &&
            lastBackgroundImageChange.folderPath === bgndPath
              ? '?' + lastBackgroundImageChange.dt
              : '')
          );
        }
      }
    }
    return undefined;
  }

  function getThumbPath() {
    if (!openedEntry) {
      return undefined;
    }
    if (openedEntry.isFile) {
      return getThumbFileLocationForFile(
        openedEntry.path,
        PlatformIO.getDirSeparator(),
        false,
      );
    }
    return getThumbFileLocationForDirectory(
      openedEntry.path,
      PlatformIO.getDirSeparator(),
    );
  }

  function getThumbUrl() {
    const thumbPath = getThumbPath();

    if (thumbPath !== undefined) {
      if (
        PlatformIO.haveObjectStoreSupport() ||
        PlatformIO.haveWebDavSupport()
      ) {
        return PlatformIO.getURLforPath(thumbPath);
      } else {
        return (
          normalizeUrl(thumbPath) +
          (lastThumbnailImageChange &&
          lastThumbnailImageChange.thumbPath === thumbPath
            ? '?' + lastThumbnailImageChange.dt
            : '')
        );
      }
    }
    return undefined;
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
    setDirectoryPerspective(perspective, openedEntry.path, false)
      .then((entryMeta: TS.FileSystemEntryMeta) => {
        // openedEntry = {...openedEntry, perspective: perspective}
        return updateOpenedFile(openedEntry.path, entryMeta);
        // return true;
      })
      .catch((error) => {
        console.warn('Error saving perspective for folder ' + error);
        showNotification(t('Error saving perspective for folder'));
      });
  };

  let perspectiveDefault;
  if (openedEntry.perspective) {
    perspectiveDefault = openedEntry.perspective; // props.perspective;
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

  const geoLocation: any = getGeoLocation(openedEntry.tags);

  const isCloudLocation = openedEntry.url && openedEntry.url.length > 5;

  const showLinkForDownloading = isCloudLocation && openedEntry.isFile;

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
                  {!readOnlyMode && !openedEntry.editMode && (
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
              if (!openedEntry.editMode && editName === undefined) {
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
              tags={openedEntry.tags}
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
                          PlatformIO.openUrl(
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
                          PlatformIO.openUrl(
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
                !PlatformIO.haveObjectStoreSupport() &&
                (dirProps.dirsCount || dirProps.filesCount) &&
                !openedEntry.isFile &&
                dirProps.dirsCount +
                  ' ' +
                  t('core:directories') +
                  ', ' +
                  dirProps.filesCount +
                  ' ' +
                  t('core:files')
              }
            >
              <TextField
                margin="dense"
                fullWidth={true}
                value={
                  openedEntry.size
                    ? formatBytes(openedEntry.size)
                    : t(
                        PlatformIO.haveObjectStoreSupport()
                          ? 'core:notAvailable'
                          : 'core:counting',
                      )
                }
                label={t('core:fileSize')}
                InputProps={{
                  readOnly: true,
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
                    {!readOnlyMode &&
                      !openedEntry.editMode &&
                      editName === undefined && (
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
                          const promise =
                            navigator.clipboard.writeText(sharingLink);
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
                    {/* <Tooltip title={t('core:changeBackgroundColor')}> */}
                    <TransparentBackground>
                      <Button
                        fullWidth
                        style={{
                          width: 100,
                          background: openedEntry.color,
                        }}
                        onClick={toggleBackgroundColorPicker}
                      >
                        &nbsp;
                      </Button>
                    </TransparentBackground>
                    {/* </Tooltip> */}
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Stack direction="row" spacing={1}>
                      {defaultBackgrounds.map((background, cnt) => (
                        <ProTooltip tooltip={t('changeBackgroundColor')}>
                          <IconButton
                            key={cnt}
                            aria-label="fingerprint"
                            onClick={() => handleChangeColor(background)}
                            style={{
                              backgroundImage: background,
                            }}
                          >
                            <SetBackgroundIcon />
                          </IconButton>
                        </ProTooltip>
                      ))}
                      {openedEntry.color && (
                        <>
                          <ProTooltip tooltip={t('clearFolderColor')}>
                            <span>
                              <IconButton
                                disabled={!Pro}
                                aria-label="clear"
                                size="small"
                                style={{ marginTop: 5 }}
                                onClick={() =>
                                  setConfirmResetColorDialogOpened(true)
                                }
                              >
                                <ClearBackgroundIcon />
                              </IconButton>
                            </span>
                          </ProTooltip>
                        </>
                      )}
                    </Stack>
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
                        !openedEntry.editMode &&
                        editName === undefined && (
                          <ProTooltip tooltip={t('changeThumbnail')}>
                            <Button fullWidth onClick={toggleThumbFilesDialog}>
                              {t('core:change')}
                            </Button>
                            {/* <IconButton
                              disabled={!Pro}
                              color="primary"
                              className={classes.button}
                              style={{ whiteSpace: 'nowrap' }}
                              onClick={toggleThumbFilesDialog}
                            >
                              <EditIcon />
                            </IconButton> */}
                          </ProTooltip>
                        )}
                      {/* <ProTooltip tooltip={t('changeThumbnail')}> */}
                      <div
                        role="button"
                        tabIndex={0}
                        style={{
                          backgroundSize: 'cover',
                          backgroundRepeat: 'no-repeat',
                          backgroundImage: thumbUrl.current
                            ? 'url("' + thumbUrl.current + '")'
                            : '',
                          backgroundPosition: 'center',
                          borderRadius: 8,
                          minHeight: 150,
                          minWidth: 150,
                          marginBottom: 5,
                        }}
                        onClick={toggleThumbFilesDialog}
                      />
                      {/* </ProTooltip> */}
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
                          !openedEntry.editMode &&
                          editName === undefined && (
                            <ProTooltip tooltip={t('changeBackgroundImage')}>
                              <Button fullWidth onClick={toggleBgndImgDialog}>
                                {t('core:change')}
                              </Button>
                              {/* <IconButton
                                disabled={!Pro}
                                color="primary"
                                className={classes.button}
                                style={{ whiteSpace: 'nowrap' }}
                                onClick={toggleBgndImgDialog}
                              >
                                <EditIcon />
                              </IconButton> */}
                            </ProTooltip>
                          )}
                        {/* <ProTooltip tooltip={t('changeBackgroundImage')}> */}
                        <div
                          role="button"
                          tabIndex={0}
                          style={{
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat',
                            backgroundImage: bgndUrl.current
                              ? 'url("' + bgndUrl.current + '")'
                              : '',
                            backgroundPosition: 'center',
                            borderRadius: 8,
                            minHeight: 150,
                            minWidth: 150,
                            marginBottom: 5,
                          }}
                          onClick={toggleBgndImgDialog}
                        />
                        {/* </ProTooltip> */}
                      </Stack>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          )}
        </Grid>
        {/*<Grid container item xs={12} style={{ height: 150 }} />*/}
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
          selectedFile={openedEntry.path}
          thumbPath={getThumbPath()}
          setThumb={setThumb}
        />
      )}
      {showSharingLinkDialog && (
        <LinkGeneratorDialog
          open={showSharingLinkDialog}
          onClose={() => setShowSharingLinkDialog(false)}
          path={openedEntry.path}
          locationId={openedEntry.locationId}
        />
      )}
      {BgndImgChooserDialog && (
        <BgndImgChooserDialog
          open={isBgndImgChooseDialogOpened}
          onClose={toggleBgndImgDialog}
          currentDirectoryPath={openedEntry.path}
        />
      )}
      {CustomBackgroundDialog && (
        <CustomBackgroundDialog
          color={openedEntry.color}
          open={displayColorPicker}
          setColor={handleChangeColor}
          onClose={toggleBackgroundColorPicker}
          currentDirectoryPath={openedEntry.path}
          /*presetColors={[
          'transparent',
          '#FFFFFF44',
          '#00000044',
          '#ac725e44',
          '#f83a2244',
          '#fa573c44',
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
          '#a47ae244'
        ]}*/
        />
      )}
    </Root>
  );
}

export default EntryProperties;
