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
 * @flow
 */

import React, { Component } from 'react';
import uuidv1 from 'uuid';
import marked from 'marked';
import classNames from 'classnames';
// import { bindActionCreators } from 'redux';
// import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import DOMPurify from 'dompurify';
import TagDropContainer from './TagDropContainer';
import EntryTagMenu from './menus/EntryTagMenu';
import ColorPickerDialog from './dialogs/ColorPickerDialog';
import MoveCopyFilesDialog from './dialogs/MoveCopyFilesDialog';
import i18n from '../services/i18n';
import { getAllPropertiesPromise } from '../services/utils-io';
import { formatFileSize } from '../utils/misc';
import { extractContainingDirectoryPath, getThumbFileLocationForFile } from '../utils/paths';
import AppConfig from '../config';
import { Pro } from '../pro';
import TagsSelect from './TagsSelect';
import TransparentBackground from './TransparentBackground';
import { replaceThumbnailURLPromise, getThumbnailURLPromise } from '../services/thumbsgenerator';
// import { actions as AppActions } from '../reducers/app';

const ThumbnailChooserDialog = Pro && Pro.UI ? Pro.UI.ThumbnailChooserDialog : false;

const styles = theme => ({
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
  entryLabel: {
    padding: 4
  },
  header: {
    color: theme.palette.text.primary
  },
  field: {
    color: theme.palette.primary.contrastText + ' !important'
  },
  entryItem: {
    width: '100%',
    padding: 0
  },
  button: {
    position: 'relative',
    padding: '8px 12px 6px 8px',
    margin: '0 10px 0 0',
    cursor: 'pointer',
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
    padding: '0 0 0 4px',
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
    padding: '0 0 2px 6px'
  }
});

const customRenderer = new marked.Renderer();
// customRenderer.link = (href, title, text) => `<a href="javascript:window.open('${href}', '_blank', 'nodeIntegration=no')" target="_blank">${text}</a>`;
customRenderer.link = (href, title, text) => `<a href="#" onClick="event.preventDefault();event.stopPropagation(); window.open('${href}', '_blank', 'nodeIntegration=no');return false;">${text}</a>`;

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

type Props = {
  classes: Object,
  entryPath?: string | null,
  shouldReload?: boolean | null,
  settings: Object,
  shouldCopyFile?: boolean,
  editTagForEntry: () => void,
  renameFile: () => void,
  renameDirectory: () => void,
  normalizeShouldCopyFile: () => void,
  showNotification: () => void,
  reflectUpdateSidecarMeta: (path: string, entryMeta: Object) => void,
  updateThumbnailUrl: (path: string, thumbUrl: string) => void,
  addTags: () => void,
  removeTags: () => void,
  removeAllTags: () => void,
  resetState: () => void,
  showSelectDirectoryDialog: () => void,
  isReadOnlyMode: boolean,
  setPropertiesEditMode: (editMode: boolean) => void
};

type State = {
  name: string,
  originalName: string,
  description: string,
  color: string,
  path: string,
  tagMenuAnchorEl: boolean | null,
  tagMenuOpened: boolean | null,
  isEditTagDialogOpened: boolean | null,
  isDeleteTagDialogOpened: boolean,
  isFileThumbChooseDialogOpened: boolean,
  isEditName: boolean,
  isEditDescription: boolean,
  displayColorPicker: boolean,
  isFile: boolean
};

class EntryProperties extends Component<Props, State> {
  state = {
    name: '',
    originalName: '',
    description: '',
    size: '',
    color: '#3498db',
    path: '',
    tagMenuAnchorEl: null,
    tagMenuOpened: false,
    selectedTag: null,
    isEditTagDialogOpened: false,
    isDeleteTagDialogOpened: false,
    isEditName: false,
    isEditDescription: false,
    isMoveCopyFilesDialogOpened: false,
    isFileThumbChooseDialogOpened: false,
    displayColorPicker: false,
    isFile: false
  };

  componentWillMount() {
    this.loadEntryProperties(this.props.entryPath);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (
      (nextProps.entryPath && nextProps.shouldReload) ||
      (nextProps.entryPath && this.state.path !== nextProps.entryPath)
    ) {
      this.props.resetState('EntryPropertiesKey');
      this.loadEntryProperties(nextProps.entryPath);
    }

    if (nextProps.shouldCopyFile) {
      this.setState({ isMoveCopyFilesDialogOpened: true });
    }
  }

