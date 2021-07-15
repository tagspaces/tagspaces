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

import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useStateWithCallbackLazy } from 'use-state-with-callback';
import uuidv1 from 'uuid';
import marked from 'marked';
import L from 'leaflet';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import InputAdornment from '@material-ui/core/InputAdornment';
import ShareIcon from '@material-ui/icons/Link';
import Tooltip from '@material-ui/core/Tooltip';
import LocationIcon from '@material-ui/icons/WorkOutline';
import CloudLocationIcon from '@material-ui/icons/CloudQueue';
import DOMPurify from 'dompurify';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import ClearColorIcon from '@material-ui/icons/Backspace';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import DefaultPerspectiveIcon from '@material-ui/icons/GridOn';
import LayersClearIcon from '@material-ui/icons/LayersClear';
import ListItemText from '@material-ui/core/ListItemText';
import GalleryPerspectiveIcon from '@material-ui/icons/Camera';
import MapiquePerspectiveIcon from '@material-ui/icons/Map';
import KanBanPerspectiveIcon from '@material-ui/icons/Dashboard';
import {
  AttributionControl,
  Map,
  LayerGroup,
  Marker,
  Popup,
  TileLayer,
  withLeaflet
} from 'react-leaflet';
import OpenLocationCode from 'open-location-code-typescript';
import { IconButton } from '@material-ui/core';
import TagDropContainer from './TagDropContainer';
import ColorPickerDialog from './dialogs/ColorPickerDialog';
import MoveCopyFilesDialog from './dialogs/MoveCopyFilesDialog';
import i18n from '../services/i18n';
import { enhanceOpenedEntry } from '-/services/utils-io';
import { formatFileSize, isPlusCode } from '-/utils/misc';
import {
  extractContainingDirectoryPath,
  getThumbFileLocationForFile,
  getThumbFileLocationForDirectory,
  extractFileName,
  extractDirectoryName
} from '-/utils/paths';
import AppConfig from '../config';
import { Pro } from '../pro';
import PlatformIO from '../services/platform-io';
import TagsSelect from './TagsSelect';
import TransparentBackground from './TransparentBackground';
import {
  replaceThumbnailURLPromise,
  getThumbnailURLPromise
} from '-/services/thumbsgenerator';
import { OpenedEntry, perspectives } from '-/reducers/app';
import { savePerspective } from '-/utils/metaoperations';
import MarkerIcon from '-/assets/icons/marker-icon.png';
import Marker2xIcon from '-/assets/icons/marker-icon-2x.png';
import MarkerShadowIcon from '-/assets/icons/marker-shadow.png';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import { TS } from '-/tagspaces.namespace';
import NoTileServer from '-/components/NoTileServer';
import InfoIcon from '-/components/InfoIcon';
import { ProTooltip } from '-/components/HelperComponents';

const ThumbnailChooserDialog =
  Pro && Pro.UI ? Pro.UI.ThumbnailChooserDialog : false;

