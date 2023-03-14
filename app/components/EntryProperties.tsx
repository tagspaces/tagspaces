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
  useState
} from 'react';
import { useStateWithCallbackLazy } from 'use-state-with-callback';
import { getBgndFileLocationForDirectory } from '@tagspaces/tagspaces-common/paths';
import L from 'leaflet';
import { Theme } from '@mui/material/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import ShareIcon from '@mui/icons-material/Link';
import Tooltip from '-/components/Tooltip';
import LocationIcon from '@mui/icons-material/WorkOutline';
import EditIcon from '@mui/icons-material/Edit';
import CloudLocationIcon from '@mui/icons-material/CloudQueue';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import SetBackgroundIcon from '@mui/icons-material/OpacityOutlined';
import ClearBackgroundIcon from '@mui/icons-material/FormatColorResetOutlined';
import {
  AttributionControl,
  Map,
  LayerGroup,
  Marker,
  Popup,
  TileLayer,
  withLeaflet
} from 'react-leaflet';
import { ButtonGroup, IconButton } from '@mui/material';
import { formatFileSize } from '@tagspaces/tagspaces-common/misc';
import {
  extractContainingDirectoryPath,
  getThumbFileLocationForFile,
  getThumbFileLocationForDirectory,
  extractFileName,
  extractDirectoryName
} from '@tagspaces/tagspaces-common/paths';
import AppConfig from '-/AppConfig';
import TagDropContainer from './TagDropContainer';
import MoveCopyFilesDialog from './dialogs/MoveCopyFilesDialog';
import i18n from '../services/i18n';
import {
  enhanceOpenedEntry,
  convertMarkDown,
  fileNameValidation,
  dirNameValidation,
  normalizeUrl
} from '-/services/utils-io';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { parseGeoLocation } from '-/utils/geo';
import { Pro } from '../pro';
import PlatformIO from '../services/platform-facade';
import TagsSelect from './TagsSelect';
import TransparentBackground from './TransparentBackground';
import { getThumbnailURLPromise } from '-/services/thumbsgenerator';
import {
  getLastBackgroundImageChange,
  getLastThumbnailImageChange,
  OpenedEntry
} from '-/reducers/app';
import { savePerspective } from '-/utils/metaoperations';
import MarkerIcon from '-/assets/icons/marker-icon.png';
import Marker2xIcon from '-/assets/icons/marker-icon-2x.png';
import MarkerShadowIcon from '-/assets/icons/marker-shadow.png';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import { TS } from '-/tagspaces.namespace';
import NoTileServer from '-/components/NoTileServer';
import InfoIcon from '-/components/InfoIcon';
import { ProTooltip } from '-/components/HelperComponents';
import PerspectiveSelector from '-/components/PerspectiveSelector';
import { connect } from 'react-redux';
import FormHelperText from '@mui/material/FormHelperText';
import { MilkdownRef } from '@tagspaces/tagspaces-md';
import EditDescription from '-/components/EditDescription';
import { bindActionCreators } from 'redux';
import { actions as LocationActions } from '-/reducers/locations';
import { actions as AppActions } from '-/reducers/app';
import useFirstRender from '-/utils/useFirstRender';
import LinkGeneratorDialog from '-/components/dialogs/LinkGeneratorDialog';

const ThumbnailChooserDialog =
  Pro && Pro.UI ? Pro.UI.ThumbnailChooserDialog : false;
const CustomBackgroundDialog =
  Pro && Pro.UI ? Pro.UI.CustomBackgroundDialog : false;
const BgndImgChooserDialog =
  Pro && Pro.UI ? Pro.UI.BgndImgChooserDialog : false;