  loadEntryProperties = (entryPath) => {
    getAllPropertiesPromise(entryPath).then(entryProps => {
      this.setState({
        isEditName: false,
        name: entryProps.name,
        path: entryProps.path,
        size: entryProps.size,
        tags: entryProps.tags,
        ldtm: entryProps.lmdt ? new Date(entryProps.lmdt)
          .toISOString()
          .substring(0, 19)
          .split('T')
          .join(' ') : '',
        color: entryProps.color,
        isFile: entryProps.isFile,
        description: entryProps.description ? entryProps.description : ''
      });
      return true;
    })
      .catch(error =>
        console.warn('Error getting properties for entry: ' + entryPath + ' - ' + error)
      );
  }

  renameEntry = () => {
    if (this.state.isEditName) {
      const { name, isFile } = this.state;
      const { entryPath, renameFile, renameDirectory } = this.props;

      const path = extractContainingDirectoryPath(entryPath);
      const nextPath = path + AppConfig.dirSeparator + name;

      this.setState(
        {
          isEditName: false,
          originalName: ''
        },
        () => {
          if (isFile) {
            renameFile(entryPath, nextPath);
          } else {
            renameDirectory(entryPath, name);
          }
        }
      );
    }
  };

  toggleEditNameField = () => {
    if (this.props.isReadOnlyMode) {
      this.setState({
        isEditName: false
      });
      return;
    }
    if (this.state.isEditName) {
      this.setState({
        isEditName: false,
        name: this.state.originalName
      }, () => {
        this.props.setPropertiesEditMode(false);
      });
    } else {
      this.setState({
        isEditName: true,
        originalName: this.state.name
      }, () => {
        this.fileName.focus();
        this.props.setPropertiesEditMode(true);
        const { originalName } = this.state;
        if (originalName) {
          const indexOfBracket = originalName.indexOf(AppConfig.beginTagContainer);
          const indexOfDot = originalName.indexOf('.');
          let endRange = originalName.length;
          if (indexOfBracket > 0) {
            endRange = indexOfBracket;
          } else if (indexOfDot > 0) {
            endRange = indexOfDot;
          }
          this.fileName.setSelectionRange(0, endRange);
        }
      });
    }
  };

  toggleEditDescriptionField = () => {
    if (this.props.isReadOnlyMode) {
      this.setState({
        isEditDescription: false
      });
      return;
    }
    if (!Pro) {
      this.props.showNotification(i18n.t('core:thisFunctionalityIsAvailableInPro'));
      return;
    }
    if (!Pro.MetaOperations) {
      this.props.showNotification(i18n.t('Saving description not supported'));
      return;
    }
    if (this.state.isEditDescription) {
      Pro.MetaOperations.saveDescription(this.props.entryPath, this.state.description).then((entryMeta) => {
        this.setState({
          isEditDescription: false
        }, () => {
          this.props.setPropertiesEditMode(false);
          this.props.reflectUpdateSidecarMeta(this.props.entryPath, entryMeta);
        });
        return true;
      }).catch((error) => {
        console.warn('Error saving description ' + error);
        this.setState({
          isEditDescription: false
        });
        this.props.showNotification(i18n.t('Error saving description'));
      });
    } else {
      this.setState({
        isEditDescription: true
      }, () => {
        this.props.setPropertiesEditMode(true);
        if (this.fileDescription) {
          this.fileDescription.focus();
        }
      });
    }
  };

  toggleMoveCopyFilesDialog = () => {
    this.setState(
      ({ isMoveCopyFilesDialogOpened }) => ({
        isMoveCopyFilesDialogOpened: !isMoveCopyFilesDialogOpened
      }),
      () => this.props.normalizeShouldCopyFile()
    );
  };

  toggleThumbFilesDialog = () => {
    if (!Pro) {
      this.props.showNotification(i18n.t('core:needProVersion'));
      return true;
    }
    this.setState(
      ({ isFileThumbChooseDialogOpened }) => ({
        isFileThumbChooseDialogOpened: !isFileThumbChooseDialogOpened
      })
    );
  };

