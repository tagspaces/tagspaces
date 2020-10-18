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
import TagDropContainer from './TagDropContainer';
// import EntryTagMenu from './menus/EntryTagMenu';
import ColorPickerDialog from './dialogs/ColorPickerDialog';
import MoveCopyFilesDialog from './dialogs/MoveCopyFilesDialog';
import i18n from '../services/i18n';
import {
  FileSystemEntry,
  FileSystemEntryMeta,
  getAllPropertiesPromise
} from '-/services/utils-io';
import { formatFileSize } from '-/utils/misc';
import {
  extractContainingDirectoryPath,
  getThumbFileLocationForFile,
  getThumbFileLocationForDirectory
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
import { perspectives } from '-/reducers/app';
import { savePerspective } from '-/utils/metaoperations';

const ThumbnailChooserDialog =
  Pro && Pro.UI ? Pro.UI.ThumbnailChooserDialog : false;

const styles: any = (theme: any) => ({
  entryProperties: {
    overflowY: AppConfig.isFirefox ? 'auto' : 'overlay',
    padding: 10,
    height: '100%'
  },
  tags: {
    padding: '5px 5px 2px 2px',
    margin: 6,
    clear: 'both',
    // border: '1px dashed rgba(0,0,0,0.75)',
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
    alignItems: 'center',
    ' .grid-item': {
      width: '100%'
    }
  },
  ellipsisText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    padding: '0 2px 0 0'
  },
  formControl: {
    width: 'calc(100% - 12px)',
    marginBottom: 10
  }
});

const customRenderer = new marked.Renderer();
customRenderer.link = (href, title, text) =>
  `<a href="#" onClick="event.preventDefault();event.stopPropagation(); window.open('${href}', '_blank', 'nodeIntegration=no');return false;">${text}</a>`;

marked.setOptions({
  renderer: customRenderer,
  pedantic: false,
  gfm: true,
  tables: true,
  breaks: false,
  sanitize: true,
  smartLists: true,
  smartypants: false,
  xhtml: true
});

interface Props {
  classes: any;
  theme: any;
  // openedEntry: OpenedEntry;
  entryPath: string;
  perspective: string;
  // entryURL: string;
  // shouldReload: boolean | null;
  // shouldCopyFile: boolean;
  // editTagForEntry: () => void;
  renameFile: (path: string, nextPath: string) => void;
  renameDirectory: (path: string, nextPath: string) => void;
  // normalizeShouldCopyFile: () => void;
  showNotification: (message: string) => void;
  updateOpenedFile: (
    entryPath: string,
    fsEntryMeta: FileSystemEntryMeta,
    isFile: boolean
  ) => void;
  // reflectUpdateSidecarMeta: (path: string, entryMeta: Object) => void;
  updateThumbnailUrl: (path: string, thumbUrl: string) => void;
  addTags: (paths: Array<string>, tags: Array<Tag>) => void;
  removeTags: (paths: Array<string>, tags: Array<Tag>) => void;
  removeAllTags: (paths: Array<string>) => void;
  // resetState: (stateName: string) => void;
  isReadOnlyMode: boolean;
  // setPropertiesEditMode: (editMode: boolean) => void;
  currentDirectoryPath: string | null;
}

