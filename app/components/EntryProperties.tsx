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
import LocationIcon from '@material-ui/icons/WorkOutline';
import CloudLocationIcon from '@material-ui/icons/CloudQueue';
import DOMPurify from 'dompurify';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
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
import TagDropContainer from './TagDropContainer';
import ColorPickerDialog from './dialogs/ColorPickerDialog';
import MoveCopyFilesDialog from './dialogs/MoveCopyFilesDialog';
import i18n from '../services/i18n';
import { enhanceOpenedEntry, FileSystemEntryMeta } from '-/services/utils-io';
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
import { Tag } from '-/reducers/taglibrary';
import { OpenedEntry, perspectives } from '-/reducers/app';
import { savePerspective } from '-/utils/metaoperations';
import MarkerIcon from '-/assets/icons/marker-icon.png';
import Marker2xIcon from '-/assets/icons/marker-icon-2x.png';
import MarkerShadowIcon from '-/assets/icons/marker-shadow.png';

const ThumbnailChooserDialog =
  Pro && Pro.UI ? Pro.UI.ThumbnailChooserDialog : false;

const styles: any = (theme: any) => ({
  entryProperties: {
    overflowY: AppConfig.isFirefox ? 'auto' : 'overlay',
    overflowX: 'hidden',
    flexGrow: 1,
    padding: '0 7px',
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
    margin: '0 8px 0 0'
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
  ellipsisText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    padding: '0 2px 0 0'
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
  renameFile: (path: string, nextPath: string) => void;
  renameDirectory: (path: string, nextPath: string) => void;
  showNotification: (message: string) => void;
  updateOpenedFile: (entryPath: string, fsEntryMeta: any) => void;
  updateThumbnailUrl: (path: string, thumbUrl: string) => void;
  addTags: (paths: Array<string>, tags: Array<Tag>) => void;
  removeTags: (paths: Array<string>, tags: Array<Tag>) => void;
  removeAllTags: (paths: Array<string>) => void;
  isReadOnlyMode: boolean;
  currentDirectoryPath: string | null;
  tagDelimiter: string;
}

const EntryProperties = (props: Props) => {
  // const EntryProperties = React.memo((props: Props) => {
  const fileNameRef = useRef<HTMLInputElement>(null);
  const fileDescriptionRef = useRef<HTMLInputElement>(null);
  const MB_ATTR =
    '<b>Leaflet</b> | Map data &copy; <b>https://openstreetmap.org/copyright</b> contributors, <b>CC-BY-SA</b>, Imagery © <b>Mapbox</b>';

  const parentDirectoryPath = extractContainingDirectoryPath(
    props.openedEntry.path,
    PlatformIO.getDirSeparator()
  );

  const customRenderer = new marked.Renderer();
  customRenderer.link = (href, title, text) => `
      <a href="#"
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

  // const tagMenuAnchorEl = null;
  // const [thumbPath, setThumbPath] = useState<string>(undefined);
  // const [originalName, setOriginalName] = useState<string>('');
  // const [description, setDescription] = useState<string>('');
  // const [size, setSize] = useState<number>(0);
  // const [color, setColor] = useState<string>('#3498db');
  // const [path, setPath] = useState<string>('');
  // const [ldtm, setLdtm] = useState<string>('');
  // const [tags, setTags] = useState<Array<Tag>>([]);
  // const [currentEntry, setCurrentEntry] = useState<FileSystemEntry>(undefined);
  // const [tagMenuAnchorEl, setTagMenuAnchorEl] = useState<boolean | null>(null);
  // const [tagMenuOpened, setTagMenuOpened] = useState<boolean | null>(false);
  // const [selectedTag, setSelectedTag] = useState<Tag>(null); // TODO enable selected Tag menu
  const [editName, setEditName] = useState<string>(undefined);
  const [editDescription, setEditDescription] = useState<string>(undefined);
  const [isMoveCopyFilesDialogOpened, setMoveCopyFilesDialogOpened] = useState<
    boolean
  >(false);
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
        renameFile(currentEntry.path, nextPath);
      } else {
        renameDirectory(currentEntry.path, editName);
      }

      // newName = '';
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
      props.showNotification(i18n.t('core:needProVersion'));
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
      return replaceThumbnailURLPromise(filePath, thumbFilePath)
        .then(objUrl => {
          // setThumbPath(objUrl.tmbPath);
          /* setCurrentEntry({
            ...currentEntry,
            thumbPath: objUrl.tmbPath
          }); */
          props.updateThumbnailUrl(currentEntry.path, objUrl.tmbPath);
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
        // setThumbPath(objUrl.tmbPath);
        /* setCurrentEntry({
          ...currentEntry,
          thumbPath: objUrl.tmbPath
        }); */
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

  // TODO
  /* const handleTagMenu = (event: any, tag: Tag) => {
    setTagMenuOpened(true);
    tagMenuAnchorEl = event.currentTarget;
    setSelectedTag(tag);
    /!* this.setState({
      tagMenuOpened: true,
      tagMenuAnchorEl: event.currentTarget,
      selectedTag: tag
    }); *!/
  }; */

  // const handleCloseTagMenu = () => setTagMenuOpened(false); // this.setState({ tagMenuOpened: false });

  const handleFileNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'name') {
      setEditName(value);
      // newName = value;
      /* setCurrentEntry({
        ...currentEntry,
        name: value
      }); */
      // this.setState({ name: value });
    }
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const { value, name } = target;

    if (name === 'description') {
      setEditDescription(value);
      // newDescription = value;
      /* setCurrentEntry({
        ...currentEntry,
        description: value
      }); */
      // this.setState({ description: value });
    }
  };

  const handleChange = (name: string, value: Array<Tag>, action: string) => {
    if (action === 'remove-value') {
      if (!value) {
        // no tags left in the select element
        props.removeAllTags([currentEntry.path]); // TODO return promise
        props.updateOpenedFile(currentEntry.path, { tags: [], changed: true });
      } else {
        /* const newTags = currentEntry.tags.filter(
          tag => value.findIndex(obj => obj.title === tag.title) === -1
        ); */

        props.removeTags([currentEntry.path], value);
        /* props.updateOpenedFile(
          currentEntry.path,
          { tags: newTags },
          currentEntry.isFile
        ); */
      }
    } else if (action === 'clear') {
      props.removeAllTags([currentEntry.path]);
      /* props.updateOpenedFile(
        currentEntry.path,
        { tags: [] },
        currentEntry.isFile
      ); */
    } else {
      // create-option or select-option
      value.map(tag => {
        if (
          currentEntry.tags === undefined ||
          currentEntry.tags.findIndex(obj => obj.title === tag.title) === -1
        ) {
          props.addTags([currentEntry.path], [tag]);

          /* props.updateOpenedFile(
            currentEntry.path,
            { tags: [...(currentEntry.tags ? currentEntry.tags : []), tag] },
            currentEntry.isFile
          ); */
        }
        return true;
      });
    }
  };

  const { classes, isReadOnlyMode } = props;

  if (!currentEntry || !currentEntry.path || currentEntry.path === '') {
    return <div />;
  }

  let thumbPath; // { thumbPath } = currentEntry;
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
  const thumbPathUrl = thumbPath
    ? 'url("' + thumbPath + '?' + new Date().getTime() + '")'
    : '';
  // if (AppConfig.isWin) {
  //   thumbPathUrl = thumbPathUrl.split('\\').join('\\\\');
  // }

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
      .then((entryMeta: FileSystemEntryMeta) => {
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
      icon = (
        <ListItemIcon>
          <DefaultPerspectiveIcon />
        </ListItemIcon>
      );
    } else if (perspective === perspectives.GALLERY) {
      icon = (
        <ListItemIcon>
          <GalleryPerspectiveIcon />
        </ListItemIcon>
      );
    } else if (perspective === perspectives.MAPIQUE) {
      icon = (
        <ListItemIcon>
          <MapiquePerspectiveIcon />
        </ListItemIcon>
      );
    } else if (perspective === perspectives.KANBAN) {
      icon = (
        <ListItemIcon>
          <KanBanPerspectiveIcon />
        </ListItemIcon>
      );
    }
    return (
      <MenuItem key={perspective} value={perspective}>
        {icon}
        <ListItemText
          primary={perspective.charAt(0).toUpperCase() + perspective.slice(1)}
        />
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

  function getGeoLocation(tags: Array<Tag>) {
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
                {i18n.t('core:editTagMasterName')}
              </Typography>
            </div>
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
                        color="primary"
                        className={classes.button}
                        onClick={deactivateEditNameField}
                      >
                        {i18n.t('core:cancel')}
                      </Button>
                      <Button
                        color="primary"
                        className={classes.button}
                        onClick={renameEntry}
                      >
                        {i18n.t('core:confirmSaveButton')}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      color="primary"
                      className={classes.button}
                      onClick={activateEditNameField}
                    >
                      {i18n.t('core:rename')}
                    </Button>
                  )}
                </div>
              )}
          </div>
          <FormControl fullWidth={true} className={classes.formControl}>
            <TextField
              InputProps={{
                readOnly: editName === undefined
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
              <TileLayer
                attribution={MB_ATTR}
                url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
              />
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
                      color="primary"
                      className={classes.button}
                      onClick={() => setEditDescription(undefined)}
                    >
                      {i18n.t('core:cancel')}
                    </Button>
                  )}
                  <Button
                    color="primary"
                    className={classes.button}
                    onClick={toggleEditDescriptionField}
                  >
                    {editDescription !== undefined
                      ? i18n.t('core:confirmSaveButton')
                      : i18n.t('core:edit')}
                  </Button>
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
                    backgroundColor: 'rgba(255, 216, 115, 0.53)'
                  }}
                  id="textarea"
                  placeholder=""
                  name="description"
                  className={styles.textField}
                  defaultValue={currentEntry.description}
                  fullWidth={true}
                  onChange={handleDescriptionChange}
                />
                <Typography variant="caption">
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
                  backgroundColor: 'rgba(255, 216, 115, 0.53)',
                  marginBottom: 5,

                  color: currentEntry.description
                    ? props.theme.palette.text.primary
                    : props.theme.palette.text.disabled
                }}
                role="button"
                id="descriptionArea"
                dangerouslySetInnerHTML={{
                  // eslint-disable-next-line no-nested-ternary
                  __html: currentEntry.description
                    ? marked(DOMPurify.sanitize(currentEntry.description))
                    : Pro
                    ? i18n.t('core:addMarkdownDescription')
                    : i18n.t('core:addDescription')
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

        <Grid item xs={12}>
          <div className={[classes.fluidGrid, classes.ellipsisText].join(' ')}>
            <div
              className={classes.gridItem}
              style={{ width: '50%', alignSelf: 'baseline' }}
            >
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

            {currentEntry.isFile ? (
              <div className={classes.gridItem} style={{ width: '50%' }}>
                <Typography
                  variant="caption"
                  className={classes.header}
                  style={{ display: 'block' }}
                >
                  {i18n.t('core:fileSize')}
                  <br />
                  <strong>{formatFileSize(currentEntry.size)}</strong>
                </Typography>
              </div>
            ) : (
              <div className={classes.gridItem} style={{ width: '50%' }}>
                <Typography
                  variant="caption"
                  style={{ display: 'block' }}
                  className={classes.header}
                >
                  {i18n.t('core:changeBackgroundColor')}
                </Typography>
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
                    />
                    <ColorPickerDialog
                      color={currentEntry.color}
                      open={displayColorPicker}
                      setColor={handleChangeColor}
                      onClose={toggleBackgroundColorPicker}
                      presetColors={[
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
                  </TransparentBackground>
                </FormControl>
              </div>
            )}
          </div>
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
            {currentEntry.isFile &&
              !isReadOnlyMode &&
              !currentEntry.editMode &&
              editName === undefined &&
              editDescription === undefined && (
                <Button
                  color="primary"
                  className={classes.button}
                  onClick={toggleMoveCopyFilesDialog}
                >
                  {i18n.t('core:move')}
                </Button>
              )}
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
                    {currentEntry.url ? (
                      <CloudLocationIcon />
                    ) : (
                      <LocationIcon />
                    )}
                  </InputAdornment>
                )
              }}
            />
          </FormControl>
        </Grid>

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
                <MenuItem key="unspecified" value="unspecified">
                  <ListItemIcon>
                    <LayersClearIcon />
                  </ListItemIcon>
                  <ListItemText primary={i18n.t('core:unspecified')} />
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
                <Button
                  color="primary"
                  className={classes.button}
                  onClick={toggleThumbFilesDialog}
                >
                  {i18n.t('core:changeThumbnail')}
                </Button>
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

      {/* {tagMenuOpened && (
        <EntryTagMenu
          anchorEl={tagMenuAnchorEl}
          open={tagMenuOpened}
          onClose={handleCloseTagMenu}
          selectedTag={selectedTag}
          currentEntryPath={currentEntry.path}
          removeTags={removeTags}
        />
      )} */}
      {isMoveCopyFilesDialogOpened && (
        <MoveCopyFilesDialog
          key={uuidv1()}
          open={isMoveCopyFilesDialogOpened}
          onClose={toggleMoveCopyFilesDialog}
          selectedFiles={[currentEntry.path]}
        />
      )}
      {ThumbnailChooserDialog && (
        <ThumbnailChooserDialog
          key={uuidv1()}
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