  setThumb = (filePath, thumbFilePath) => {
    if (filePath !== undefined) {
      return replaceThumbnailURLPromise(filePath, thumbFilePath).then((objUrl) => {
        this.setState({ thumbPath: objUrl.tmbPath });
        this.props.updateThumbnailUrl(this.props.entryPath, objUrl.tmbPath);
        return true;
      }).catch(err => {
        console.warn('Error replaceThumbnailURLPromise ' + err);
        this.props.showNotification('Error replace Thumbnail');
      });
    }
    // reset Thumbnail
    return getThumbnailURLPromise(this.props.entryPath).then((objUrl) => {
      this.setState({ thumbPath: objUrl.tmbPath });
      this.props.updateThumbnailUrl(this.props.entryPath, objUrl.tmbPath);
      return true;
    }).catch(err => {
      console.warn('Error getThumbnailURLPromise ' + err);
      this.props.showNotification('Error reset Thumbnail');
    });
  };

  saveEditDescription = () => {
    this.setState({ isEditDescription: false });
  };

  toggleBackgroundColorPicker = () => {
    if (this.props.isReadOnlyMode) {
      return;
    }
    if (!Pro) {
      this.props.showNotification(i18n.t('core:thisFunctionalityIsAvailableInPro'));
      return;
    }
    if (!Pro.MetaOperations) {
      this.props.showNotification(i18n.t('Saving color not supported'));
      return;
    }
    this.setState({
      displayColorPicker: !this.state.displayColorPicker
    });
  };

  handleChangeColor = color => {
    this.setState({ color }, () => {
      Pro.MetaOperations.saveColor(this.props.entryPath, this.state.color).then((entryMeta) => {
        this.props.reflectUpdateSidecarMeta(this.props.entryPath, entryMeta);
        return true;
      }).catch((error) => {
        console.warn('Error saving color for folder ' + error);
        this.props.showNotification(i18n.t('Error saving color for folder'));
      });
    });
  };

  handleTagMenu = (event: Object, tag, tagGroup) => {
    this.setState({
      tagMenuOpened: true,
      tagMenuAnchorEl: event.currentTarget,
      selectedTagGroupEntry: tagGroup,
      selectedTag: tag
    });
  };

  handleCloseTagMenu = () => this.setState({ tagMenuOpened: false });

