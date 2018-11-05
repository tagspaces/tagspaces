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
import marked from 'marked';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TagContainer from './TagContainer';
import TagDropContainer from './TagDropContainer';
import EntryTagMenu from './menus/EntryTagMenu';
import ColorPickerDialog from './dialogs/ColorPickerDialog';
import MoveCopyFilesDialog from './dialogs/MoveCopyFilesDialog';
import i18n from '../services/i18n';
import { getAllPropertiesPromise } from '../services/utils-io';
import { formatFileSize } from '../utils/misc';
import { extractContainingDirectoryPath } from '../utils/paths';
import AppConfig from '../config';
import { Pro } from '../pro';
import PlatformIO from '../services/platform-io';

const styles = theme => ({
  entryProperties: {
    overflowY: 'overlay',
    padding: 10
  },
  tags: {
    padding: '5px 5px 2px 2px',
    margin: 6,
    clear: 'both',
    border: '1px dashed rgba(0,0,0,0.75)',
    boxShadow: '0 1px 1px 0 rgba(0,0,0,0.16),0 1px 1px 0 rgba(239,239,239,0.12)'
  },
  editTagsButton: {
    float: 'right',
    margin: '0 0 10px 0'
  },
  colorChooserButton: {
    width: 30,
    border: '1px solid lightgray'
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
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
    padding: '4px 4px 4px 0'
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
    bottom: 2,
    padding: '8px 12px 6px 8px',
    margin: '0 10px 0 0',
    cursor: 'pointer',
    // backgroundColor: 'rgba(239, 239, 239, 0.65)'
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

function handleExternalLinks(event) { // TODO move to misc
  event.preventDefault();
  event.stopPropagation();
  console.log(event.currentTarget.href);

  // TODO evtl. use openFileNatively from app.js
  PlatformIO.openUrl(event.currentTarget.href);
}

type Props = {
  classes: Object,
  entryPath?: string | null,
  shouldReload?: boolean | null,
  settings: Object,
  shouldCopyFile?: boolean,
  removeTags: () => void,
  editTagForEntry: () => void,
  onEditTags: () => void,
  renameFile: () => void,
  renameDirectory: () => void,
  normalizeShouldCopyFile: () => void,
  showNotification: () => void
};

type State = {
  name?: string | null,
  originalName?: string | null,
  description?: string | null,
  color?: string,
  path?: string | null,
  tagMenuAnchorEl?: boolean | null,
  tagMenuOpened?: boolean | null,
  isEditTagDialogOpened?: boolean | null,
  isDeleteTagDialogOpened?: boolean | null,
  isEditName?: boolean | null,
  isEditDescription?: boolean | null,
  isFile?: boolean
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
      this.loadEntryProperties(nextProps.entryPath);
    }

    if (nextProps.shouldCopyFile) {
      this.setState({ isMoveCopyFilesDialogOpened: true });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.description == null || this.state.description !== prevState.description) {
      const links = document.querySelectorAll('#descriptionArea a');
      links.forEach((link) => {
        link.addEventListener('click', handleExternalLinks, false);
      });
    }
  }

  componentWillUnmount() {
    if (this.state.description) {
      const links = document.querySelectorAll('#descriptionArea a');
      links.forEach((link) => {
        link.removeEventListener('click', handleExternalLinks);
      });
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
        ldtm: new Date(entryProps.lmdt)
          .toISOString()
          .substring(0, 19)
          .split('T')
          .join(' '),
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
    if (this.state.isEditName) {
      this.setState({
        isEditName: false,
        name: this.state.originalName
      });
    } else {
      this.setState({
        isEditName: true,
        originalName: this.state.name
      });
    }
  };

  toggleEditDescriptionField = () => {
    if (!Pro) {
      this.props.showNotification(i18n.t('core:thisFunctionalityIsAvailableInPro'));
      return;
    }
    this.setState(prevState => ({
      isEditDescription: !prevState.isEditDescription
    }));
  };

  toggleMoveCopyFilesDialog = () => {
    this.setState(
      ({ isMoveCopyFilesDialogOpened }) => ({
        isMoveCopyFilesDialogOpened: !isMoveCopyFilesDialogOpened
      }),
      () => this.props.normalizeShouldCopyFile()
    );
  };

  saveEditDescription = () => {
    this.setState({ isEditDescription: false });
  };

  toggleBackgroundColorPicker = () => {
    this.setState(prevState => ({
      displayColorPicker: !prevState.displayColorPicker
    }));
  };

  handleChangeColor = color => this.setState({ color });

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

  renderTags = (tag: Object) => (
    <TagContainer
      key={tag.title}
      defaultTextColor={this.props.settings.tagTextColor}
      defaultBackgroundColor={this.props.settings.tagBackgroundColor}
      tag={tag}
      handleTagMenu={this.handleTagMenu}
    />
  );

  render() {
    const {
      classes,
      entryPath,
      onEditTags,
      removeTags,
      editTagForEntry,
      copyFiles,
      moveFiles
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
      isMoveCopyFilesDialogOpened
    } = this.state;

    return (
      <div className={classes.entryProperties}>
        <Grid container spacing={8}>
          {/* edit file name */}
          <div className={classes.entryItem}>
            <div className={classes.fluidGrid}>
              <div className="grid-item">
                <Typography variant="caption">
                  {i18n.t('core:editTagMasterName')}
                </Typography>
              </div>
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
            <FormControl fullWidth={true} className={classes.formControl}>
              <div className={classes.ellipsisText}>
                <Input
                  disabled={!isEditName}
                  autoFocus
                  required
                  margin="dense"
                  name="name"
                  label={i18n.t('core:fileName')}
                  fullWidth={true}
                  data-tid="fileNameProperties"
                  value={name}
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

          {/* edit tags */}
          <div className={classes.entryItem}>
            <div className={classes.fluidGrid}>
              <div className="grid-item">
                <Typography variant="caption">
                  {i18n.t('core:fileTags')}
                </Typography>
              </div>
              <div className="grid-item">
                <Button
                  color="primary"
                  data-tid="ok"
                  className={classes.button}
                  onClick={onEditTags}
                >
                  {i18n.t('core:addEntryTags')}
                </Button>
              </div>
            </div>
            <Paper className={classes.tags}>
              <TagDropContainer entryPath={path}>
                {tags && tags.length > 0 ? (
                  tags.map(this.renderTags)
                ) : (
                  <div className={classes.dropText}>
                    {i18n.t('core:dropHere')}
                  </div>
                )}
              </TagDropContainer>
            </Paper>
          </div>

          {/* edit description */}
          <div className={classes.entryItem}>
            <div className={classes.fluidGrid}>
              <div className="grid-item">
                <Typography variant="caption" className={classes.entryLabel}>
                  {i18n.t('core:filePropertiesDescription')}
                </Typography>
              </div>
              <div className="grid-item">
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
            </div>
            <FormControl fullWidth={true} className={classes.formControl}>
              {isEditDescription ? (
                <TextField
                  autoFocus
                  multiline
                  disabled={!isEditDescription}
                  id="textarea"
                  placeholder={i18n.t('core:addDescription')}
                  name="description"
                  className={styles.textField}
                  value={
                    !isEditDescription
                      ? marked.inlineLexer(description, [])
                      : description
                  }
                  fullWidth={true}
                  onChange={e => this.handleInputChange(e)}
                />
              ) : (
                <Typography
                  role="button"
                  id="descriptionArea"
                  dangerouslySetInnerHTML={{
                    __html:
                      description !== ''
                        ? marked(description)
                        : i18n.t('core:addDescription')
                  }}
                  onClick={() => {
                    if (!isEditDescription) {
                      this.toggleEditDescriptionField();
                    }
                  }}
                >
                  {/* set dynamically HTML */}
                </Typography>
              )}
            </FormControl>
          </div>

          {/* edit path */}
          <div className={classes.entryItem}>
            <div className={classes.fluidGrid}>
              <div className="grid-item">
                <Typography variant="caption" className={classes.entryLabel}>
                  {i18n.t('core:filePath')}
                </Typography>
              </div>
              <div className="grid-item">
                <Button
                  color="primary"
                  disabled={isEditDescription || isEditName}
                  className={classes.button}
                  onClick={this.toggleMoveCopyFilesDialog}
                >
                  {i18n.t('core:move')}
                </Button>
              </div>
            </div>
            <FormControl fullWidth={true} className={classes.formControl}>
              <div className={classes.ellipsisText}>
                <Input
                  disabled={true}
                  autoFocus
                  required
                  margin="dense"
                  name="path"
                  label={i18n.t('core:filePath')}
                  fullWidth={true}
                  data-tid="filePathProperties"
                  className={classes.field}
                  value={entryPath || ''}
                  onChange={e => this.handleInputChange(e)}
                />
              </div>
            </FormControl>
          </div>

          <div className={classes.entryItem}>
            <div
              className={[classes.fluidGrid, classes.ellipsisText].join(' ')}
            >
              {/* date modified */}
              <div className="grid-item" style={{ width: '50%' }}>
                <div className={classes.fluidGrid}>
                  <div className="grid-item">
                    <Typography
                      variant="caption"
                      className={classes.entryLabel}
                    >
                      {i18n.t('core:fileLDTM')}
                    </Typography>
                  </div>
                </div>
                <FormControl fullWidth={true} className={classes.formControl}>
                  <Input
                    disabled={true}
                    autoFocus
                    required
                    margin="dense"
                    name="ldtm"
                    label={i18n.t('core:fileLDTM')}
                    fullWidth={true}
                    data-tid="fileLdtmProperties"
                    value={ldtm}
                    className={classes.field}
                  />
                </FormControl>
              </div>

              {/* size */}
              { isFile && (
                <div className="grid-item" style={{ width: '50%' }}>
                  <div className={classes.fluidGrid}>
                    <div className="grid-item">
                      <Typography
                        variant="caption"
                        className={classes.entryLabel}
                      >
                        {i18n.t('core:fileSize')}
                      </Typography>
                    </div>
                  </div>
                  <FormControl
                    fullWidth={true}
                    className={classes.formControl}
                    title={size + ' bytes'}
                  >
                    <Input
                      disabled={true}
                      autoFocus
                      required
                      margin="dense"
                      name="size"
                      label={i18n.t('core:fileSize')}
                      fullWidth={true}
                      data-tid="fileSizeProperties"
                      className={classes.field}
                      value={formatFileSize(size)}
                    />
                  </FormControl>
                </div>
              )}
            </div>
          </div>

          {false && (/* background color only for folders */
            <div className={classes.entryItem}>
              <div className={classes.fluidGrid}>
                <div className="grid-item">
                  <Typography variant="caption" className={classes.entryLabel}>
                    {i18n.t('core:changeBackgroundColor')}
                  </Typography>
                </div>
                <div className="grid-item" style={{ padding: 2 }}>
                  <Button
                    className={[
                      classes.colorChooserButton,
                      classes.button
                    ].join(' ')}
                    style={{
                      backgroundColor: color || '#3498db',
                      width: 100,
                      margin: '0 8px 0 0'
                    }}
                    onClick={this.toggleBackgroundColorPicker}
                  >
                    &nbsp;
                  </Button>
                  <div style={classes.color} />
                  <ColorPickerDialog
                    color={color}
                    open={displayColorPicker}
                    setColor={this.handleChangeColor}
                    onClose={this.toggleBackgroundColorPicker}
                  />
                </div>
              </div>
            </div>
          )}
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
          open={isMoveCopyFilesDialogOpened}
          onClose={this.toggleMoveCopyFilesDialog}
          selectedFiles={[entryPath]}
        />
      </div>
    );
  }
}

export default withStyles(styles)(EntryProperties);