const EntryProperties = (props: Props) => {
  const fileName = useRef<HTMLInputElement>(null);
  const fileDescription = useRef<HTMLInputElement>(null);

  let newName = '';
  // const tagMenuAnchorEl = null;
  // const [name, setName] = useState<string>('');
  // const [originalName, setOriginalName] = useState<string>('');
  // const [description, setDescription] = useState<string>('');
  // const [size, setSize] = useState<number>(0);
  // const [color, setColor] = useState<string>('#3498db');
  // const [path, setPath] = useState<string>('');
  // const [ldtm, setLdtm] = useState<string>('');
  // const [tags, setTags] = useState<Array<Tag>>([]);
  const [currentEntry, setCurrentEntry] = useState<FileSystemEntry>(undefined);
  // const [tagMenuAnchorEl, setTagMenuAnchorEl] = useState<boolean | null>(null);
  // const [tagMenuOpened, setTagMenuOpened] = useState<boolean | null>(false);
  // const [selectedTag, setSelectedTag] = useState<Tag>(null); // TODO enable selected Tag menu
  const [isEditName, setEditName] = useState<boolean>(false);
  const [isEditDescription, setEditDescription] = useState<boolean>(false);
  const [isMoveCopyFilesDialogOpened, setMoveCopyFilesDialogOpened] = useState<
    boolean
  >(false);
  const [
    isFileThumbChooseDialogOpened,
    setFileThumbChooseDialogOpened
  ] = useState<boolean>(false);
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);
  // const [thumbPath, setThumbPath] = useState<string>('');

  useEffect(() => {
    if (props.entryPath) {
      loadEntryProperties(props.entryPath);
    }
  }, [props.entryPath]);

  /* useEffect(() => { // Rethink and move this Dialog in EntryContainer
    if (props.shouldCopyFile) {
      setMoveCopyFilesDialogOpened(true);
    }
  }, [props.shouldCopyFile]); */

  /* componentDidMount() {
    this.loadEntryProperties(this.props.entryPath);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (
      (nextProps.entryPath && nextProps.shouldReload) ||
      (nextProps.entryPath && this.state.path !== nextProps.entryPath)
      /!* (nextProps.openedFiles.length > 0 &&
        nextProps.openedFiles[0].shouldReload) *!/ // TODO rethink this and not reload all Properties at general !!
    ) {
      // eslint-disable-next-line react/destructuring-assignment
      // this.props.resetState('EntryPropertiesKey'); TODO rethink this
      this.loadEntryProperties(nextProps.entryPath);
    }

    if (nextProps.shouldCopyFile) {
      this.setState({ isMoveCopyFilesDialogOpened: true });
    }
  } */

  const loadEntryProperties = (entryPath: string) => {
    getAllPropertiesPromise(entryPath)
      .then((entryProps: FileSystemEntry) => {
        setCurrentEntry(entryProps);
        /* this.setState({
          isEditName: false,
          name: entryProps.name,
          path: entryProps.path,
          size: entryProps.size,
          tags: entryProps.tags,
          // @ts-ignore
          ldtm: entryProps.lmdt
            ? new Date(entryProps.lmdt)
                .toISOString()
                .substring(0, 19)
                .split('T')
                .join(' ')
            : '',
          color: entryProps.color,
          isFile: entryProps.isFile,
          description: entryProps.description ? entryProps.description : ''
        }); */
        return true;
      })
      .catch(error =>
        console.warn(
          'Error getting properties for entry: ' + entryPath + ' - ' + error
        )
      );
  };

  const renameEntry = () => {
    if (isEditName) {
      const { renameFile, renameDirectory } = props;

      const path = extractContainingDirectoryPath(
        currentEntry.path,
        PlatformIO.getDirSeparator()
      );
      const nextPath = path + PlatformIO.getDirSeparator() + newName;

      if (currentEntry.isFile) {
        renameFile(currentEntry.path, nextPath);
      } else {
        renameDirectory(currentEntry.path, newName);
      }

      newName = '';
      setEditName(false);
    }
  };

  const toggleEditNameField = () => {
    if (props.isReadOnlyMode) {
      setEditName(false);
      return;
    }
    if (isEditName) {
      setEditName(false);
      /* this.setState({
        isEditName: false,
        name: this.state.originalName
      }); */
    } else {
      setEditName(true);
      newName = currentEntry.name;
      /* this.setState(
        {
          isEditName: true,
          originalName: this.state.name
        },
        () => {
          fileName.focus();
          // this.props.setPropertiesEditMode(true);
          const { originalName } = this.state;
          if (originalName) {
            const indexOfBracket = originalName.indexOf(
              AppConfig.beginTagContainer
            );
            const indexOfDot = originalName.indexOf('.');
            let endRange = originalName.length;
            if (indexOfBracket > 0) {
              endRange = indexOfBracket;
            } else if (indexOfDot > 0) {
              endRange = indexOfDot;
            }
            fileName.setSelectionRange(0, endRange);
          }
        }
      ); */
    }
  };

  const toggleEditDescriptionField = () => {
    if (props.isReadOnlyMode) {
      setEditDescription(false);
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
    if (isEditDescription) {
      Pro.MetaOperations.saveDescription(
        currentEntry.path,
        currentEntry.description
      )
        .then(entryMeta => {
          setEditDescription(false);
          props.updateOpenedFile(
            currentEntry.path,
            entryMeta,
            currentEntry.isFile
          );
          return true;
        })
        .catch(error => {
          console.warn('Error saving description ' + error);
          setEditDescription(false);
          props.showNotification(i18n.t('Error saving description'));
        });
    } else {
      setEditDescription(true);
      /* this.setState(
        {
          isEditDescription: true
        },
        () => {
          // this.props.setPropertiesEditMode(true);
          if (fileDescription) { //TODO
            fileDescription.focus();
          }
        }
      ); */
    }
  };

  const toggleMoveCopyFilesDialog = () => {
    setMoveCopyFilesDialogOpened(!isMoveCopyFilesDialogOpened);
    /* this.setState(
      ({ isMoveCopyFilesDialogOpened }) => ({
        isMoveCopyFilesDialogOpened: !isMoveCopyFilesDialogOpened
      }),
      () => this.props.normalizeShouldCopyFile()
    ); */
  };

  const toggleThumbFilesDialog = () => {
    if (!Pro) {
      props.showNotification(i18n.t('core:needProVersion'));
      return true;
    }
    setFileThumbChooseDialogOpened(!isFileThumbChooseDialogOpened);
    /* this.setState(({ isFileThumbChooseDialogOpened }) => ({
      isFileThumbChooseDialogOpened: !isFileThumbChooseDialogOpened
    })); */
  };

  const setThumb = (filePath, thumbFilePath) => {
    if (filePath !== undefined) {
      return replaceThumbnailURLPromise(filePath, thumbFilePath)
        .then(objUrl => {
          setCurrentEntry({
            ...currentEntry,
            thumbPath: objUrl.tmbPath
          });
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
        setCurrentEntry({
          ...currentEntry,
          thumbPath: objUrl.tmbPath
        });
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
        props.updateOpenedFile(
          currentEntry.path,
          entryMeta,
          currentEntry.isFile
        );
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
      newName = value;
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
      setCurrentEntry({
        ...currentEntry,
        description: value
      });
      // this.setState({ description: value });
    }
  };

  const handleChange = (name: string, value: any, action: string) => {
    if (action === 'remove-value') {
      if (!value) {
        // no tags left in the select element
        props.removeAllTags([currentEntry.path]); // TODO return promise
        setCurrentEntry({
          ...currentEntry,
          tags: []
        });
        // this.setState({ tags: [] });
      } else {
        const tagsToRemove = [];
        const newTags = currentEntry.tags.map(tag => {
          if (value.findIndex(obj => obj.title === tag.title) === -1) {
            tagsToRemove.push(tag);
            return undefined;
          }
          return tag;
        });

        props.removeTags([currentEntry.path], tagsToRemove);
        setCurrentEntry({
          ...currentEntry,
          tags: newTags.filter(tag => tag !== undefined)
        });
      }
    } else if (action === 'clear') {
      props.removeAllTags([currentEntry.path]);
      setCurrentEntry({
        ...currentEntry,
        tags: []
      });
    } else {
      // create-option or select-option
      value.map(tag => {
        if (
          currentEntry.tags.findIndex(obj => obj.title === tag.title) === -1
        ) {
          props.addTags([currentEntry.path], [tag]);
          setCurrentEntry({
            ...currentEntry,
            tags: [...currentEntry.tags, tag]
          });
          // this.setState({ tags: [...tags, tag] });
        }
        return true;
      });
    }
  };

  const { classes, isReadOnlyMode } = props;

  if (!currentEntry || !currentEntry.path || currentEntry.path === '') {
    return <div />;
  }

  let { thumbPath } = currentEntry;
  if (!thumbPath) {
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
    // console.log(perspective);
    const perspective = event.target.value;
    savePerspective(currentEntry.path, perspective)
      .then((entryMeta: FileSystemEntryMeta) => {
        // if (props.entryPath === props.currentDirectoryPath) {
        props.updateOpenedFile(
          currentEntry.path,
          entryMeta,
          currentEntry.isFile
        );
        /* } else {
          setCurrentEntry({ ...currentEntry, perspective });
        } */
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
  } else if (props.perspective) {
    perspectiveDefault = props.perspective;
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

  // @ts-ignore
  return (
    <div className={classes.entryProperties}>
      <Grid container spacing={1}>
        <div className={classes.entryItem}>
          <div className={classes.fluidGrid}>
            <div className="grid-item">
              <Typography
                variant="caption"
                className={classes.header}
                style={{ display: 'block' }}
              >
                {i18n.t('core:editTagMasterName')}
              </Typography>
            </div>
            {!isReadOnlyMode && (
              <div>
                {isEditName ? (
                  <div className="grid-item">
                    <Button
                      color="primary"
                      className={classes.button}
                      onClick={toggleEditNameField}
                    >
                      {i18n.t('core:cancel')}
                    </Button>
                    <Button
                      color="primary"
                      disabled={isEditDescription}
                      className={classes.button}
                      onClick={renameEntry}
                    >
                      {i18n.t('core:confirmSaveButton')}
                    </Button>
                  </div>
                ) : (
                  <div className="grid-item">
                    <Button
                      color="primary"
                      disabled={isEditDescription}
                      className={classes.button}
                      onClick={toggleEditNameField}
                    >
                      {i18n.t('core:rename')}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          <FormControl fullWidth={true} className={classes.formControl}>
            <TextField
              InputProps={{
                readOnly: !isEditName
              }}
              margin="dense"
              name="name"
              fullWidth={true}
              data-tid="fileNameProperties"
              defaultValue={currentEntry.name}
              inputRef={fileName}
              onClick={() => {
                if (!isEditName) {
                  toggleEditNameField();
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
        </div>

        <div className={classes.entryItem}>
          <div className={classes.fluidGrid}>
            <div className="grid-item">
              <Typography
                variant="caption"
                className={classes.header}
                style={{ display: 'block' }}
              >
                {i18n.t('core:fileTags')}
              </Typography>
            </div>
            <div className="grid-item" />
          </div>
          <TagDropContainer entryPath={currentEntry.path}>
            <TagsSelect
              placeholderText={i18n.t('core:dropHere')}
              isReadOnlyMode={isReadOnlyMode}
              tags={currentEntry.tags}
              handleChange={handleChange}
            />
          </TagDropContainer>
        </div>

        <div className={classes.entryItem}>
          <div className={classes.fluidGrid}>
            <div className="grid-item">
              <Typography
                variant="caption"
                className={classNames(classes.header, classes.header)}
                style={{ display: 'block' }}
              >
                {i18n.t('core:filePropertiesDescription')}
              </Typography>
            </div>
            <div className="grid-item">
              {!isReadOnlyMode && (
                <div>
                  {isEditDescription && (
                    <Button
                      color="primary"
                      className={classes.button}
                      onClick={toggleEditDescriptionField}
                    >
                      {i18n.t('core:cancel')}
                    </Button>
                  )}
                  <Button
                    color="primary"
                    disabled={isEditName}
                    className={classes.button}
                    onClick={toggleEditDescriptionField}
                  >
                    {isEditDescription
                      ? i18n.t('core:confirmSaveButton')
                      : i18n.t('core:edit')}
                  </Button>
                </div>
              )}
            </div>
          </div>
          <FormControl fullWidth={true} className={classes.formControl}>
            {isEditDescription ? (
              <TextField
                multiline
                inputRef={fileDescription}
                style={{
                  padding: 10,
                  borderRadius: 5,
                  backgroundColor: 'rgba(255, 216, 115, 0.53)'
                }}
                id="textarea"
                placeholder=""
                name="description"
                className={styles.textField}
                value={currentEntry.description}
                fullWidth={true}
                onChange={handleDescriptionChange}
              />
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
                onClick={() => {
                  if (!isEditDescription) {
                    toggleEditDescriptionField();
                  }
                }}
              />
            )}
          </FormControl>
        </div>

        <div className={classes.entryItem}>
          <div className={[classes.fluidGrid, classes.ellipsisText].join(' ')}>
            <div
              className="grid-item"
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
              {/* <FormControl fullWidth={true} className={classes.formControl}>
                  <TextField
                    InputProps={{
                      readOnly: true
                    }}
                    margin="dense"
                    name="ldtm"
                    fullWidth={true}
                    data-tid="fileLdtmProperties"
                    value={ldtm}
                  />
                </FormControl> */}
            </div>

            {currentEntry.isFile ? (
              <div className="grid-item" style={{ width: '50%' }}>
                <Typography
                  variant="caption"
                  className={classes.header}
                  style={{ display: 'block' }}
                >
                  {i18n.t('core:fileSize')}
                  <br />
                  <strong>{formatFileSize(currentEntry.size)}</strong>
                </Typography>
                {/* <FormControl
                    fullWidth={true}
                    className={classes.formControl}
                    title={size + ' bytes'}
                  >
                    <TextField
                      margin="dense"
                      name="size"
                      InputProps={{
                        readOnly: true
                      }}
                      fullWidth={true}
                      data-tid="fileSizeProperties"
                      value={formatFileSize(size)}
                    />
                  </FormControl> */}
              </div>
            ) : (
              <div className="grid-item" style={{ width: '50%' }}>
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
        </div>

        <div className={classes.entryItem}>
          <div className={classes.fluidGrid}>
            <Typography
              variant="caption"
              className={classNames(classes.header)}
              style={{ display: 'block' }}
            >
              {i18n.t('core:filePath')}
            </Typography>
            {currentEntry.isFile && !isReadOnlyMode && (
              <Button
                color="primary"
                disabled={isEditDescription || isEditName}
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
        </div>

        {!currentEntry.isFile && (
          <div className={classes.entryItem}>
            <div className={classes.fluidGrid}>
              <Typography
                variant="caption"
                className={classNames(classes.header)}
                style={{ display: 'block' }}
              >
                {i18n.t('core:choosePerspective')}
              </Typography>
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
          </div>
        )}

        <div className={classes.entryItem}>
          <div className={classes.fluidGrid}>
            <Typography
              variant="caption"
              className={classNames(classes.header)}
              style={{ display: 'block' }}
            >
              {i18n.t('core:thumbnail')}
            </Typography>
            {!isReadOnlyMode && (
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
                display: 'block'
              }}
            />
          </div>
        </div>
        <div className={classes.entryItem}>
          <br />
        </div>
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

export default withStyles(styles, { withTheme: true })(EntryProperties);