  handleInputChange = (event: Object) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({ [name]: value });
  };

  handleChange = (name, value, action) => {
    if (action === 'remove-value') {
      this.state.tags.map((tag) => {
        if (value.findIndex(obj => obj.title === tag.title) === -1) {
          this.props.removeTags([this.state.path], [tag]);
        }
        return tag;
      });
    } else if (action === 'clear') {
      this.props.removeAllTags([this.state.path]);
    } else { // create-option or select-option
      value.map((tag) => {
        if (this.state.tags.findIndex(obj => obj.title === tag.title) === -1) {
          this.props.addTags([this.state.path], [tag]);
        }
        return tag;
      });
    }
  };

  render() {
    const {
      classes,
      entryPath,
      removeTags,
      editTagForEntry,
      isReadOnlyMode
    } = this.props;
    const {
      path,
      tags,
      size,
      ldtm,
      color,
      isEditName,
      isFile,
      isEditDescription,
      name,
      description,
      displayColorPicker,
      tagMenuAnchorEl,
      tagMenuOpened,
      selectedTag,
      isMoveCopyFilesDialogOpened,
      isFileThumbChooseDialogOpened
    } = this.state;
    let { thumbPath } = this.state;
    if (!path || path === '') {
      return <div />;
    }

    if (thumbPath === undefined) {
      if (this.state.isFile) {
        thumbPath = getThumbFileLocationForFile(path);
      } else {
        thumbPath = path +
          AppConfig.dirSeparator +
          AppConfig.metaFolder +
          AppConfig.dirSeparator +
          AppConfig.folderThumbFile;
      }
    }
    let thumbPathUrl = thumbPath ? 'url("' + thumbPath + '?' + new Date().getTime() + '")' : '';
    if (AppConfig.isWin) {
      thumbPathUrl = thumbPathUrl.split('\\').join('\\\\');
    }

    return (
      <div className={classes.entryProperties}>
        <Grid container spacing={1}>
          {/* edit file name */}
          <div className={classes.entryItem}>
            <div className={classes.fluidGrid}>
              <div className="grid-item">
                <Typography variant="caption" className={classes.header} style={{ display: 'block' }}>
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
                        onClick={this.toggleEditNameField}
                      >
                        {i18n.t('core:cancel')}
                      </Button>
                      <Button
                        color="primary"
                        disabled={isEditDescription}
                        className={classes.button}
                        onClick={this.renameEntry}
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
                        onClick={this.toggleEditNameField}
                      >
                        {i18n.t('core:rename')}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <FormControl fullWidth={true} className={classes.formControl}>
              <div className={classes.ellipsisText}>
                <TextField
                  disabled={!isEditName}
                  margin="dense"
                  name="name"
                  fullWidth={true}
                  data-tid="fileNameProperties"
                  value={name}
                  inputRef={(ref) => { this.fileName = ref; }}
                  className={classes.field}
                  onClick={() => {
                    if (!isEditName) {
                      this.toggleEditNameField();
                    }
                  }}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      this.renameEntry();
                    }
                  }}
                  onChange={e => this.handleInputChange(e)}
                />
              </div>
            </FormControl>
          </div>

          <div className={classes.entryItem}>
            <div className={classes.fluidGrid}>
              <div className="grid-item">
                <Typography variant="caption" className={classes.header} style={{ display: 'block' }}>
                  {i18n.t('core:fileTags')}
                </Typography>
              </div>
              <div className="grid-item" />
            </div>
            <Paper elevation={2} className={classes.tags}>
              <TagDropContainer entryPath={path}>
                <TagsSelect isReadOnlyMode={isReadOnlyMode} tags={tags} handleChange={this.handleChange} />
              </TagDropContainer>
            </Paper>
          </div>

          <div className={classes.entryItem}>
            <div className={classes.fluidGrid}>
              <div className="grid-item">
                <Typography variant="caption" className={classNames(classes.entryLabel, classes.header)} style={{ display: 'block' }}>
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
                        onClick={this.toggleEditDescriptionField}
                      >
                        {i18n.t('core:cancel')}
                      </Button>
                    )}
                    <Button
                      color="primary"
                      disabled={isEditName}
                      className={classes.button}
                      onClick={this.toggleEditDescriptionField}
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
                  inputRef={(ref) => { this.fileDescription = ref; }}
                  disabled={!isEditDescription}
                  id="textarea"
                  placeholder=""
                  name="description"
                  className={styles.textField}
                  value={description}
                  fullWidth={true}
                  onChange={e => this.handleInputChange(e)}
                />
              ) : (
                <Paper elevation={2} style={{ padding: 5 }}>
                  <Typography
                    className={classes.header}
                    style={{ display: 'block' }}
                    role="button"
                    id="descriptionArea"
                    placeholder={Pro ? 'Click to add description' : i18n.t('core:addDescription')}
                    dangerouslySetInnerHTML={{
                      __html:
                        description !== ''
                          ? marked(DOMPurify.sanitize(description))
                          : Pro ? 'Click to add description' : i18n.t('core:addDescription')
                    }}
                    onClick={() => {
                      if (!isEditDescription) {
                        this.toggleEditDescriptionField();
                      }
                    }}
                  />
                </Paper>
              )}
            </FormControl>
          </div>

          <div className={classes.entryItem}>
            <div
              className={[classes.fluidGrid, classes.ellipsisText].join(' ')}
            >
              <div className="grid-item" style={{ width: '50%' }}>
                <Typography
                  variant="caption"
                  className={classNames(classes.entryLabel, classes.header)}
                  style={{ display: 'block' }}
                >
                  {i18n.t('core:fileLDTM')}
                </Typography>
                <FormControl fullWidth={true} className={classes.formControl}>
                  <TextField
                    disabled
                    margin="dense"
                    name="ldtm"
                    fullWidth={true}
                    data-tid="fileLdtmProperties"
                    value={ldtm}
                    className={classes.field}
                  />
                </FormControl>
              </div>

              { isFile ? (
                <div className="grid-item" style={{ width: '50%' }}>
                  <Typography
                    variant="caption"
                    className={classNames(classes.entryLabel, classes.header)}
                    style={{ display: 'block' }}
                  >
                    {i18n.t('core:fileSize')}
                  </Typography>
                  <FormControl
                    fullWidth={true}
                    className={classes.formControl}
                    title={size + ' bytes'}
                  >
                    <TextField
                      margin="dense"
                      name="size"
                      disabled
                      fullWidth={true}
                      data-tid="fileSizeProperties"
                      className={classes.field}
                      value={formatFileSize(size)}
                    />
                  </FormControl>
                </div>
              ) : (
                <div className="grid-item" style={{ width: '50%' }}>
                  <Typography
                    variant="caption"
                    style={{ display: 'block' }}
                    className={classNames(classes.entryLabel, classes.header)}
                  >
                    {i18n.t('core:changeBackgroundColor')}
                  </Typography>
                  <FormControl
                    fullWidth={true}
                    className={classes.formControl}
                  >
                    <TransparentBackground>
                      <Button
                        fullWidth={true}
                        className={[
                          classes.colorChooserButton,
                          classes.button
                        ].join(' ')}
                        style={{
                          backgroundColor: color,
                        }}
                        onClick={this.toggleBackgroundColorPicker}
                      />
                      <ColorPickerDialog
                        color={color}
                        open={displayColorPicker}
                        setColor={this.handleChangeColor}
                        onClose={this.toggleBackgroundColorPicker}
                        presetColors={[
                          '#FFFFFF44', '#00000044', '#ac725e44', '#f83a2244', '#fa573c44',
                          '#ff753744', '#ffad4644', '#42d69244', '#00800044', '#7bd14844',
                          '#fad16544', '#92e1c044', '#9fe1e744', '#9fc6e744', '#4986e744',
                          '#9a9cff44', '#c2c2c244', '#cca6ac44', '#f691b244', '#cd74e644', '#a47ae244'
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
              <Typography variant="caption" className={classNames(classes.entryLabel, classes.header)} style={{ display: 'block' }}>
                {i18n.t('core:filePath')}
              </Typography>
              {isFile && !isReadOnlyMode && (
                <Button
                  color="primary"
                  // style={{ paddingBottom: 0 }}
                  disabled={isEditDescription || isEditName}
                  className={classes.button}
                  onClick={this.toggleMoveCopyFilesDialog}
                >
                  {i18n.t('core:move')}
                </Button>
              )}
            </div>
            <FormControl fullWidth={true} className={classes.formControl}>
              <TextField
                margin="dense"
                disabled
                name="path"
                fullWidth={true}
                data-tid="filePathProperties"
                className={classes.field}
                value={entryPath || ''}
              />
            </FormControl>
          </div>

          <div className={classes.entryItem}>
            <div className={classes.fluidGrid}>
              <Typography variant="caption" className={classNames(classes.entryLabel, classes.header)} style={{ display: 'block' }}>
                {i18n.t('core:thumbnail')}
              </Typography>
              {!isReadOnlyMode && (
                <Button
                  color="primary"
                  className={classes.button}
                  onClick={this.toggleThumbFilesDialog}
                >
                  {i18n.t('core:changeThumbnail')}
                </Button>
              )}
            </div>
            <div className={classes.fluidGrid}>
              <div
                className={classNames(classes.entryLabel, classes.header)}
                onClick={this.toggleThumbFilesDialog}
                role="button"
                tabIndex="0"
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
          <div className={classes.entryItem}><br /></div>
        </Grid>

        <EntryTagMenu
          anchorEl={tagMenuAnchorEl}
          open={tagMenuOpened}
          onClose={this.handleCloseTagMenu}
          selectedTag={selectedTag}
          currentEntryPath={entryPath}
          removeTags={removeTags}
          editTagForEntry={editTagForEntry}
        />
        <MoveCopyFilesDialog
          key={uuidv1()}
          open={isMoveCopyFilesDialogOpened}
          onClose={this.toggleMoveCopyFilesDialog}
          selectedFiles={[entryPath]}
        />
        {ThumbnailChooserDialog && (
          <ThumbnailChooserDialog
            key={uuidv1()}
            open={isFileThumbChooseDialogOpened}
            onClose={this.toggleThumbFilesDialog}
            selectedFile={thumbPath}
            setThumb={this.setThumb}
          />
        )}
      </div>
    );
  }
}

export default withStyles(styles)(EntryProperties);