const styles: any = (theme: any) => ({
  entryProperties: {
    overflowY: AppConfig.isFirefox ? 'auto' : 'overlay',
    overflowX: 'hidden',
    flexGrow: 1,
    padding: 7,
    paddingRight: 14,
    height: '100%'
  },
  tags: {
    padding: '5px 5px 2px 2px',
    margin: 6,
    clear: 'both',
    boxShadow: '0 1px 1px 0 rgba(0,0,0,0.16),0 1px 1px 0 rgba(239,239,239,0.12)'
  },
  editTagsButton: {
    float: 'right',
    margin: '0 0 10px 0'
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '100vh'
  },
  dropText: {
    display: 'flex',
    width: '100%',
    padding: '20px',
    color: '#728496'
  },
  propertyName: {
    marginTop: 10
  },
  actionPlaceholder: {
    textAlign: 'end'
  },
  button: {
    position: 'relative',
    padding: '8px 12px 6px 8px',
    margin: '0'
  },
  mdHelpers: {
    borderRadius: '0.25rem',
    paddingLeft: '0.25rem',
    paddingRight: '0.25rem',
    backgroundColor: '#bcc0c561'
  }
});

interface Props {
  classes: any;
  theme: any;
  openedEntry: OpenedEntry;
  renameFile: (path: string, nextPath: string) => Promise<boolean>;
  renameDirectory: (path: string, nextPath: string) => Promise<boolean>;
  showNotification: (message: string) => void;
  updateOpenedFile: (entryPath: string, fsEntryMeta: any) => Promise<boolean>;
  updateThumbnailUrl: (path: string, thumbUrl: string) => void;
  addTags: (paths: Array<string>, tags: Array<TS.Tag>) => Promise<boolean>;
  removeTags: (paths: Array<string>, tags: Array<TS.Tag>) => Promise<boolean>;
  removeAllTags: (paths: Array<string>) => Promise<boolean>;
  switchLocationType: (locationId: string) => Promise<string | null>;
  switchCurrentLocationType: (currentLocationId: string) => Promise<boolean>;
  isReadOnlyMode: boolean;
  // currentDirectoryPath: string | null;
  tagDelimiter: string;
  sharingLink: string;
  tileServer: TS.MapTileServer;
  lastBackgroundImageChange: any;
  lastThumbnailImageChange: any;
  setLastBackgroundColorChange: (
    folderPath: string,
    lastBackgroundColorChange: number
  ) => void;
}

const defaultBackgrounds = [
  'linear-gradient(43deg, rgb(65, 88, 208) 0%, rgb(200, 80, 190) 45%, rgb(255, 204, 112) 100%)',
  'linear-gradient( 102deg,  rgba(253,189,85,1) 8%, rgba(249,131,255,1) 100% )',
  'radial-gradient( circle farthest-corner at 1.4% 2.8%,  rgba(240,249,249,1) 0%, rgba(182,199,226,1) 100% )',
  'linear-gradient( 110deg,  rgba(48,207,208,1) 11.2%, rgba(51,8,103,1) 90% )'
];