const styles: any = (theme: any) => ({
  entryProperties: {
    overflowY: AppConfig.isFirefox ? 'auto' : 'overlay',
    overflowX: 'hidden',
    flexGrow: 1,
    padding: 7,
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
  colorChooserButton: {
    minHeight: 35,
    width: '100%',
    border: '1px solid lightgray',
    margin: '0 8px 0 0',
    textTransform: 'none',
    fontWeight: 'lighter'
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
  header: {
    color: theme.palette.text.primary
  },
  entryItem: {
    width: '100%',
    padding: 0
  },
  button: {
    position: 'relative',
    padding: '8px 12px 6px 8px',
    margin: '0 10px 0 0',
    cursor: 'pointer'
  },
  buttonIcon: {
    cursor: 'pointer'
  },
  fluidGrid: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  gridItem: {
    width: '100%',
    paddingLeft: 5
  },
  formControl: {
    width: 'calc(100% - 12px)',
    marginBottom: 10,
    marginLeft: 5
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
  updateOpenedFile: (entryPath: string, fsEntryMeta: any) => void;
  updateThumbnailUrl: (path: string, thumbUrl: string) => void;
  addTags: (paths: Array<string>, tags: Array<TS.Tag>) => void;
  removeTags: (paths: Array<string>, tags: Array<TS.Tag>) => void;
  removeAllTags: (paths: Array<string>) => void;
  isReadOnlyMode: boolean;
  currentDirectoryPath: string | null;
  tagDelimiter: string;
  tileServer: TS.MapTileServer;
}

const EntryProperties = (props: Props) => {
  // const EntryProperties = React.memo((props: Props) => {
  const fileNameRef = useRef<HTMLInputElement>(null);
  const sharingLinkRef = useRef<HTMLInputElement>(null);
  const objectStorageLinkRef = useRef<HTMLInputElement>(null);
  const fileDescriptionRef = useRef<HTMLInputElement>(null);

  const parentDirectoryPath = extractContainingDirectoryPath(
    props.openedEntry.path,
    PlatformIO.getDirSeparator()
  );

  const customRenderer = new marked.Renderer();
  customRenderer.link = (href, title, text) => `
      <a href="#"
        title="${href}"
        onClick="event.preventDefault(); event.stopPropagation(); window.postMessage(JSON.stringify({ command: 'openLinkExternally', link: '${href}' }), '*'); return false;">
        ${text}
      </a>`;

  customRenderer.image = (href, title, text) => {
    let sourceUrl = href;
    if (!sourceUrl.startsWith('http')) {
      sourceUrl =
        parentDirectoryPath + PlatformIO.getDirSeparator() + sourceUrl;
    }
    return `<img src="${sourceUrl}"
    >
        ${text}
    </img>`;
  };

  marked.setOptions({
    renderer: customRenderer,
    pedantic: false,
    gfm: true,
    tables: true,
    breaks: false,
    smartLists: true,
    smartypants: false,
    xhtml: true
  });

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

  const [signedLink, setSignedLink] = useStateWithCallbackLazy<string>('');
  const [linkValidityDuration, setLinkValidityDuration] = useState<number>(
    60 * 15
  );
  const [editName, setEditName] = useState<string>(undefined);
  const [editDescription, setEditDescription] = useState<string>(undefined);
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
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);

  useEffect(() => {
    if (
      // editDescription === currentEntry.description &&
      fileDescriptionRef.current
    ) {
      fileDescriptionRef.current.focus();
    }
  }, [editDescription]);

  useEffect(() => {
    if (editName === entryName && fileNameRef.current) {
      fileNameRef.current.focus();
    }
  }, [editName]);

  const renameEntry = () => {
    if (editName !== undefined) {
      const { renameFile, renameDirectory } = props;

      const path = extractContainingDirectoryPath(
        currentEntry.path,
        PlatformIO.getDirSeparator()
      );
      const nextPath = path + PlatformIO.getDirSeparator() + editName;

      if (currentEntry.isFile) {
        renameFile(currentEntry.path, nextPath)
          .then(() => true)
          .catch(() => {
            fileNameRef.current.value = entryName;
          });
      } else {
        renameDirectory(currentEntry.path, editName)
          .then(() => true)
          .catch(() => {
            fileNameRef.current.value = entryName;
          });
      }

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
    if (fileNameRef) {
      fileNameRef.current.value = entryName;
    }
  };

  const toggleEditDescriptionField = () => {
    if (props.isReadOnlyMode) {
      setEditDescription(undefined);
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
    if (editDescription !== undefined) {
      Pro.MetaOperations.saveDescription(currentEntry.path, editDescription)
        .then(entryMeta => {
          setEditDescription(undefined);
          props.updateOpenedFile(currentEntry.path, {
            ...entryMeta,
            changed: true
          });
          return true;
        })
        .catch(error => {
          console.warn('Error saving description ' + error);
          setEditDescription(undefined);
          props.showNotification(i18n.t('Error saving description'));
        });
    } else if (currentEntry.description) {
      setEditDescription(currentEntry.description);
    } else {
      setEditDescription('');
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
      editDescription === undefined
    ) {
      setFileThumbChooseDialogOpened(!isFileThumbChooseDialogOpened);
    }
  };

  const setThumb = (filePath, thumbFilePath) => {
    if (filePath !== undefined) {
      if (PlatformIO.haveObjectStoreSupport()) {
        const thumbUrl = PlatformIO.getURLforPath(thumbFilePath);
        props.updateThumbnailUrl(currentEntry.path, thumbUrl);
        return Promise.resolve(true);
      }
      return replaceThumbnailURLPromise(filePath, thumbFilePath)
        .then(objUrl => {
          props.updateThumbnailUrl(
            currentEntry.path,
            objUrl.tmbPath + '?' + new Date().getTime()
          );
          return true;
        })
        .catch(err => {
          console.warn('Error replaceThumbnailURLPromise ' + err);
          props.showNotification('Error replacing thumbnail');
        });
    }
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
    Pro.MetaOperations.saveColor(currentEntry.path, color)
      .then(entryMeta => {
        // if (props.entryPath === props.currentDirectoryPath) {
        props.updateOpenedFile(currentEntry.path, {
          ...entryMeta,
          changed: true
        });
        /* } else {
          setCurrentEntry({ ...currentEntry, color });
        } */
        return true;
      })
      .catch(error => {
        console.warn('Error saving color for folder ' + error);
        props.showNotification(i18n.t('Error saving color for folder'));
      });
  };

  const handleFileNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'name') {
      setEditName(value);
    }
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'description') {
      setEditDescription(value);
    }
  };

  const handleChange = (name: string, value: Array<TS.Tag>, action: string) => {
    if (action === 'remove-value') {
      if (!value) {
        // no tags left in the select element
        props.removeAllTags([currentEntry.path]); // TODO return promise
        props.updateOpenedFile(currentEntry.path, { tags: [], changed: true });
      } else {
        props.removeTags([currentEntry.path], value);
      }
    } else if (action === 'clear') {
      props.removeAllTags([currentEntry.path]);
    } else {
      // create-option or select-option
      value.map(tag => {
        if (
          currentEntry.tags === undefined ||
          currentEntry.tags.findIndex(obj => obj.title === tag.title) === -1
        ) {
          props.addTags([currentEntry.path], [tag]);
        }
        return true;
      });
    }
  };

  const { classes, isReadOnlyMode, theme } = props;

  if (!currentEntry || !currentEntry.path || currentEntry.path === '') {
    return <div />;
  }

  let thumbPath;
  if (currentEntry.isFile) {
    thumbPath = getThumbFileLocationForFile(
      currentEntry.path,
      PlatformIO.getDirSeparator()
    );
  } else {
    thumbPath = getThumbFileLocationForDirectory(
      currentEntry.path,
      PlatformIO.getDirSeparator()
    );
  }
  let url;
  if (PlatformIO.haveObjectStoreSupport()) {
    url = PlatformIO.getURLforPath(thumbPath);
  } else {
    url = thumbPath + '?' + new Date().getTime();
  }
  const thumbPathUrl = thumbPath ? 'url("' + url + '")' : '';

  const ldtm = currentEntry.lmdt
    ? new Date(currentEntry.lmdt)
        .toISOString()
        .substring(0, 19)
        .split('T')
        .join(' ')
    : '';

  const changePerspective = (event: any) => {
    const perspective = event.target.value;
    savePerspective(currentEntry.path, perspective)
      .then((entryMeta: TS.FileSystemEntryMeta) => {
        props.updateOpenedFile(currentEntry.path, {
          ...entryMeta,
          changed: true
        });
        return true;
      })
      .catch(error => {
        console.warn('Error saving perspective for folder ' + error);
        props.showNotification(i18n.t('Error saving perspective for folder'));
      });
  };

  let perspectiveDefault;
  if (currentEntry.perspective) {
    perspectiveDefault = currentEntry.perspective;
  } else if (currentEntry.perspective) {
    perspectiveDefault = currentEntry.perspective; // props.perspective;
  } else {
    perspectiveDefault = 'unspecified'; // perspectives.DEFAULT;
  }

  function getMenuItem(perspective) {
    let icon;
    if (perspective === perspectives.DEFAULT) {
      icon = <DefaultPerspectiveIcon />;
    } else if (perspective === perspectives.GALLERY) {
      icon = <GalleryPerspectiveIcon />;
    } else if (perspective === perspectives.MAPIQUE) {
      icon = <MapiquePerspectiveIcon />;
    } else if (perspective === perspectives.KANBAN) {
      icon = <KanBanPerspectiveIcon />;
    }
    return (
      <MenuItem key={perspective} value={perspective}>
        <div style={{ display: 'flex' }}>
          <ListItemIcon style={{ paddingLeft: 3, paddingTop: 3 }}>
            {icon}
          </ListItemIcon>
          <ListItemText>
            {perspective.charAt(0).toUpperCase() + perspective.slice(1)}
          </ListItemText>
        </div>
      </MenuItem>
    );
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
        if (isPlusCode(tags[i].title)) {
          const coord = OpenLocationCode.decode(tags[i].title);
          const lat = Number(coord.latitudeCenter.toFixed(7));
          const lng = Number(coord.longitudeCenter.toFixed(7));
          return { lat, lng };
        }
      }
    }
  }

  const geoLocation: any = getGeoLocation(currentEntry.tags);

  let sharingLink = window.location.href;
  if (sharingLink.indexOf('?') > 0) {
    const sharingURL = new URL(sharingLink);
    const params = new URLSearchParams(sharingURL.search);
    params.delete('tsdpath');
    sharingLink = 'ts:?' + params;
  }

  const isCloudLocation = currentEntry.url && currentEntry.url.length > 5;

  function generateCopySharingURL() {
    setSignedLink(
      PlatformIO.getURLforPath(currentEntry.path, linkValidityDuration),
      currentSignedLink => {
        if (currentSignedLink && currentSignedLink.length > 1) {
          objectStorageLinkRef.current.select();
          document.execCommand('copy');
          props.showNotification(i18n.t('Link copied to clipboard'));
        }
      }
    );
  }

  // @ts-ignore
  return (
    <div className={classes.entryProperties}>
      <Grid container>
        <Grid item xs={12}>
          <div className={classes.fluidGrid}>
            <div className={classes.gridItem}>
              <Typography
                variant="caption"
                className={classes.header}
                style={{ display: 'block' }}
              >
                {currentEntry.isFile
                  ? i18n.t('core:fileName')
                  : i18n.t('core:folderName')}
              </Typography>
            </div>
          </div>
          <FormControl fullWidth={true} className={classes.formControl}>
            <TextField
              InputProps={{
                readOnly: editName === undefined,
                endAdornment: (
                  <InputAdornment position="end">
                    {!isReadOnlyMode &&
                      !currentEntry.editMode &&
                      editDescription === undefined && (
                        <div
                          className={classes.gridItem}
                          style={{ textAlign: 'right' }}
                        >
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
                  editDescription === undefined
                ) {
                  activateEditNameField();
                }
              }}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  renameEntry();
                }
              }}
              onChange={handleFileNameChange}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <div className={classes.fluidGrid}>
            <div className={classes.gridItem}>
              <Typography
                variant="caption"
                className={classes.header}
                style={{ display: 'block' }}
              >
                {i18n.t('core:fileTags')}
              </Typography>
            </div>
            <div className={classes.gridItem} />
          </div>
          <div className={classes.gridItem}>
            <TagDropContainer entryPath={currentEntry.path}>
              <TagsSelect
                dataTid="PropertiesTagsSelectTID"
                placeholderText={i18n.t('core:dropHere')}
                isReadOnlyMode={
                  isReadOnlyMode ||
                  currentEntry.editMode ||
                  editDescription !== undefined ||
                  editName !== undefined
                }
                tags={currentEntry.tags}
                tagMode="default"
                handleChange={handleChange}
                selectedEntryPath={currentEntry.path}
              />
            </TagDropContainer>
          </div>
        </Grid>

        {geoLocation && (
          <Grid item xs={12}>
            <Map
              tap={true}
              style={{ height: '200px', width: '100%', margin: 3 }}
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
                  <Popup
                    style={{
                      backgroundColor: 'white'
                    }}
                  >
                    <h2>{geoLocation.lat + ', ' + geoLocation.lng}</h2>
                  </Popup>
                </Marker>
              </LayerGroup>
              <AttributionControl position="bottomright" prefix="" />
            </Map>
          </Grid>
        )}

        <Grid item xs={12}>
          <div className={classes.fluidGrid}>
            <div className={classes.gridItem}>
              <Typography
                variant="caption"
                className={classNames(classes.header, classes.header)}
                style={{ display: 'block' }}
              >
                {i18n.t('core:filePropertiesDescription')}
              </Typography>
            </div>
            {!isReadOnlyMode &&
              !currentEntry.editMode &&
              editName === undefined && (
                <div
                  className={classes.gridItem}
                  style={{ textAlign: 'right' }}
                >
                  {editDescription !== undefined && (
                    <Button
                      className={classes.button}
                      onClick={() => setEditDescription(undefined)}
                    >
                      {i18n.t('core:cancel')}
                    </Button>
                  )}
                  <ProTooltip tooltip={i18n.t('editDescription')}>
                    <Button
                      color="primary"
                      className={classes.button}
                      disabled={!Pro}
                      onClick={toggleEditDescriptionField}
                    >
                      {editDescription !== undefined
                        ? i18n.t('core:confirmSaveButton')
                        : i18n.t('core:edit')}
                    </Button>
                  </ProTooltip>
                </div>
              )}
          </div>
          <FormControl fullWidth={true} className={classes.formControl}>
            {editDescription !== undefined ? (
              <React.Fragment>
                <TextField
                  multiline
                  inputRef={fileDescriptionRef}
                  style={{
                    padding: 10,
                    borderRadius: 5,
                    backgroundColor: 'rgba(255, 216, 115, 0.20)'
                  }}
                  id="textarea"
                  placeholder=""
                  name="description"
                  className={styles.textField}
                  defaultValue={currentEntry.description}
                  fullWidth={true}
                  onChange={handleDescriptionChange}
                />
                <Typography
                  variant="caption"
                  style={{
                    color: theme.palette.text.primary
                  }}
                >
                  Formatting: <i className={classes.mdHelpers}>_italic_</i>{' '}
                  <b className={classes.mdHelpers}>**bold**</b>{' '}
                  <span className={classes.mdHelpers}>* list item</span>{' '}
                  <span className={classes.mdHelpers}>
                    [Link text](http://...)
                  </span>
                </Typography>
              </React.Fragment>
            ) : (
              <Typography
                style={{
                  display: 'block',
                  padding: 10,
                  borderRadius: 5,
                  backgroundColor: 'rgba(255, 216, 115, 0.20)',
                  marginBottom: 5,

                  color: currentEntry.description
                    ? theme.palette.text.primary
                    : theme.palette.text.disabled
                }}
                role="button"
                id="descriptionArea"
                dangerouslySetInnerHTML={{
                  // eslint-disable-next-line no-nested-ternary
                  __html: currentEntry.description
                    ? marked(DOMPurify.sanitize(currentEntry.description))
                    : i18n.t('core:addMarkdownDescription')
                }}
                onDoubleClick={() => {
                  if (!currentEntry.editMode && editName === undefined) {
                    toggleEditDescriptionField();
                  }
                }}
              />
            )}
          </FormControl>
        </Grid>

        <Grid container item xs={12}>
          <Grid item xs={6}>
            <div className={classes.gridItem}>
              <Typography
                variant="caption"
                className={classes.header}
                style={{ display: 'block' }}
              >
                {i18n.t('core:fileLDTM')}
                <br />
                <strong>{ldtm}</strong>
              </Typography>
            </div>
          </Grid>

          {currentEntry.isFile ? (
            <Grid item xs={6}>
              <Typography
                variant="caption"
                className={classes.header}
                style={{ display: 'block' }}
              >
                {i18n.t('core:fileSize')}
                <br />
                <strong>{formatFileSize(currentEntry.size)}</strong>
              </Typography>
            </Grid>
          ) : (
            <Grid item xs={6}>
              <Typography
                variant="caption"
                style={{ display: 'block', paddingLeft: 6 }}
                className={classes.header}
              >
                {i18n.t('core:backgroundColor')}
              </Typography>
              <Grid container item xs={12}>
                <Grid item xs={10}>
                  <FormControl fullWidth={true} className={classes.formControl}>
                    <TransparentBackground>
                      <Button
                        fullWidth={true}
                        className={[
                          classes.colorChooserButton,
                          classes.button
                        ].join(' ')}
                        style={{
                          backgroundColor: currentEntry.color
                        }}
                        onClick={toggleBackgroundColorPicker}
                      >
                        {i18n.t('core:changeBackgroundColor')}
                      </Button>
                    </TransparentBackground>
                  </FormControl>
                </Grid>
                <Grid item xs={2}>
                  {currentEntry.color && (
                    <>
                      <ProTooltip tooltip={i18n.t('clearFolderColor')}>
                        <IconButton
                          disabled={!Pro}
                          aria-label="clear"
                          size="small"
                          style={{ marginTop: 5 }}
                          onClick={() => setConfirmResetColorDialogOpened(true)}
                        >
                          <ClearColorIcon />
                        </IconButton>
                      </ProTooltip>
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
                    </>
                  )}
                </Grid>
              </Grid>
              {displayColorPicker && (
                <ColorPickerDialog
                  color={currentEntry.color}
                  open={displayColorPicker}
                  setColor={handleChangeColor}
                  onClose={toggleBackgroundColorPicker}
                  presetColors={[
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
                  ]}
                />
              )}
            </Grid>
          )}
        </Grid>

        <Grid item xs={12}>
          <div className={classes.fluidGrid}>
            <div className={classes.gridItem}>
              <Typography
                variant="caption"
                className={classNames(classes.header)}
                style={{ display: 'block' }}
              >
                {i18n.t('core:filePath')}
              </Typography>
            </div>
          </div>
          <FormControl fullWidth={true} className={classes.formControl}>
            <TextField
              margin="dense"
              name="path"
              title={currentEntry.url || currentEntry.path}
              fullWidth={true}
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
                      editDescription === undefined && (
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

        <Grid item xs={isCloudLocation ? 6 : 12}>
          <Typography
            variant="caption"
            className={classNames(classes.header)}
            style={{ display: 'block', paddingLeft: 5 }}
          >
            {i18n.t('core:sharingLink')}
            <InfoIcon
              tooltip={i18n.t(
                'Link for sharing to other TagSpaces installation using the same location IDs'
              )}
            />
          </Typography>
          <FormControl
            style={{ marginTop: -10 }}
            fullWidth={true}
            className={classes.formControl}
          >
            <TextField
              margin="dense"
              name="path"
              title="Sharing Link"
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
                    <Tooltip title="Copy the link to the clipboard">
                      <Button
                        color="primary"
                        onClick={() => {
                          sharingLinkRef.current.select();
                          document.execCommand('copy');
                          props.showNotification(
                            i18n.t('Link copied to clipboard')
                          );
                        }}
                      >
                        {i18n.t('core:copy')}
                      </Button>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
          </FormControl>
        </Grid>

        {isCloudLocation && (
          <Grid item xs={6}>
            <Typography
              variant="caption"
              className={classNames(classes.header)}
              style={{ display: 'block', paddingLeft: 5 }}
            >
              {i18n.t('Link for downloading')}
              <InfoIcon
                tooltip={i18n.t(
                  'Link for time limited sharing on the Internet'
                )}
              />
            </Typography>
            <FormControl
              style={{ marginTop: -10 }}
              fullWidth={true}
              className={classes.formControl}
            >
              <TextField
                margin="dense"
                name="path"
                title="Object Storage Sharing Link"
                fullWidth={true}
                value={signedLink}
                inputRef={objectStorageLinkRef}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" style={{ width: 70 }}>
                      <Tooltip title="Link validity duration time">
                        <Select
                          style={{ height: 28 }}
                          value={linkValidityDuration}
                          onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            setLinkValidityDuration(
                              parseInt(event.target.value, 10)
                            );
                          }}
                        >
                          <MenuItem value={60 * 15}>15 min</MenuItem>
                          <MenuItem value={60 * 60}>1 hour</MenuItem>
                          <MenuItem value={60 * 60 * 24}>1 day</MenuItem>
                          <MenuItem value={60 * 60 * 24 * 3}>3 days</MenuItem>
                          <MenuItem value={60 * 60 * 24 * 7}>1 week</MenuItem>
                        </Select>
                      </Tooltip>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Generate and copy the link to the clipboard">
                        <Button
                          color="primary"
                          onClick={generateCopySharingURL}
                        >
                          {i18n.t('Generate & Copy')}
                        </Button>
                      </Tooltip>
                    </InputAdornment>
                  )
                }}
              />
            </FormControl>
          </Grid>
        )}

        {!currentEntry.isFile && (
          <Grid item xs={12}>
            <div className={classes.fluidGrid}>
              <div className={classes.gridItem}>
                <Typography
                  variant="caption"
                  className={classNames(classes.header)}
                  style={{ display: 'block' }}
                >
                  {i18n.t('core:choosePerspective')}
                </Typography>
              </div>
            </div>
            <FormControl fullWidth={true} className={classes.formControl}>
              <Select
                data-tid="changePerspectiveTID"
                defaultValue={perspectiveDefault}
                onChange={changePerspective}
                input={<Input id="changePerspectiveId" />}
              >
                <MenuItem
                  style={{ display: 'flex' }}
                  key="unspecified"
                  value="unspecified"
                >
                  <div style={{ display: 'flex' }}>
                    <ListItemIcon style={{ paddingLeft: 3, paddingTop: 3 }}>
                      <LayersClearIcon />
                    </ListItemIcon>
                    <ListItemText>{i18n.t('core:unspecified')}</ListItemText>
                  </div>
                </MenuItem>
                {Object.values(perspectives).map(perspective =>
                  getMenuItem(perspective)
                )}
                {/* {Pro &&
                  Object.values(
                    Pro.Perspectives.AvailablePerspectives
                  ).map(perspective => getMenuItem(perspective))} */}
              </Select>
            </FormControl>
          </Grid>
        )}

        <Grid item xs={12}>
          <div className={classes.fluidGrid}>
            <div className={classes.gridItem}>
              <Typography
                variant="caption"
                className={classNames(classes.header)}
                style={{ display: 'block' }}
              >
                {i18n.t('core:thumbnail')}
              </Typography>
            </div>
            {!isReadOnlyMode &&
              !currentEntry.editMode &&
              editName === undefined &&
              editDescription === undefined && (
                <ProTooltip tooltip={i18n.t('changeThumbnail')}>
                  <Button
                    disabled={!Pro}
                    color="primary"
                    className={classes.button}
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={toggleThumbFilesDialog}
                  >
                    {i18n.t('core:changeThumbnail')}
                  </Button>
                </ProTooltip>
              )}
          </div>
          <div className={classes.fluidGrid}>
            <div className={classes.gridItem}>
              {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
              <div
                className={classes.header}
                onClick={toggleThumbFilesDialog}
                role="button"
                tabIndex={0}
                style={{
                  backgroundSize: 'cover',
                  backgroundImage: thumbPathUrl,
                  backgroundPosition: 'center',
                  height: 100,
                  width: 100,
                  display: 'block',
                  marginBottom: 5
                }}
              />
            </div>
          </div>
        </Grid>
      </Grid>
      {isMoveCopyFilesDialogOpened && (
        <MoveCopyFilesDialog
          key={uuidv1()}
          open={isMoveCopyFilesDialogOpened}
          onClose={toggleMoveCopyFilesDialog}
          selectedFiles={[currentEntry.path]}
        />
      )}
      {ThumbnailChooserDialog && isFileThumbChooseDialogOpened && (
        <ThumbnailChooserDialog
          open={isFileThumbChooseDialogOpened}
          onClose={toggleThumbFilesDialog}
          selectedFile={thumbPath}
          setThumb={setThumb}
        />
      )}
    </div>
  );
};

export default withLeaflet(
  withStyles(styles, { withTheme: true })(EntryProperties)
);
