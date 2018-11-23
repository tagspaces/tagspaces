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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
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
import { extractContainingDirectoryPath } from '../utils/paths';
import AppConfig from '../config';
import { Pro } from '../pro';
import PlatformIO from '../services/platform-io';
import TagsSelect from './TagsSelect';
import TaggingActions from '../reducers/tagging-actions';

const styles = theme => ({
  entryProperties: {
    overflowY: AppConfig.isFirefox ? 'auto' : 'overlay',
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
  editTagForEntry: () => void,
  onEditTags: () => void,
  renameFile: () => void,
  renameDirectory: () => void,
  normalizeShouldCopyFile: () => void,
  showNotification: () => void,
  addTags: () => void,
  removeTags: () => void,
  removeAllTags: () => void
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

    if (nextProps.entryPath && this.state.path !== nextProps.entryPath) {
      this.setState({ isEditDescription: false });
    }

    if (nextProps.shouldCopyFile) {
      this.setState({ isMoveCopyFilesDialogOpened: true });
    }
  }

  /* componentDidUpdate(prevProps, prevState) {
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
  } */

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
    if (!Pro.MetaOperations) {
      this.props.showNotification(i18n.t('Saving description not supported'));
      return;
    }
    if (this.state.isEditDescription) {
      Pro.MetaOperations.saveDescription(this.props.entryPath, this.state.description).then(() => {
        this.setState({
          isEditDescription: false
        });
        return true;
      }).catch((error) => {
        this.setState({
          isEditDescription: false
        });
        this.props.showNotification(i18n.t('Error saving description'));
      });
    } else {
      this.setState({
        isEditDescription: true
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

    /* this.setState({ //not needed addTags/removeTags/removeAllTags => reflectUpdateSidecarTags -> state is updated -> loadEntryProperties
      tags: value
    }); */
  };

  /* renderTags = (tag: Object) => (
    <TagContainer
      key={tag.id ? tag.id : tag.title}
      defaultTextColor={this.props.settings.tagTextColor}
      defaultBackgroundColor={this.props.settings.tagBackgroundColor}
      tag={tag}
      handleTagMenu={this.handleTagMenu}
    />
  ); */

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
    if (!path || path === '') {
      return <div />;
    }
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
                <TextField
                  disabled={!isEditName}
                  margin="dense"
                  name="name"
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

          <div className={classes.entryItem}>
            <div className={classes.fluidGrid}>
              <div className="grid-item">
                <Typography variant="caption">
                  {i18n.t('core:fileTags')}
                </Typography>
              </div>
              <div className="grid-item">
                {/* <Button
                  color="primary"
                  data-tid="ok"
                  className={classes.button}
                  onClick={onEditTags}
                >
                  {i18n.t('core:addEntryTags')}
                </Button> */}
              </div>
            </div>
            <Paper className={classes.tags}>
              <TagDropContainer entryPath={path}>
                <TagsSelect tagQuery={tags} handleChange={this.handleChange} />
              </TagDropContainer>
            </Paper>
          </div>

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
                  multiline
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
                <Typography
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
                >
                  {/* set dynamically HTML */}
                </Typography>
              )}
            </FormControl>
          </div>

          <div className={classes.entryItem}>
            <div className={classes.fluidGrid}>
              <Typography variant="caption" className={classes.entryLabel}>
                {i18n.t('core:filePath')}
              </Typography>
              <Button
                color="primary"
                styles={{ paddingBottom: 0 }}
                disabled={isEditDescription || isEditName}
                className={classes.button}
                onClick={this.toggleMoveCopyFilesDialog}
              >
                {i18n.t('core:move')}
              </Button>
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
            <div
              className={[classes.fluidGrid, classes.ellipsisText].join(' ')}
            >
              <div className="grid-item" style={{ width: '50%' }}>
                <div className={classes.fluidGrid}>
                  <Typography
                    variant="caption"
                    className={classes.entryLabel}
                  >
                    {i18n.t('core:fileLDTM')}
                  </Typography>
                </div>
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
                  <div className={classes.fluidGrid}>
                    <Typography
                      variant="caption"
                      className={classes.entryLabel}
                    >
                      {i18n.t('core:fileSize')}
                    </Typography>
                  </div>
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
              ) : false && (
                <div className="grid-item" style={{ width: '50%' }}>
                  <div className={classes.fluidGrid}>
                    <Typography
                      variant="caption"
                      className={classes.entryLabel}
                    >
                      {i18n.t('core:changeBackgroundColor')}
                    </Typography>
                    <div className="grid-item" style={{ padding: 2 }}>
                      <Button
                        className={[
                          classes.colorChooserButton,
                          classes.button
                        ].join(' ')}
                        style={{
                          backgroundColor: color,
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
            </div>
          </div>
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

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ addTags: TaggingActions.addTags, removeTags: TaggingActions.removeTags, removeAllTags: TaggingActions.removeAllTags }, dispatch);
}
export default withStyles(styles)(
  connect(undefined, mapDispatchToProps)(EntryProperties)
);