function EntryProperties(props: Props) {
  // const EntryProperties = React.memo((props: Props) => {
  const fileNameRef = useRef<HTMLInputElement>(null);
  const sharingLinkRef = useRef<HTMLInputElement>(null);
  const fileDescriptionRef = useRef<MilkdownRef>(null);
  const disableConfirmButton = useRef<boolean>(true);
  const fileNameError = useRef<boolean>(false);

  const directoryPath = props.openedEntry.isFile
    ? extractContainingDirectoryPath(
        props.openedEntry.path,
        PlatformIO.getDirSeparator()
      )
    : props.openedEntry.path;

  const printHTML = () => {
    const printWin = window.open('', 'PRINT', 'height=400,width=600');
    printWin.document.write(
      '<html><head><title>' + entryName + ' description</title>'
    );
    printWin.document.write('</head><body >');
    printWin.document.write(sanitizedDescription);
    printWin.document.write('</body></html>');
    printWin.document.close(); // necessary for IE >= 10
    printWin.focus(); // necessary for IE >= 10*/
    printWin.print();
    // printWin.close();
    return true;
  };

  const entryName = props.openedEntry.isFile
    ? extractFileName(props.openedEntry.path, PlatformIO.getDirSeparator())
    : extractDirectoryName(
        props.openedEntry.path,
        PlatformIO.getDirSeparator()
      );

  const currentEntry = enhanceOpenedEntry(
    props.openedEntry,
    props.tagDelimiter
  );
  const [editName, setEditName] = useState<string>(undefined);
  const editDescription = useRef<string>(undefined);
  const [isMoveCopyFilesDialogOpened, setMoveCopyFilesDialogOpened] = useState<
    boolean
  >(false);
  const [
    isConfirmResetColorDialogOpened,
    setConfirmResetColorDialogOpened
  ] = useState<boolean>(false);
  const [
    isFileThumbChooseDialogOpened,
    setFileThumbChooseDialogOpened
  ] = useState<boolean>(false);
  const [showSharingLinkDialog, setShowSharingLinkDialog] = useState<boolean>(
    false
  );
  const [isBgndImgChooseDialogOpened, setBgndImgChooseDialogOpened] = useState<
    boolean
  >(false);
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);
  const bgndUrl = useRef<string>(getBgndUrl());
  const thumbUrl = useRef<string>(getThumbUrl());
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
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
  }, [props.lastBackgroundImageChange]);

  useEffect(() => {
    if (!firstRender) {
      thumbUrl.current = getThumbUrl();
      forceUpdate();
    }
  }, [props.lastThumbnailImageChange]);

  /*useEffect(() => {
    if (props.openedEntry != undefined && currentEntry.description) {
      const { current } = fileDescriptionRef;
      if (!current) return;
      current.update(currentEntry.description);
    }
  }, [props.openedEntry]);*/

  const renameEntry = () => {
    if (editName !== undefined) {
      const { renameFile, renameDirectory } = props;

      const path = extractContainingDirectoryPath(
        currentEntry.path,
        PlatformIO.getDirSeparator()
      );
      const nextPath = path + PlatformIO.getDirSeparator() + editName;

      props
        .switchLocationType(props.openedEntry.locationId)
        .then(currentLocationId => {
          if (currentEntry.isFile) {
            renameFile(currentEntry.path, nextPath)
              .then(() => {
                props.switchCurrentLocationType(currentLocationId);
                return true;
              })
              .catch(() => {
                props.switchCurrentLocationType(currentLocationId);
                fileNameRef.current.value = entryName;
              });
          } else {
            renameDirectory(currentEntry.path, editName)
              .then(() => {
                props.switchCurrentLocationType(currentLocationId);
                return true;
              })
              .catch(() => {
                props.switchCurrentLocationType(currentLocationId);
                fileNameRef.current.value = entryName;
              });
          }
        });

      setEditName(undefined);
    }
  };

  const activateEditNameField = () => {
    if (props.isReadOnlyMode) {
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

  const toggleEditDescriptionField = () => {
    if (props.isReadOnlyMode) {
      editDescription.current = undefined;
      return;
    }
    if (!Pro) {
      props.showNotification(i18n.t('core:thisFunctionalityIsAvailableInPro'));
      return;
    }
    if (!Pro.MetaOperations) {
      props.showNotification(i18n.t('Saving description not supported'));
      return;
    }
    if (editDescription.current !== undefined) {
      props
        .switchLocationType(props.openedEntry.locationId)
        .then(currentLocationId => {
          Pro.MetaOperations.saveFsEntryMeta(currentEntry.path, {
            description: editDescription.current
          })
            .then(entryMeta => {
              editDescription.current = undefined;
              props.updateOpenedFile(currentEntry.path, entryMeta);
              props.switchCurrentLocationType(currentLocationId);
              return true;
            })
            .catch(error => {
              console.warn('Error saving description ' + error);
              editDescription.current = undefined;
              props.switchCurrentLocationType(currentLocationId);
              props.showNotification(i18n.t('Error saving description'));
            });
        });
    } else if (currentEntry.description) {
      editDescription.current = currentEntry.description;
    } else {
      editDescription.current = '';
    }
  };

  const toggleMoveCopyFilesDialog = () => {
    setMoveCopyFilesDialogOpened(!isMoveCopyFilesDialogOpened);
  };

  const toggleThumbFilesDialog = () => {
    if (!Pro) {
      props.showNotification(i18n.t('core:thisFunctionalityIsAvailableInPro'));
      return true;
    }
    if (
      !currentEntry.editMode &&
      editName === undefined &&
      editDescription.current === undefined
    ) {
      setFileThumbChooseDialogOpened(!isFileThumbChooseDialogOpened);
    }
  };

  const toggleBgndImgDialog = () => {
    if (!Pro) {
      props.showNotification(i18n.t('core:thisFunctionalityIsAvailableInPro'));
      return true;
    }
    if (
      !currentEntry.editMode &&
      editName === undefined &&
      editDescription.current === undefined
    ) {
      setBgndImgChooseDialogOpened(!isBgndImgChooseDialogOpened);
    }
  };

  const setThumb = (filePath, thumbFilePath) => {
    if (filePath !== undefined) {
      return props
        .switchLocationType(props.openedEntry.locationId)
        .then(currentLocationId => {
          if (
            PlatformIO.haveObjectStoreSupport() ||
            PlatformIO.haveWebDavSupport()
          ) {
            props.updateThumbnailUrl(
              currentEntry.path,
              PlatformIO.getURLforPath(thumbFilePath)
            );
            return true;
          }
          /*return replaceThumbnailURLPromise(filePath, thumbFilePath)
          .then(objUrl => {*/
          props.updateThumbnailUrl(
            currentEntry.path,
            thumbFilePath
            // objUrl.tmbPath
            /*(props.lastThumbnailImageChange
                  ? '?' + props.lastThumbnailImageChange
                  : '')*/
          );
          return props.switchCurrentLocationType(currentLocationId);
          /*})
          .catch(err => {
            props.switchCurrentLocationType();
            console.warn('Error replaceThumbnailURLPromise ' + err);
            props.showNotification('Error replacing thumbnail');
          });*/
        });
    } else {
      // reset Thumbnail
      return getThumbnailURLPromise(currentEntry.path)
        .then(objUrl => {
          props.updateThumbnailUrl(currentEntry.path, objUrl.tmbPath);
          return true;
        })
        .catch(err => {
          console.warn('Error getThumbnailURLPromise ' + err);
          props.showNotification('Error reset Thumbnail');
        });
    }
  };

  const toggleBackgroundColorPicker = () => {
    if (props.isReadOnlyMode) {
      return;
    }
    if (!Pro) {
      props.showNotification(i18n.t('core:thisFunctionalityIsAvailableInPro'));
      return;
    }
    if (!Pro.MetaOperations) {
      props.showNotification(i18n.t('Saving color not supported'));
      return;
    }
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleChangeColor = color => {
    if (color === 'transparent0') {
      // eslint-disable-next-line no-param-reassign
      color = 'transparent';
    }
    props
      .switchLocationType(props.openedEntry.locationId)
      .then(currentLocationId => {
        Pro.MetaOperations.saveFsEntryMeta(currentEntry.path, { color })
          .then(entryMeta => {
            // if (props.entryPath === props.currentDirectoryPath) {
            props.setLastBackgroundColorChange(
              currentEntry.path,
              new Date().getTime()
            );
            // todo handle LastBackgroundColorChange and skip updateOpenedFile
            props.updateOpenedFile(currentEntry.path, entryMeta);
            props.switchCurrentLocationType(currentLocationId);

            /* } else {
            setCurrentEntry({ ...currentEntry, color });
          } */
            return true;
          })
          .catch(error => {
            props.switchCurrentLocationType(currentLocationId);
            console.warn('Error saving color for folder ' + error);
            props.showNotification(i18n.t('Error saving color for folder'));
          });
      });
  };

  const handleFileNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'name') {
      const initValid = disableConfirmButton.current;
      let noValid;
      if (currentEntry.isFile) {
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
    props
      .switchLocationType(props.openedEntry.locationId)
      .then(currentLocationId => {
        if (action === 'remove-value') {
          if (!value) {
            // no tags left in the select element
            props.removeAllTags([currentEntry.path]).then(() => {
              props
                .updateOpenedFile(currentEntry.path, { tags: [] })
                .then(() => {
                  props.switchCurrentLocationType(currentLocationId);
                });
            });
          } else {
            props.removeTags([currentEntry.path], value).then(() => {
              props.switchCurrentLocationType(currentLocationId);
            });
          }
        } else if (action === 'clear') {
          props.removeAllTags([currentEntry.path]).then(() => {
            props.switchCurrentLocationType(currentLocationId);
          });
        } else {
          // create-option or select-option
          const promises = value.map(tag => {
            if (
              currentEntry.tags === undefined ||
              currentEntry.tags.findIndex(obj => obj.title === tag.title) === -1
            ) {
              return props.addTags([currentEntry.path], [tag]);
            }
            return Promise.resolve(false);
          });
          Promise.all(promises).then(() => {
            props.switchCurrentLocationType(currentLocationId);
          });
        }
      });
  };

  const { classes, isReadOnlyMode, theme, sharingLink } = props;

  if (!currentEntry || !currentEntry.path || currentEntry.path === '') {
    return <div />;
  }

  function getBgndUrl() {
    if (!currentEntry.isFile) {
      const bgndPath = getBgndFileLocationForDirectory(
        currentEntry.path,
        PlatformIO.getDirSeparator()
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
            (props.lastBackgroundImageChange &&
            props.lastBackgroundImageChange.folderPath === bgndPath
              ? '?' + props.lastBackgroundImageChange.dt
              : '')
          );
        }
      }
    }
    return undefined;
  }

  function getThumbPath() {
    if (currentEntry.isFile) {
      return getThumbFileLocationForFile(
        currentEntry.path,
        PlatformIO.getDirSeparator(),
        false
      );
    }
    return getThumbFileLocationForDirectory(
      currentEntry.path,
      PlatformIO.getDirSeparator()
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
          (props.lastThumbnailImageChange &&
          props.lastThumbnailImageChange.thumbPath === thumbPath
            ? '?' + props.lastThumbnailImageChange.dt
            : '')
        );
      }
    }
    return undefined;
  }

  const ldtm = currentEntry.lmdt
    ? new Date(currentEntry.lmdt)
        .toISOString()
        .substring(0, 19)
        .split('T')
        .join(' ')
    : ' ';

  const changePerspective = (event: any) => {
    const perspective = event.target.value;
    savePerspective(currentEntry.path, perspective)
      .then((entryMeta: TS.FileSystemEntryMeta) => {
        props.updateOpenedFile(currentEntry.path, entryMeta);
        return true;
      })
      .catch(error => {
        console.warn('Error saving perspective for folder ' + error);
        props.showNotification(i18n.t('Error saving perspective for folder'));
      });
  };

  let perspectiveDefault;
  if (currentEntry.perspective) {
    perspectiveDefault = currentEntry.perspective; // props.perspective;
  } else {
    perspectiveDefault = 'unspecified'; // perspectives.DEFAULT;
  }

  const iconFileMarker = new L.Icon({
    iconUrl: MarkerIcon,
    iconRetinaUrl: Marker2xIcon,
    iconAnchor: [5, 55],
    popupAnchor: [5, -20],
    iconSize: [25, 41],
    shadowUrl: MarkerShadowIcon,
    shadowSize: [41, 41],
    shadowAnchor: [5, 55]
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

  const geoLocation: any = getGeoLocation(currentEntry.tags);

  const isCloudLocation = currentEntry.url && currentEntry.url.length > 5;

  const sanitizedDescription = currentEntry.description
    ? convertMarkDown(currentEntry.description, directoryPath)
    : i18n.t('core:addMarkdownDescription');

  const showLinkForDownloading = isCloudLocation && currentEntry.isFile;

  return (
    <div className={classes.entryProperties}>
      <Grid container>
        <Grid item xs={12}>
          <TextField
            error={fileNameError.current}
            label={
              currentEntry.isFile
                ? i18n.t('core:fileName')
                : i18n.t('core:folderName')
            }
            InputProps={{
              readOnly: editName === undefined,
              endAdornment: (
                <InputAdornment position="end">
                  {!isReadOnlyMode &&
                    !currentEntry.editMode &&
                    editDescription.current === undefined && (
                      <div style={{ textAlign: 'right' }}>
                        {editName !== undefined ? (
                          <div>
                            <Button
                              data-tid="cancelRenameEntryTID"
                              onClick={deactivateEditNameField}
                            >
                              {i18n.t('core:cancel')}
                            </Button>
                            <Button
                              data-tid="confirmRenameEntryTID"
                              color="primary"
                              onClick={renameEntry}
                              disabled={disableConfirmButton.current}
                            >
                              {i18n.t('core:confirmSaveButton')}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            data-tid="startRenameEntryTID"
                            color="primary"
                            onClick={activateEditNameField}
                          >
                            {i18n.t('core:rename')}
                          </Button>
                        )}
                      </div>
                    )}
                </InputAdornment>
              )
            }}
            margin="dense"
            name="name"
            fullWidth={true}
            data-tid="fileNameProperties"
            defaultValue={entryName} // currentEntry.name}
            inputRef={fileNameRef}
            onClick={() => {
              if (
                !currentEntry.editMode &&
                editName === undefined &&
                editDescription.current === undefined
              ) {
                activateEditNameField();
              }
            }}
            onKeyDown={event => {
              if (event.key === 'Enter' && !fileNameError.current) {
                renameEntry();
              }
            }}
            onChange={handleFileNameChange}
          />
          {fileNameError.current && (
            <FormHelperText>
              {i18n.t(
                'core:' +
                  (currentEntry.isFile ? 'fileNameHelp' : 'directoryNameHelp')
              )}
            </FormHelperText>
          )}
        </Grid>
        <Grid item xs={12} style={{ marginTop: 10 }}>
          <TagDropContainer entryPath={currentEntry.path}>
            <TagsSelect
              label={i18n.t('core:fileTags')}
              dataTid="PropertiesTagsSelectTID"
              placeholderText={i18n.t('core:dropHere')}
              isReadOnlyMode={
                isReadOnlyMode ||
                currentEntry.editMode ||
                editDescription.current !== undefined ||
                editName !== undefined
              }
              tags={currentEntry.tags}
              tagMode="default"
              handleChange={handleChange}
              selectedEntryPath={currentEntry.path}
            />
          </TagDropContainer>
        </Grid>

        {geoLocation && (
          <Grid item xs={12}>
            <Map
              tap={true}
              style={{
                height: '200px',
                width: '99%',
                margin: 2,
                marginTop: 8,
                borderRadius: 5,
                border: '1px solid rgba(0, 0, 0, 0.38)'
              }}
              animate={false}
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
                      {i18n.t('core:lat') + ' : ' + geoLocation.lat}
                      <br />
                      {i18n.t('core:lat') + ' : ' + geoLocation.lng}
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
                              geoLocation.lng
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
                              '&z=15'
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
            </Map>
          </Grid>
        )}

        <Grid item xs={12}>
          <EditDescription
            classes={classes}
            primaryColor={theme.palette.text.primary}
            toggleEditDescriptionField={
              !isReadOnlyMode &&
              !currentEntry.editMode &&
              editName === undefined &&
              toggleEditDescriptionField
            }
            printHTML={printHTML}
            fileDescriptionRef={fileDescriptionRef}
            description={currentEntry.description}
            setEditDescription={md => (editDescription.current = md)}
            isDarkTheme={theme.palette.mode === 'dark'}
            currentFolder={directoryPath}
          />
        </Grid>

        <Grid container item xs={12} spacing={1}>
          <Grid item xs={6}>
            <TextField
              margin="dense"
              fullWidth={true}
              value={ldtm}
              label={i18n.t('core:fileLDTM')}
              InputProps={{
                readOnly: true
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              margin="dense"
              fullWidth={true}
              value={
                currentEntry.isFile
                  ? formatFileSize(currentEntry.size)
                  : i18n.t('core:notAvailable')
              }
              label={i18n.t('core:fileSize')}
              InputProps={{
                readOnly: true
              }}
            />
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth={true} className={classes.formControl}>
            <TextField
              margin="dense"
              name="path"
              title={currentEntry.url || currentEntry.path}
              fullWidth={true}
              label={i18n.t('core:filePath')}
              data-tid="filePathProperties"
              value={currentEntry.path || ''}
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    {isCloudLocation ? (
                      <CloudLocationIcon
                        style={{ color: theme.palette.text.secondary }}
                      />
                    ) : (
                      <LocationIcon
                        style={{ color: theme.palette.text.secondary }}
                      />
                    )}
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {currentEntry.isFile &&
                      !isReadOnlyMode &&
                      !currentEntry.editMode &&
                      editName === undefined &&
                      editDescription.current === undefined && (
                        <Button
                          color="primary"
                          onClick={toggleMoveCopyFilesDialog}
                        >
                          {i18n.t('core:move')}
                        </Button>
                      )}
                  </InputAdornment>
                )
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
              margin="dense"
              name="path"
              label={
                <>
                  {i18n.t('core:sharingLink')}
                  <InfoIcon tooltip={i18n.t('core:sharingLinkTooltip')} />
                </>
              }
              fullWidth={true}
              value={sharingLink}
              inputRef={sharingLinkRef}
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <ShareIcon
                      style={{ color: theme.palette.text.secondary }}
                    />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={i18n.t('core:copyLinkToClipboard')}>
                      <Button
                        color="primary"
                        onClick={() => {
                          const promise = navigator.clipboard.writeText(
                            sharingLink
                          );
                          props.showNotification(i18n.t('core:linkCopied'));
                        }}
                      >
                        {i18n.t('core:copy')}
                      </Button>
                    </Tooltip>
                  </InputAdornment>
                )
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
                    {i18n.t('core:downloadLink')}
                    <InfoIcon tooltip={i18n.t('core:downloadLinkTooltip')} />
                  </>
                }
                fullWidth
                value={' '}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="start">
                      <Button
                        fullWidth
                        onClick={() => setShowSharingLinkDialog(true)}
                      >
                        {i18n.t('core:generateDownloadLink')}
                      </Button>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          )}
        </Grid>

        {!currentEntry.isFile && (
          <Grid item xs={12} style={{ marginTop: 10 }}>
            <PerspectiveSelector
              onChange={changePerspective}
              defaultValue={perspectiveDefault}
              label={i18n.t('core:choosePerspective')}
              testId="changePerspectiveTID"
            />
          </Grid>
        )}

        {!currentEntry.isFile && (
          <Grid item xs={12} style={{ marginTop: 5 }}>
            <TextField
              margin="dense"
              name="path"
              label={
                <>
                  {i18n.t('core:backgroundColor')}
                  <InfoIcon
                    tooltip={i18n.t(
                      'The background color will not be visible if you have set a background image'
                    )}
                  />
                </>
              }
              fullWidth
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start" style={{ marginTop: 10 }}>
                    {/* <Tooltip title={i18n.t('core:changeBackgroundColor')}> */}
                    <TransparentBackground>
                      <Button
                        fullWidth
                        style={{
                          width: 100,
                          background: currentEntry.color
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
                        <ProTooltip tooltip={i18n.t('changeBackgroundColor')}>
                          <IconButton
                            key={cnt}
                            aria-label="fingerprint"
                            onClick={() => handleChangeColor(background)}
                            style={{
                              backgroundImage: background
                            }}
                          >
                            <SetBackgroundIcon />
                          </IconButton>
                        </ProTooltip>
                      ))}
                      {currentEntry.color && (
                        <>
                          <ProTooltip tooltip={i18n.t('clearFolderColor')}>
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
                )
              }}
            />
          </Grid>
        )}
        <Grid container item xs={12} spacing={1}>
          <Grid item xs={currentEntry.isFile ? 12 : 6}>
            <ThumbnailTextField
              margin="dense"
              label={i18n.t('core:thumbnail')}
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
                      {!isReadOnlyMode &&
                        !currentEntry.editMode &&
                        editName === undefined &&
                        editDescription.current === undefined && (
                          <ProTooltip tooltip={i18n.t('changeThumbnail')}>
                            <Button fullWidth onClick={toggleThumbFilesDialog}>
                              {i18n.t('core:change')}
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
                      {/* <ProTooltip tooltip={i18n.t('changeThumbnail')}> */}
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
                          marginBottom: 5
                        }}
                        onClick={toggleThumbFilesDialog}
                      />
                      {/* </ProTooltip> */}
                    </Stack>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          {!currentEntry.isFile && (
            <Grid item xs={6}>
              <ThumbnailTextField
                margin="dense"
                label={i18n.t('core:backgroundImage')}
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
                        {!isReadOnlyMode &&
                          !currentEntry.editMode &&
                          editName === undefined &&
                          editDescription.current === undefined && (
                            <ProTooltip
                              tooltip={i18n.t('changeBackgroundImage')}
                            >
                              <Button fullWidth onClick={toggleBgndImgDialog}>
                                {i18n.t('core:change')}
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
                        {/* <ProTooltip tooltip={i18n.t('changeBackgroundImage')}> */}
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
                            marginBottom: 5
                          }}
                          onClick={toggleBgndImgDialog}
                        />
                        {/* </ProTooltip> */}
                      </Stack>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          )}
        </Grid>
        <Grid container item xs={12} style={{ height: 150 }}></Grid>
      </Grid>
      {isConfirmResetColorDialogOpened && (
        <ConfirmDialog
          open={isConfirmResetColorDialogOpened}
          onClose={() => {
            setConfirmResetColorDialogOpened(false);
          }}
          title={i18n.t('core:confirm')}
          content={i18n.t('core:confirmResetColor')}
          confirmCallback={result => {
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
          selectedFiles={[currentEntry.path]}
        />
      )}
      {ThumbnailChooserDialog && (
        <ThumbnailChooserDialog
          open={isFileThumbChooseDialogOpened}
          onClose={toggleThumbFilesDialog}
          selectedFile={currentEntry.path}
          thumbPath={getThumbPath()}
          setThumb={setThumb}
        />
      )}
      {showSharingLinkDialog && (
        <LinkGeneratorDialog
          open={showSharingLinkDialog}
          onClose={() => setShowSharingLinkDialog(false)}
          path={currentEntry.path}
          showNotification={props.showNotification}
          locationId={currentEntry.locationId}
          switchCurrentLocationType={props.switchCurrentLocationType}
          switchLocationType={props.switchLocationType}
        />
      )}
      {BgndImgChooserDialog && (
        <BgndImgChooserDialog
          open={isBgndImgChooseDialogOpened}
          onClose={toggleBgndImgDialog}
          currentDirectoryPath={currentEntry.path}
        />
      )}
      {CustomBackgroundDialog && (
        <CustomBackgroundDialog
          color={currentEntry.color}
          open={displayColorPicker}
          setColor={handleChangeColor}
          onClose={toggleBackgroundColorPicker}
          currentDirectoryPath={currentEntry.path}
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
    </div>
  );
}

const ThumbnailTextField = withStyles((theme: Theme) =>
  createStyles({
    root: {
      '& .MuiInputBase-root': {
        height: 220
      }
    }
  })
)(TextField);

function mapStateToProps(state) {
  return {
    lastBackgroundImageChange: getLastBackgroundImageChange(state),
    lastThumbnailImageChange: getLastThumbnailImageChange(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      switchLocationType: LocationActions.switchLocationType,
      switchCurrentLocationType: AppActions.switchCurrentLocationType,
      setLastBackgroundColorChange: AppActions.setLastBackgroundColorChange
    },
    dispatch
  );
}

const areEqual = (prevProp: Props, nextProp: Props) =>
  JSON.stringify(nextProp.openedEntry) ===
    JSON.stringify(prevProp.openedEntry) &&
  JSON.stringify(nextProp.lastThumbnailImageChange) ===
    JSON.stringify(prevProp.lastThumbnailImageChange) &&
  JSON.stringify(nextProp.lastBackgroundImageChange) ===
    JSON.stringify(prevProp.lastBackgroundImageChange);

export default withLeaflet(
  connect(
    mapStateToProps,
    mapActionCreatorsToProps
  )(
    // @ts-ignore
    React.memo(
      withStyles(styles, { withTheme: true })(EntryProperties),
      areEqual
    )
  )
);
